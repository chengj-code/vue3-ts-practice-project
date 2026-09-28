import { onBeforeUnmount, ref } from 'vue'
import { MockWebSocket } from '@/mock/websocket'
import type { MockMessage } from '@/mock/websocket'

/**
 * useWebSocket：WebSocket 连接状态机（连接 / 心跳保活 / 断线自动重连 / 消息分发）
 *
 * 状态流转：
 *   connecting → open（onopen 后启动心跳保活）
 *   open →（pong 超时判定假死 / 服务端宕机）→ onclose
 *   onclose → manualClosed ? closed : reconnecting → connect()（循环，带次数上限）
 *
 * 三个定时器 + 一个标志位：
 *   heartbeatTimer  心跳发送循环（interval）
 *   pongTimer       单次 pong 等待超时（每次发 ping 重置）——心跳的意义在「确认对面活着」，不只是「发」
 *   reconnectTimer  重连等待
 *   manualClosed    区分「用户主动关闭」与「异常断开」：只有后者才重连，
 *                   否则用户离开页面/登出后客户端会在后台无限重连
 */

export type WsStatus = 'connecting' | 'open' | 'reconnecting' | 'closed'

export interface UseWebSocketOptions {
  /** 心跳发送间隔，默认 5s */
  heartbeatInterval?: number
  /** 等待 pong 的超时，超过判定连接假死并主动断开重连，默认 2s */
  pongTimeout?: number
  /** 重连等待间隔，默认 3s */
  reconnectInterval?: number
  /** 重连次数上限，超过置为 closed 并放弃，默认 10 */
  maxReconnect?: number
  /** 业务推送回调（pong 不走这里）：页面用它弹 Notification */
  onMessage?: (msg: MockMessage) => void
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    heartbeatInterval = 5000,
    pongTimeout = 2000,
    reconnectInterval = 3000,
    maxReconnect = 10,
    onMessage,
  } = options

  /** 连接状态：驱动页面状态徽标 */
  const status = ref<WsStatus>('connecting')
  /** 收到的业务推送（pong 不入列）：新消息 unshift 置顶 */
  const messages = ref<MockMessage[]>([])

  let socket: MockWebSocket | null = null
  let heartbeatTimer: number | null = null
  let pongTimer: number | null = null
  let reconnectTimer: number | null = null
  let manualClosed = false
  let reconnectCount = 0

  /** 停心跳：清 interval 与未决的 pong 超时（重连/关闭前必须调，防定时器泄漏） */
  const stopHeartbeat = () => {
    if (heartbeatTimer !== null) {
      window.clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    if (pongTimer !== null) {
      window.clearTimeout(pongTimer)
      pongTimer = null
    }
  }

  /** 启动心跳：定时发 ping；每次发出起一个 pong 超时，超时判定假死 → 主动断开（onclose 会接手重连） */
  const startHeartbeat = () => {
    stopHeartbeat() // 防重连后残留旧心跳循环
    heartbeatTimer = window.setInterval(() => {
      if (socket && socket.readyState === MockWebSocket.OPEN) {
        socket.send('ping')
        pongTimer = window.setTimeout(() => {
          console.warn(`[ws] pong timeout(${pongTimeout}ms), treat as dead connection`)
          socket?.close() // 走 onclose → 非主动关闭 → 自动重连
        }, pongTimeout)
      }
    }, heartbeatInterval)
  }

  /** 建连：挂载 onopen/onmessage/onclose 三个回调 */
  const connect = () => {
    socket = new MockWebSocket(url)
    console.info(`[ws] connecting → ${url}`)

    socket.onopen = () => {
      status.value = 'open'
      reconnectCount = 0 // 连上就清零重连计数
      console.info('[ws] connected, heartbeat started')
      startHeartbeat()
    }

    socket.onmessage = (ev) => {
      let msg: MockMessage
      try {
        msg = JSON.parse(String(ev.data)) as MockMessage
      } catch {
        return // 非法帧静默丢弃
      }
      if (msg.type === 'pong') {
        // 撤销 pong 超时判定，打印往返耗时（TR-16.1 心跳日志证据）
        if (pongTimer !== null) {
          window.clearTimeout(pongTimer)
          pongTimer = null
        }
        console.info(`[ws] heartbeat ok, rtt=${Date.now() - msg.timestamp}ms`)
        return
      }
      // 业务推送：本地留档（列表渲染）+ 回调（页面弹 Notification）
      messages.value.unshift(msg)
      onMessage?.(msg)
    }

    socket.onclose = (ev) => {
      stopHeartbeat()
      if (manualClosed) {
        status.value = 'closed'
        console.info('[ws] closed by client')
        return
      }
      // 非主动关闭（服务端宕机/假死断开）→ 自动重连（TR-16.3）
      scheduleReconnect(ev.code)
    }
  }

  const scheduleReconnect = (code: number) => {
    if (reconnectCount >= maxReconnect) {
      status.value = 'closed'
      console.warn(`[ws] reconnect limit reached(${maxReconnect}), giving up`)
      return
    }
    reconnectCount += 1
    status.value = 'reconnecting'
    console.info(`[ws] connection lost(code=${code}), retry #${reconnectCount} in ${reconnectInterval}ms`)
    reconnectTimer = window.setTimeout(connect, reconnectInterval)
  }

  /** 手动重连：重连超限被放弃（closed）后，用户点击恢复 */
  const open = () => {
    if (socket && socket.readyState !== MockWebSocket.CLOSED) return
    manualClosed = false
    reconnectCount = 0
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    status.value = 'connecting'
    connect()
  }

  /** 主动关闭：置 manualClosed，清全部定时器，底层 close 后不再重连 */
  const close = () => {
    manualClosed = true
    stopHeartbeat()
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    socket?.close()
    socket = null
    status.value = 'closed'
  }

  connect()

  // 页面级连接策略：组件卸载（离开页面）自动断开，防止定时器与连接泄漏
  onBeforeUnmount(close)

  return { status, messages, open, close }
}

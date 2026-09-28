/**
 * MockWebSocket：浏览器端模拟 WebSocket 服务端
 *
 * 没有真实服务器时的练习方案。刻意把「接口形状」做成与原生 WebSocket 一致：
 * readyState / onopen / onmessage / onclose / send() / close() ——
 * 这样 useWebSocket 里的客户端代码与连接真实服务器完全同构，
 * 将来切换真实后端时只需要把 `new MockWebSocket(url)` 换成 `new WebSocket(url)`。
 *
 * 注意目录归属：本文件虽然叫 mock，但它是被浏览器加载的前端模块，
 * 放在 src/ 下（tsconfig.app.json，有 DOM lib）；根目录 mock/ 是 vite HTTP mock
 * 插件的模块，运行在 Node 环境（tsconfig.node.json，无 DOM），两者不是一类东西。
 *
 * 模拟的服务端行为：
 * 1. 连接 300ms 后建立（模拟 TCP 握手耗时）
 * 2. 每 5 秒推送一条业务消息（模拟服务端实时事件）
 * 3. 收到 'ping' 心跳，200ms 后回 pong（带时间戳，供客户端计算 RTT）
 * 4. kill()：模拟服务端异常宕机（code 1006），与客户端主动 close(code 1000) 区分，
 *    供控制台 window.__mockWsDown() 手动拉闸验证自动重连（TR-16.3）
 */

/** 服务端推送消息体（与 useWebSocket 共享的类型契约） */
export interface MockMessage {
  type: 'push' | 'pong'
  title?: string
  content?: string
  level?: 'info' | 'success' | 'warning'
  timestamp: number
}

/** 推送文案池：顺序轮播，模拟不同业务事件 */
const PUSH_POOL: Array<Pick<MockMessage, 'title' | 'content' | 'level'>> = [
  { title: '新订单', content: '张三提交了采购订单 PO-20260928-001', level: 'success' },
  { title: '库存预警', content: 'SKU-1024 库存低于安全阈值（剩余 3 件）', level: 'warning' },
  { title: '系统通知', content: '每日数据报表已于 09:00 生成完毕', level: 'info' },
  { title: '审批提醒', content: '李四的报销单等待审批，已等待 2 小时', level: 'warning' },
  { title: '新用户注册', content: '新用户 wang.wu@example.com 完成注册', level: 'info' },
]
let poolIndex = 0

const makePushMessage = (): MockMessage => {
  const base = PUSH_POOL[poolIndex % PUSH_POOL.length]
  poolIndex += 1
  return { ...base, type: 'push', timestamp: Date.now() }
}

export class MockWebSocket {
  // 与原生 WebSocket 常量对齐，客户端可以直接引用
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  /** 最近创建的实例：拉闸入口只对「当前活跃连接」生效 */
  static latest: MockWebSocket | null = null

  url: string
  readyState: number = MockWebSocket.CONNECTING
  onopen: ((ev: Event) => void) | null = null
  onmessage: ((ev: MessageEvent) => void) | null = null
  onclose: ((ev: CloseEvent) => void) | null = null
  onerror: ((ev: Event) => void) | null = null

  // 服务端内部的定时器（推送循环 / 握手延迟），close 时必须清掉
  private pushTimer: number | null = null
  private openTimer: number | null = null

  constructor(url: string) {
    this.url = url
    MockWebSocket.latest = this
    // 模拟 TCP 握手：300ms 后连接建立，触发 onopen 并启动推送循环
    this.openTimer = window.setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      this.onopen?.(new Event('open'))
      this.startPush()
    }, 300)
  }

  send(data: string): void {
    if (this.readyState !== MockWebSocket.OPEN) return
    // 心跳应答：收到 ping，延迟 200ms 回 pong（只应答处于 OPEN 状态的连接）
    if (data === 'ping') {
      window.setTimeout(() => {
        if (this.readyState === MockWebSocket.OPEN) {
          this.emit(JSON.stringify({ type: 'pong', timestamp: Date.now() } satisfies MockMessage))
        }
      }, 200)
    }
  }

  /** 客户端主动关闭：code 1000 = 正常关闭 */
  close(): void {
    this.teardown()
    this.onclose?.(new CloseEvent('close', { code: 1000, reason: 'client closed' }))
  }

  /** 模拟服务端宕机：先 onerror 再 onclose（code 1006 = 异常断开，客户端据此触发重连） */
  kill(): void {
    this.teardown()
    this.onerror?.(new Event('error'))
    this.onclose?.(new CloseEvent('close', { code: 1006, reason: 'server crashed' }))
  }

  private startPush(): void {
    this.pushTimer = window.setInterval(() => {
      this.emit(JSON.stringify(makePushMessage()))
    }, 5000)
  }

  /** 统一清理：停推送循环 + 停握手定时器，状态置为 CLOSED */
  private teardown(): void {
    if (this.pushTimer !== null) window.clearInterval(this.pushTimer)
    if (this.openTimer !== null) window.clearTimeout(this.openTimer)
    this.pushTimer = null
    this.openTimer = null
    this.readyState = MockWebSocket.CLOSED
  }

  private emit(data: string): void {
    this.onmessage?.(new MessageEvent('message', { data }))
  }
}

// 控制台拉闸入口（TR-16.3 验证用）：控制台执行 window.__mockWsDown()
// declare global 扩展 Window 类型（在模块文件内声明合并的正确姿势）
declare global {
  interface Window {
    __mockWsDown?: () => void
  }
}
window.__mockWsDown = () => MockWebSocket.latest?.kill()

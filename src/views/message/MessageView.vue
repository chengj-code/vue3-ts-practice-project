<script setup lang="ts">
import { computed } from 'vue'
import { ElNotification } from 'element-plus'
import { useWebSocket } from '@/composables/useWebSocket'
import type { WsStatus } from '@/composables/useWebSocket'

// 页面级连接策略：进入页面建连、离开自动断开（onBeforeUnmount 已封装在 useWebSocket 内）
const { status, messages, open, close } = useWebSocket('ws://mock.local/realtime', {
  heartbeatInterval: 5000,
  pongTimeout: 2000,
  reconnectInterval: 3000,
  maxReconnect: 10,
  // 收到业务推送 → 弹全局通知（TR-16.2）；level 直接映射 EP 通知类型
  onMessage: (msg) => {
    ElNotification({
      title: msg.title,
      message: msg.content,
      type: msg.level,
      duration: 3000,
    })
  },
})

// 状态徽标文案与语义色（颜色走 EP 语义变量，天然跟随明暗主题）
const STATUS_META: Record<WsStatus, { label: string; cls: string }> = {
  connecting: { label: '连接中', cls: 'is-connecting' },
  open: { label: '已连接', cls: 'is-open' },
  reconnecting: { label: '重连中', cls: 'is-reconnecting' },
  closed: { label: '已断开', cls: 'is-closed' },
}
const statusMeta = computed(() => STATUS_META[status.value])

// 拉闸测试：控制台敲 window.__mockWsDown() 效果相同（TR-16.3 验证）
const simulateCrash = () => {
  window.__mockWsDown?.()
}

// 时间列展示：24 小时制时分秒
const formatTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false })
}
</script>

<template>
  <div class="message-view">
    <header class="panel-head">
      <div>
        <h2>消息中心</h2>
        <p class="desc">WebSocket 实时推送 · 心跳保活 · 断线自动重连</p>
      </div>
      <div class="head-actions">
        <span class="status-badge" :class="statusMeta.cls">
          <span class="dot" />
          {{ statusMeta.label }}
        </span>
        <!-- 测试工具：模拟服务端宕机（验证自动重连） -->
        <el-button size="small" :disabled="status !== 'open'" @click="simulateCrash">
          模拟服务端宕机
        </el-button>
        <!-- 重连超限被放弃后，手动恢复连接 -->
        <el-button v-if="status === 'closed'" type="primary" size="small" @click="open">
          重新连接
        </el-button>
        <el-button v-else size="small" @click="close">主动断开</el-button>
      </div>
    </header>

    <section class="panel">
      <div class="panel-title">实时消息</div>
      <el-empty
        v-if="messages.length === 0"
        description="等待第一条推送…（服务端每 5 秒推送一次）"
      />
      <ul v-else class="msg-list">
        <li v-for="msg in messages" :key="msg.timestamp" class="msg-item">
          <span class="msg-dot" :class="`level-${msg.level}`" />
          <div class="msg-body">
            <div class="msg-row">
              <span class="msg-title">{{ msg.title }}</span>
              <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <p class="msg-content">{{ msg.content }}</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/* 全部取自双主题 CSS 变量层（T18），页面不做主题假设 */
.message-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-head h2 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--console-text-1);
}

.desc {
  margin: 0;
  font-size: 12px;
  color: var(--console-text-3);
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 连接状态徽标：dot 呼吸/脉动动画仅 open/reconnecting 需要 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--console-line);
  background: var(--console-fill);
  color: var(--console-text-2);
}

.status-badge .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--console-text-3);
}

.status-badge.is-connecting .dot {
  background: var(--el-color-primary);
}

.status-badge.is-open {
  color: var(--el-color-success);
  border-color: color-mix(in srgb, var(--el-color-success) 35%, transparent);
}

.status-badge.is-open .dot {
  background: var(--el-color-success);
  animation: breathe 2s ease-in-out infinite;
}

.status-badge.is-reconnecting {
  color: var(--el-color-warning);
  border-color: color-mix(in srgb, var(--el-color-warning) 35%, transparent);
}

.status-badge.is-reconnecting .dot {
  background: var(--el-color-warning);
  animation: breathe 0.8s ease-in-out infinite;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

.panel {
  border: 1px solid var(--console-line);
  border-radius: 10px;
  background: var(--console-surface);
  padding: 16px 20px 20px;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--console-text-1);
  padding-left: 8px;
  border-left: 3px solid var(--console-accent);
  margin-bottom: 14px;
}

.msg-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.msg-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px dashed var(--console-line);
}

.msg-item:last-child {
  border-bottom: none;
}

/* level 色点：语义色跟随主题 */
.msg-dot {
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  background: var(--el-color-info);
}

.msg-dot.level-success {
  background: var(--el-color-success);
}

.msg-dot.level-warning {
  background: var(--el-color-warning);
}

.msg-dot.level-info {
  background: var(--el-color-info);
}

.msg-body {
  flex: 1;
  min-width: 0;
}

.msg-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.msg-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--console-text-1);
}

.msg-time {
  font-size: 12px;
  color: var(--console-text-3);
  font-variant-numeric: tabular-nums;
}

.msg-content {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--console-text-2);
  line-height: 1.6;
}
</style>

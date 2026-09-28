---
title: WebSocket composable 状态机封装（心跳/重连/单一出口）
type: pattern
date: 2026-09-28
tags: [vue3, composable, websocket, 状态机, 心跳, 断线重连]
verified: 2026-09-28
source: sessions/2026-09-28_T16WebSocket实时通信.md
---

# WebSocket composable 状态机封装

## 适用场景

需要封装长连接（WebSocket/SSE/轮询保活）为 Vue composable 的场景：连接状态要驱动 UI（徽标）、断线要自动恢复、主动关闭不能触发重连、组件卸载要彻底清理。

## 核心方案

**状态机骨架**：`connecting → open →（任何断因）onclose → manualClosed ? closed : reconnecting → connect()`

五条铁律：

1. **重连单一出口**：所有断因（pong 超时假死、服务端宕机、网络错误）统一走 `socket.close()` → onclose → scheduleReconnect。「发现死亡」（心跳）与「处理死亡」（重连）分离，重连逻辑全项目一份
2. **manualClosed 标志先行**：主动 close 时**先置标志再断开**（原生 WS 的 onclose 是异步事件），onclose 据此区分主动/异常——缺它则登出后后台无限重连
3. **心跳 = 发出 + 确认**：发 ping 同时起 pong 超时倒计时，超时判假死。只发不等是向空气喊话（TCP 在但进程假死时 send 不报错）
4. **onopen 里重连计数清零**：计数衡量「连续失败」而非历史总数；重连上限后置 closed 终态，UI 交还人决策（手动重连按钮），恢复时同时重置标志与计数
5. **清理覆盖三个定时器**（心跳 interval / pong 超时 / 重连等待）：startXxx 第一行永远是 stopXxx；composable 内部注册 onBeforeUnmount(close)

**代码组织**：socket、定时器、标志用普通闭包变量（视图不消费）；status/messages 用 ref（视图消费）。

## 迷惑点解答

- **为什么 pong 超时后不直接重连？** 重连逻辑只写一份：绕道 close() → onclose 回路。将来改指数退避只动 scheduleReconnect 一处
- **为什么监听状态不用 addEventListener 多播？** 每连接单处理点够用，onXxx 回调属性（单播）实现最简——mock 按消费者真实需要的最小接口模拟
- **页面级还是全局级？** 页面级（composable 内 onBeforeUnmount）起步最简；全局化时 composable 代码零改动，只换连接挂载点 + messages 入 store

## 验证方式

T16 走查：心跳 RTT 日志（TR-16.1）、推送列表+通知（TR-16.2）、拉闸后 reconnecting 日志与自动恢复（TR-16.3）、主动断开不再重连、切页无重复连接。type-check 零错误。

## 关联

- 模式卡：useTable watch 触发语义与查询防重（同为 composable 生命周期设计范式）
- 模式卡：declare-module 类型顶包与声明合并（window.__mockWsDown 的 declare global 同源机制）

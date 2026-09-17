---
title: Task 20 最终验收 + useForm 校验门禁 P0 bug 修复
type: session
date: 2026-09-17
status: 已完成
tags: [vue3, typescript, composable, useForm, useModal, 表单校验, 走查, 验收, vite构建, element-plus]
related_files: [src/composables/useForm.ts, src/views/User/UserListView.vue, src/assets/base.css, src/assets/main.css, .trae/specs/vue3-ts-practice-project/tasks.md]
---

# Task 20 最终验收 + useForm 校验门禁 P0 bug 修复

## 背景

T11 权限收尾后执行 Task 20：type-check / build / 全流程浏览器走查 / 脚手架清理 / TR-20.3 类型严格度 / TR-20.4 分层。

## 走查抓到的 P0 bug

### 现象（运行时实证，非推断）

新增用户弹窗**全空直接点确定**：弹窗关闭、POST /api/user 发出、列表 238 → 239，多出 id=477 姓名/邮箱/手机号全空的脏记录。

### 根因链

1. `useForm.submit()` 内 `try { await validate() } catch { return }`——校验失败时 Promise **正常 resolve**，调用方无法感知失败
2. UserListView.handleSubmit 无条件串联 `await submitForm(); await confirm()`，第二段（调 API + 关弹窗）照样执行
3. 单段式消费方（LoginView）submit 后没有第二步，所以一直没暴露；两段式组合才中招
4. T10 当年只验了「非法输入有红字」「合法输入能提交」，**缺反向断言「非法输入时请求不发出」**

### 修复（最小改动，2 个文件）

- `src/composables/useForm.ts`：submit 返回 `Promise<boolean>`，validate reject → `return false`，正常走完 → `return true`；加文档注释说明单段式可忽略、组合式必须门禁
- `src/views/User/UserListView.vue`：`const valid = await submitForm(); if (!valid) return; await confirm()`
- LoginView 忽略返回值，零改动

### 修复后复测证据

- 空提交：3 条必填报错、弹窗保留、XHR 探针确认零 POST、总数 238 不变
- 非法邮箱「abc」+ 手机号「12345」：两条格式报错、零 POST
- 合法提交：238→239，首行字段完整（走查专用用户甲 / 18 / test-user-a@... / 13800138000）
- 编辑：姓名/邮箱更新，id 与 createTime 保留（mock PUT 忽略 createTime 生效），总数不变
- 删除：确认框「确定删除「走查专用用户乙」吗？」→ 确认后 239→238

## Task 20 验收结果

| 验收项 | 结果 | 证据 |
|--------|------|------|
| TR-20.1 type-check | PASS | vue-tsc --build 退出码 0（修复后复跑） |
| TR-20.2 build | PASS | 修复后最终构建 1755 模块，dist 生成，路由级分包 |
| 全流程走查 | PASS | 登录负向/正向、查询、重置、CRUD、校验、登出、守卫重定向，console 零 error |
| TR-20.3 类型严格度 | 5/5 | 手写代码零 any；@ts-nocheck 仅插件生成 d.ts；一处已归档 as AxiosResponse |
| TR-20.4 目录分层 | 5/5 | api/composables/directives/layouts/router/stores/views 单一职责 |

## 其他改动

- 删除脚手架死文件：HelloWorld.vue / TheWelcome.vue / WelcomeItem.vue / icons×5 / assets/logo.svg（grep 确认全局零引用）
- 删除历史死文件：src/views/Home/UserListView.vue（路由早已指向 views/User/）
- base.css 精简为纯 reset（脚手架 --vt-c-* 调色板唯一消费方是被删的 WelcomeItem）
- main.css `html.dark body` 补 `color: var(--el-text-color-regular)`——原文字色来自 base.css 的 prefers-color-scheme（跟随系统深浅色，不稳定）

## 教训（可复用）

1. **composable 吞错要有返回值契约**：catch 后静默 return 会让「失败」和「成功」在调用方看来一模一样；吞异常可以，但必须用 boolean/结果对象把状态传出去
2. **流程串联的每一步都要门禁**：A 成功才能 B 的组合，不能靠「A 内部应该会拦住」的默契
3. **表单校验验收必须有反向断言**：不只看错误红字，还要证明「请求没发出 / 数据没变 / 弹窗没关」。本次靠 XHR 探针（monkey-patch XMLHttpRequest.open/send）拿到零请求铁证
4. mock 数据在 Node 进程内存，脏数据复位只需重启 dev server
5. 浏览器 HMR 重连期间点击可能落空，现象与代码矛盾时先整页刷新、确认注入探针再下结论

## 相关文档

- patterns/useTable-useModal组合CRUD.md 已更正（第 12 条 + 示例 + 坑位均补上门禁）

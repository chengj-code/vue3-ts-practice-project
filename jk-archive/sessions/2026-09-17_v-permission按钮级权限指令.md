---
title: v-permission 按钮级权限指令（T11 第 4 步）
type: session
date: 2026-09-17
status: 已完成
tags: [vue3, 自定义指令, 权限, v-permission, element-plus, typescript]
related_files: [src/directives/permission.ts, src/directives/index.ts, src/main.ts, src/views/User/UserListView.vue, src/views/Home/DashboardView.vue, src/composables/usePermission.ts]
---

# v-permission 按钮级权限指令 — T11 第 4 步

## 需求

Task 11 第 4 步：实现按钮级权限控制。`v-permission="['user:add']"`，无权限时元素从 DOM 移除（TR-11.2），与既有判断层（usePermission）和路由层（meta.roles 守卫）衔接。

## 方案

### 结构：两层封装

```
directives/permission.ts  → 指令本体（Directive<HTMLElement, string[]> + satisfies 校验）
directives/index.ts       → map 出口 { permission }
main.ts                   → Object.entries 批量 app.directive（注册名不带 v- 前缀）
```

### 指令本体关键点

- `mounted` 单钩子（90% 指令场景只需这一个）
- 判断复用判断层：`hasRole(v) || hasPermission(v)` 任一命中即显示——按钮级权限字符串（`user:add`）走 permissions 维度，admin 由 isAdmin 短路
- 移除语义：`el.parentNode?.removeChild(el)`，可选链兜底 parentNode null 类型

### 类型三件套（本次练习重点）

1. `Directive<HTMLElement, string[]>`：第一泛型是挂载元素，第二是 binding.value 类型
2. `satisfies PermissionDirective`：校验导出同时**保留上下文推导**（mounted 的 binding 自动按 `DirectiveBinding<string[]>` 推导）
3. `declare module 'vue' { interface GlobalDirectives { vPermission: ... } }`：Vue 3.5+ 模板全局指令类型提示（key 带 v 前缀驼峰）

## 代码改动

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| src/directives/permission.ts | 新增 | 指令本体：单 mounted 钩子 + 判断层透传 + removeChild |
| src/directives/index.ts | 修改 | 空壳 → map 出口（加新指令只改这层） |
| src/main.ts | 修改 | Object.entries 批量注册（mount 前） |
| src/views/User/UserListView.vue | 修改 | 新增/编辑/删除按钮挂 ['user:add'/'user:edit'/'user:delete']（与 mock permissions 对齐） |
| src/views/Home/DashboardView.vue | 修改 | el-empty 占位符挂 ['admin'] 作按钮级测试载体（user 进不了列表页，路由层拦截） |
| src/router/index.ts | 还原 | 过程中被临时改为 roles:['user'] 以便 user 进列表页测试，审查后还原 ['admin'] |

## 遇到的问题与解决

| 问题 | 原因 | 解决 | 教训/可复用点 |
|------|------|------|--------------|
| 无权限仅 `display:none` | 首版实现 | 改 removeChild | 权限控制的安全语义是「DOM 不存在」，样式隐藏可被 DevTools 绕过 |
| 手动标注 `binding: DirectiveBinding` 放宽为 any | DirectiveBinding 无泛型默认 any，废掉 satisfies 推导 | 删手动标注，靠上下文推导 | 上下文已有精确类型时，手动标注宽类型是倒退（同 FormRules 推断 validator 参数原理） |
| 路由 roles 被改为 ['user'] 测试按钮 | 想让 user 进列表页验证按钮，牺牲了 TR-11.1 权限模型 | 还原 ['admin']；按钮级验证放 Dashboard 载体 | 测试便利不得污染生产权限配置；「页面拦得住，按钮够不到」时用不设 roles 的页面做载体 |
| hasRole 拿权限字符串比对 roles（维度错位） | 双判断 `!hasRole && !hasPermission` 语义模糊，靠 admin 短路碰巧不出错 | 显式 `hasRole \|\| hasPermission` + 注释声明语义 | 多维度权限判断必须写明「或/且」语义，靠短路兜底的巧合迟早出 bug |
| console.log 两次混入提交前代码 | 调试遗留 | 删除 | 提交前 grep 一遍 console.log |

## 待办 / 后续

- [x] DefaultLayout 侧边栏菜单按 hasRole 过滤（T11 第 5 步；layoutRoutes computed 链上 `.filter(item => hasRole(item?.meta?.roles))`，与守卫共用 usePermission）
- [x] TR-11.1/11.2/11.3 浏览器走查（2026-09-17，全新浏览器会话实测：user 菜单仅仪表盘 / /user/list → /403 / Dashboard el-empty 被移除；admin 菜单 2 项 / 列表页表格 10 行 + 增删改按钮齐 / el-empty 放行；console 无 error）
- [x] 走查通过后 T11 状态置 completed
- 走查教训：换账号验证必须用全新会话或先清 localStorage——pinia 持久化残留会让浏览器实际停留在上个账号（admin）身份，表现为「菜单过滤不生效、守卫不拦截、指令不移除」的假性 FAIL，与代码逻辑矛盾时先查 localStorage 里的真实 roles

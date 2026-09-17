# 知识总索引

## 会话档案（sessions/）

| 标题 | 状态 | 日期 | 标签 | 路径 |
|------|------|------|------|------|
| Axios 请求层封装 + 拦截器 + 统一错误处理 | 已完成 | 2026-09-15 | axios, typescript, 拦截器, 请求封装, vue3 | [sessions/2026-09-15_axios请求层封装.md](./sessions/2026-09-15_axios请求层封装.md) |
| 三个 Composables：useTable / useForm / useModal | 已完成 | 2026-09-15 | vue3, composable, useTable, useForm, useModal, element-plus, typescript | [sessions/2026-09-15_composables.md](./sessions/2026-09-15_composables.md) |
| 布局系统 DefaultLayout + app store 持久化 | 已完成 | 2026-09-15 | vue3, 布局, router, pinia, 持久化, element-plus | [sessions/2026-09-15_布局系统与app-store.md](./sessions/2026-09-15_布局系统与app-store.md) |
| 登录鉴权 + 路由守卫 + redirect 链路 | 已完成 | 2026-09-15 | vue3, 登录, 鉴权, router, 守卫, pinia, element-plus | [sessions/2026-09-15_登录鉴权.md](./sessions/2026-09-15_登录鉴权.md) |
| 用户列表 CRUD + 表单校验深化（Task 9 + Task 10） | 已完成 | 2026-09-16 | vue3, element-plus, useTable, useModal, useForm, CRUD, mock, typescript, 表单校验, 异步校验, 登录 | [sessions/2026-09-16_用户列表CRUD.md](./sessions/2026-09-16_用户列表CRUD.md) |
| 权限控制 T11（1-3 步：RouteMeta 增强 + usePermission + 守卫/403） | 进行中 | 2026-09-16 | vue3, typescript, 权限, rbac, vue-router, 守卫, composable, 模块增强, element-plus | [sessions/2026-09-16_权限控制-类型与路由层.md](./sessions/2026-09-16_权限控制-类型与路由层.md) |
| useTable 查询失效与重复请求修复 | 已完成 | 2026-09-17 | vue3, composable, useTable, watch, 防重复请求, element-plus, typescript | [sessions/2026-09-17_useTable查询失效与重复请求.md](./sessions/2026-09-17_useTable查询失效与重复请求.md) |
| v-permission 按钮级权限指令（T11 第 4 步） | 进行中 | 2026-09-17 | vue3, 自定义指令, 权限, v-permission, element-plus, typescript | [sessions/2026-09-17_v-permission按钮级权限指令.md](./sessions/2026-09-17_v-permission按钮级权限指令.md) |

## 模式卡片（patterns/）

| 标题 | 验证日期 | 标签 | 来源 | 路径 |
|------|----------|------|------|------|
| Axios 泛型请求层封装（剥壳模式） | 2026-09-15 | axios, typescript, 拦截器, 请求封装, vue3 | sessions/2026-09-15_axios请求层封装.md | [patterns/axios-泛型请求层封装.md](./patterns/axios-泛型请求层封装.md) |
| pinia-plugin-persistedstate 类型扩展失效（persist 报错） | 2026-09-15 | pinia, typescript, 持久化, store | sessions/2026-09-15_axios请求层封装.md | [patterns/pinia-plugin-persistedstate-类型扩展失效.md](./patterns/pinia-plugin-persistedstate-类型扩展失效.md) |
| Element Plus 函数式组件样式缺失（按需导入） | 2026-09-15 | element-plus, 按需导入, unplugin, 样式 | sessions/2026-09-15_axios请求层封装.md | [patterns/element-plus-函数式组件样式缺失.md](./patterns/element-plus-函数式组件样式缺失.md) |
| useTable + useModal + useForm 组合实现 CRUD 页面 | 2026-09-16 | vue3, composable, CRUD, useTable, useModal, useForm, element-plus, typescript | sessions/2026-09-16_用户列表CRUD.md | [patterns/useTable-useModal组合CRUD.md](./patterns/useTable-useModal组合CRUD.md) |
| Vue SFC 模板不能写 TypeScript 泛型 | 2026-09-16 | vue3, vite, 模板编译, typescript, element-plus | sessions/2026-09-16_用户列表CRUD.md | [patterns/vue模板不能写泛型.md](./patterns/vue模板不能写泛型.md) |
| declare module 在脚本文件中顶掉整个包类型（env.d.ts 模块增强） | 2026-09-16 | typescript, declare-module, 模块增强, 声明合并, env.d.ts, vue-router | sessions/2026-09-16_权限控制-类型与路由层.md | [patterns/declare-module类型顶包与声明合并.md](./patterns/declare-module类型顶包与声明合并.md) |
| useTable watch 触发语义与查询防重（条件 fetch 模式） | 2026-09-17 | vue3, composable, useTable, watch, 防重复请求, element-plus, 分页 | sessions/2026-09-17_useTable查询失效与重复请求.md | [patterns/useTable-watch触发语义与查询防重.md](./patterns/useTable-watch触发语义与查询防重.md) |
| Vue3 自定义指令封装（v-permission 模板） | 2026-09-17 | vue3, 自定义指令, 权限, typescript, directive | sessions/2026-09-17_v-permission按钮级权限指令.md | [patterns/vue3-自定义指令封装.md](./patterns/vue3-自定义指令封装.md) |

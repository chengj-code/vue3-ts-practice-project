# 我的 Vue3 + TS 练习任务清单

> 本清单是**你需要自己手写**的任务。AI 只在你卡住时给思路，不直接给完整代码。
> 每完成一项，把 `[ ]` 改成 `[x]`，并在「心得/遇到的问题」栏做笔记。

## 一、核心必做（按依赖顺序）

### 阶段 1：请求与类型（先打好地基）

- [x] **T3 Axios 请求层封装**（2026-09-15 完成）
  - 文件：`src/api/request.ts`
  - 要点：创建 axios 实例、请求拦截器（注入 Token）、响应拦截器（解析业务 code、统一错误提示）、泛型响应类型
  - 涉及 TS：`ApiResponse<T>`、`AxiosRequestConfig` 扩展
  - 心得/问题：剥壳模式下出口泛型要写 `service.get<T, T>`（第二个泛型钉死返回类型 R，否则类型停留在 AxiosResponse 包装上，按类型写 `res.data.token` 编译通过但运行时 undefined）；拦截器 `return res.data` 需 `as AxiosResponse` 断言满足 axios 签名；401 处理加标记防并发重复跳转；`??` 与 `?:` 混用要加括号（优先级坑）。详见 jk-archive/patterns/axios-泛型请求层封装.md

- [ ] **TS 类型设计**（穿插在各模块中，进行中）
  - `src/types/api.ts`：`ApiResponse<T>`、`Paginated<T>`、`PageParams`
  - `src/types/table.ts`：`TableColumn<T>`、`TableAction`
  - 心得/问题：ApiResponse/PageResult/PageQuery/UserInfo 已落在 `src/api/types.ts`（暂未按计划拆到 src/types/，后续可调整）；T9 后 UserItem 等业务类型也在 api 层；table 相关类型（TableColumn/TableAction）仍待做，可在 T11 后统一整理

### 阶段 2：状态与登录

- [x] **T6 登录鉴权**（2026-09-15 完成，2026-09-16 用 useForm 重构）
  - 文件：`src/stores/user.ts`、`src/views/Login/LoginView.vue`、`src/router/index.ts` 守卫
  - 要点：token 存储、登录/登出、路由守卫拦截
  - 心得/问题：validate 失败会 reject 需 try-catch 吞掉；request.ts 已弹错误提示，登录页 catch 静默处理防 unhandled rejection；redirect 用 path 不用 name（name 是 'login' 不是 '/login'）；守卫用 vue-router 4 函数式 return 写法；已登录访问 /login 踢回首页。详见 jk-archive/sessions/2026-09-15_登录鉴权.md

- [x] **T7 Pinia 持久化与应用 Store**（2026-09-15 完成）
  - 文件：`src/stores/app.ts`、`main.ts` 注册持久化插件
  - 要点：`pinia-plugin-persistedstate`、user store 持久化、app store（侧边栏折叠/主题）
  - 心得/问题：坑——persist 类型靠插件 import 注入，不注册则类型报错且持久化静默失效；app store 用 `persist: { pick: ['isCollapse'] }` 精确持久化折叠状态，刷新后保持。详见 jk-archive/patterns/pinia-plugin-persistedstate-类型扩展失效.md

### 阶段 3：布局与路由

- [x] **T5 布局系统**（2026-09-15 完成）
  - 文件：`src/layouts/DefaultLayout.vue`
  - 要点：侧边栏（可折叠）+ 顶栏 + 内容区；菜单基于路由动态生成；Element Plus Container
  - 组件通信：props / 插槽
  - 心得/问题：`<component :is>` 要传组件对象不能传字符串；el-menu 折叠隐藏文字的 CSS 只认 span；图标组件必须显式 import（漏了不报错只留白）；children path 是相对路径要拼 `/`；用户下拉用 el-dropdown 的 command 模式。详见 jk-archive/sessions/2026-09-15_布局系统与app-store.md

- [ ] **路由结构与动态路由**（静态 + 路由级角色过滤已完成，菜单侧过滤随 T11 收尾）
  - 文件：`src/router/index.ts`
  - 要点：静态路由 + 动态路由（按权限过滤）、路由 meta（title/roles/icon）
  - 心得/问题：嵌套路由（layout → children）+ meta { title, icon } 已完成；RouteMeta 已在 env.d.ts 声明合并（roles?: string[]）；守卫的 meta.roles 拦截已生效（手敲 URL 也拦）；DefaultLayout 菜单按 hasRole 过滤待做

### 阶段 4：复用能力（重点练习）

- [x] **T8 自定义 Composables**（2026-09-15 完成；usePermission 并入 T11）
  - `useTable`：列表查询、分页、loading、重置 ✔️
  - `useForm`：表单数据、校验、重置、提交 ✔️（LoginView、UserListView 两个消费方验证了通用性）
  - `useModal`：弹窗显隐、确认回调 ✔️
  - `usePermission`：权限判断 ✔️（2026-09-16 随 T11 补写：hasRole/hasPermission，路由守卫已消费；指令待消费）
  - 心得/问题：useTable 用泛型 `<T, Q>` + watch page/pageSize 自动 fetch；useForm 泛型约束要用 `object` 不能用 `Record<string, unknown>`（interface 没有索引签名）；useModal `<T = undefined>` + confirm 成功才 close。详见 jk-archive/sessions/2026-09-15_composables.md

- [ ] **组件通信练习**（部分已用到，进行中）
  - props / emits：父子传值（T9 弹窗/表单已用）
  - v-model：表单组件双向绑定（查询表单、弹窗表单已用）
  - 插槽 / 作用域插槽：表格列自定义（T9 el-table 列插槽已用）
  - provide/inject：布局与子组件通信（尚未刻意练习，可在 T11 或进阶任务中补）
  - 心得/问题：前三种在 CRUD 页面自然用到了；provide/inject 还没场景，后续可让 layout 提供 collapse 状态给深层菜单项练手

### 阶段 5：业务页面

- [x] **T9 业务列表 CRUD 页面**（2026-09-16 完成）
  - 文件：`src/views/User/UserListView.vue`（实际路径，views/user/UserList.vue 为计划名）
  - 要点：查询表单 + 表格 + 分页 + 新增/编辑弹窗 + 删除确认
  - 必须使用 `useTable` composable
  - 心得/问题：三个 composable 组合消费；handleSearch 只设 page=1 靠 watch 自动 fetch；弹窗数据靠 watch isVisible 同步；onConfirm 内区分新增/编辑。详见 jk-archive/sessions/2026-09-16_用户列表CRUD.md

- [x] **T10 表单校验**（2026-09-16 完成）
  - 要点：必填、长度、格式（手机号/邮箱）、自定义校验规则
  - 使用 `useForm` composable
  - 心得/问题：异步校验器（用户名查重）统一用 callback 风格（失败 callback(new Error)、异常/空值 callback() 兜底）；查重接口用 GET /api/user/check 避免和新增路由冲突；password 的 required 和长度规则拆两条。详见 jk-archive/patterns/useTable-useModal组合CRUD.md

- [ ] **T11 权限控制**（进行中，3/6 步：类型层 + 判断层 + 路由层已完成）
  - 要点：路由级（meta.roles + 守卫）、按钮级（`v-permission` 自定义指令）、无权限页
  - 心得/问题：① env.d.ts 加 declare module 必须先 `export {}` 变模块，否则顶掉整个 vue-router 包类型；② ImportMetaEnv 随之要用 declare global 包，否则 env 类型静默变 any；③ 权限判断恒真 bug 最致命——`|| item`（非空字符串恒 truthy）和 `required.length`（漏 === 0，length=1 也 truthy）都让普通用户拿到 admin 权限；④ 守卫三层顺序：白名单 → token → hasRole；/403 必须在白名单防死循环。剩 v-permission 指令、菜单过滤、按钮挂载、走查。详见 jk-archive/sessions/2026-09-16_权限控制-类型与路由层.md

## 二、进阶选做（完成核心后按需选择）

- [ ] T12 仪表盘 + ECharts（折线/柱状/饼图 + resize）
- [ ] T13 文件上传下载（进度条、预览、blob 下载）
- [ ] T14 富文本编辑器（wangEditor + 图片上传）
- [ ] T15 Excel 导入导出（xlsx）
- [ ] T16 WebSocket 实时通信（心跳、断线重连）
- [ ] T17 高级交互（拖拽排序 sortablejs + 虚拟滚动）
- [ ] T18 主题切换（明暗 + 主题色，CSS 变量）
- [ ] T19 国际化 i18n（vue-i18n，中英切换）

## 三、最终验收

- [ ] 全流程走查：登录 → 仪表盘 → 列表 CRUD → 表单 → 权限 → 登出
- [ ] `npm run type-check` 零错误
- [ ] `npm run build` 成功

---

## 学习方法提示

1. **写之前先想**：每个模块先在纸上或注释里写出数据结构和逻辑流程，再动手
2. **卡住先查文档**：Vue 官方文档 / Pinia 文档 / Element Plus 文档，再问 AI 思路
3. **写完加注释**：每一行加中文注释，说不清的就是没懂
4. **对比优化**：写完后让 AI review，看差距在哪
5. **重写验证**：挑 1-2 个页面不看参考自己再写一遍

## 求助暗号

- 「**给我这个的思路**」→ AI 只讲思路和关键 API，不给代码
- 「**这行代码什么意思**」→ AI 逐行解释
- 「**帮我 review 这段**」→ AI 审查你的代码给改进建议

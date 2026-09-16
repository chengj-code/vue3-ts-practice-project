# Vue3 + TS 练习项目 - 实现计划

> 分工说明：`[AI]` = AI 实现（纯基础设施）；`[用户]` = 用户手写（核心 Vue3+TS 能力，AI 不给完整代码）；`[可选]` = 进阶功能，用户自选自写或 AI 生成后理解。

## Task 1: 工程化基础配置
- **Owner**: `[AI]`
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 安装并配置 ESLint + Prettier，统一代码风格
  - 配置 `vite.config.ts` 与 `tsconfig` 路径别名 `@` 指向 `src`
  - 配置 `.env.development` / `.env.production` 环境变量（API_BASE 等）
  - 安装 `sass` 支持 scss
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-1.1: 执行 `npx eslint src --ext .vue,.ts` 无 error；证据：终端输出
  - `rule` TR-1.2: `npm run type-check` 退出码 0；证据：终端输出
  - `rule` TR-1.3: 在任意 `.vue` 文件中 `import` 使用 `@/...` 可被 TS 解析；证据：tsconfig 路径配置与 IDE 无报错
- **Completion Evidence**:
  - `eslint.config.js`（ESLint 10 flat config + Vue + TS + Prettier）、`.prettierrc`（Prettier 默认风格）、`.prettierignore`
  - `vite.config.ts` 已配置 `@` → `src` 别名
  - `.env.development` / `.env.production` 已创建（VITE_API_BASE_URL、VITE_USE_MOCK）
  - `pnpm type-check` 退出码 0（2026-09-11 验证）
  - `sass`、`only-allow` 已安装，package.json 已配置 `packageManager: pnpm@10.12.1` 和 `preinstall: only-allow pnpm`
- **Notes**: Prettier 使用默认配置

## Task 2: 接入 Element Plus
- **Owner**: `[AI]`
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 安装 `element-plus`、`@element-plus/icons-vue`、`unplugin-auto-import`、`unplugin-vue-components`
  - 配置 Vite 插件实现按需自动引入组件与样式
  - 全局注册 `ElMessage`、`ElNotification` 等
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rule` TR-2.1: 访问测试页可见 Element Plus 组件且无控制台报错；证据：浏览器截图
  - `rule` TR-2.2: 打包后 `element-plus` 按需引入，未全量打包；证据：构建产物分析或 dev 控制台无全量警告
- **Completion Evidence**:
  - `vite.config.ts` 配置 `AutoImport` + `Components` 插件，均使用 `ElementPlusResolver()`
  - `src/auto-imports.d.ts` 与 `src/components.d.ts` 由插件自动生成
  - 实测：在模板中使用 `<el-button type="primary">` 正确渲染蓝色按钮，样式自动加载（2026-09-11 浏览器验证）
  - `ElMessage` 等 API 通过 `ElementPlusResolver` 在 AutoImport 中自动导入

## Task 3: Axios 请求层封装
- **Owner**: `[用户]`
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 安装 `axios`
  - 创建 `src/api/request.ts`：创建 axios 实例、请求拦截器（注入 Token）、响应拦截器（解析业务 code、错误统一 ElMessage 提示）
  - 定义统一响应类型 `ApiResponse<T>`
  - 创建 `src/api/modules/` 目录组织接口模块
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `rule` TR-3.1: 请求拦截器在请求头携带 Authorization；证据：代码审查 + Network 请求头
  - `rule` TR-3.2: 响应拦截器对业务 code 非成功时统一弹窗提示；证据：模拟失败请求后控制台/页面提示
  - `rule` TR-3.3: 接口函数返回类型为 `Promise<ApiResponse<T>>` 且泛型正确推导；证据：TS 类型检查
- **Completion Evidence**（2026-09-15）:
  - `src/api/request.ts`：axios 实例 + 请求拦截器（Bearer Token 注入）+ 响应拦截器（`code === 0` 剥壳；业务失败 ElMessage 提示并 `Promise.reject`）+ HTTP 错误统一处理（401 清 token 跳登录，`isRedirecting` 防并发重复跳转）
  - `src/api/types.ts`：`ApiResponse<T>` / `PageQuery` / `PageResult<T>` / `UserInfo`（暂放 api 层，未拆 `src/types/api.ts`，与计划有偏差，后续可调整）
  - `src/api/modules/user.ts`、`list.ts`：接口模块化，调用处泛型填业务类型
  - 实现偏差说明：出口泛型为剥壳后的 `Promise<T>`（`service.get<T, T>` 钉死 R 对齐运行时），而非计划中的 `Promise<ApiResponse<T>>`——业务层直接拿纯数据，无需 `.data.data`
  - 实测：App.vue 临时登录按钮调用 `/api/login` 成功，token 存入 store 并持久化
  - 已知遗留（2026-09-15 已全部修复，type-check 通过）：`list.ts` 的 `getUserListApi` 双重包装、`UserInfo.id` 联合类型、`UserItem` 与 mock 字段不一致——均已对齐 mock 约定（详见 jk-archive/sessions/2026-09-15_axios请求层封装.md 待办）

## Task 4: Mock 数据层
- **Owner**: `[AI]`
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - 安装 `vite-plugin-mock` + `mockjs`
  - 在 `vite.config.ts` 中启用 mock 插件
  - 创建 `mock/` 目录，编写登录、用户列表、用户详情、角色等 mock 接口
  - mock 数据与 `ApiResponse<T>` 结构一致
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `rule` TR-4.1: 调用 `/api/login` 返回包含 token 的响应；证据：Network 响应
  - `rule` TR-4.2: 列表接口返回带分页的 `{ list, total }` 结构且与 TS 类型一致；证据：Network + 类型匹配
  - `rule` TR-4.3: Mock 仅在开发环境生效；证据：vite 配置中 `prodEnabled: false`
- **Completion Evidence**:
  - `mock/_utils.ts`（统一响应结构 `{ code, message, data }` + `success`/`fail` 工具）
  - `mock/user.ts`（登录 `/api/login`、用户信息 `/api/user/info`）
  - `mock/list.ts`（用户列表分页、新增、更新、删除 CRUD）
  - `mock/index.ts`（统一导出）
  - `vite.config.ts` 配置 `viteMockServe({ enable: command === 'serve' })`，仅开发环境生效
  - 实测：`POST /api/login` 返回 `{ code:0, message:"ok", data:{ token, userInfo } }`（2026-09-11 浏览器 fetch 验证）
  - 测试账号：`admin/123456`（管理员）、`user/123456`（普通用户）

## Task 5: 布局系统
- **Owner**: `[用户]`
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - 创建 `src/layouts/DefaultLayout.vue`：侧边栏（可折叠）+ 顶栏（用户信息、登出）+ 内容区 `<RouterView>`
  - 侧边栏菜单基于路由配置动态生成（支持图标）
  - 应用 Element Plus 的 Container 组件
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rule` TR-5.1: 默认布局页面可正常渲染三部分；证据：浏览器截图
  - `rule` TR-5.2: 侧边栏折叠按钮可切换展开/收起状态；证据：浏览器交互
  - `rule` TR-5.3: 菜单项点击正确跳转对应路由且高亮激活项；证据：浏览器交互
- **Completion Evidence**（2026-09-15）:
  - `src/router/index.ts`：嵌套路由改造，`/` → DefaultLayout，children `/dashboard`、`/user/list`（占位页），meta 约定 `{ title, icon }`，`redirect: '/dashboard'`，`/login` 留 TODO 位
  - `src/layouts/DefaultLayout.vue`：el-container 三块结构；aside 宽度随 isCollapse 切换 64px/210px + `el-menu :collapse` 对齐；菜单遍历 children 动态生成（`router` 模式 + `:default-active="$route.path"` + iconMap 显式映射）；顶栏折叠按钮（Expand/Fold 表达点击后动作）+ `el-dropdown` 用户区（nickname/username 展示、退出登录 `clearUser` + push `/login`）
  - `src/views/Home/DashboardView.vue`、`src/views/User/UserListView.vue` 占位页；`src/assets/main.css` 补高度链
  - type-check 通过；TR-5.1/5.2/5.3 浏览器走查通过
- **Notes**: 踩坑：`<component :is>` 须传组件对象（字符串只认全局注册/原生标签）；el-menu collapse 隐藏文字的 CSS 只认 `span`；图标组件必须显式 import（ArrowDown 漏 import 时 type-check 不拦、运行时静默空白）；children path 为相对路径需拼 `/`；collapse 固定 64px 须与 aside 对齐；用户下拉用 `el-dropdown` + command 模式而非 horizontal el-menu

## Task 6: 登录鉴权
- **Owner**: `[用户]`
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 3, Task 4, Task 5
- **Description**:
  - 创建 `src/views/login/LoginView.vue`：用户名/密码表单，调用登录接口
  - 创建 `src/stores/user.ts`：存储 token、用户信息、登录/登出方法
  - 配置路由守卫：未登录重定向到 `/login`，已登录可访问受保护路由
  - 登出按钮清除 token 并跳转登录页
- **Acceptance Criteria Addressed**: AC-5, AC-8
- **Test Requirements**:
  - `rule` TR-6.1: 未登录访问 `/dashboard` 重定向到 `/login`；证据：浏览器地址栏变化
  - `rule` TR-6.2: 登录成功后 token 存入 store（持久化）并跳转首页；证据：localStorage 与路由
  - `rule` TR-6.3: 刷新页面后保持登录态；证据：刷新后仍在首页
  - `rule` TR-6.4: 登出后再次访问受保护路由被拦截；证据：跳转回登录页
- **Completion Evidence**（2026-09-15）:
  - `src/views/Login/LoginView.vue`：el-form + 校验（必填 + 密码 ≥ 6 位）+ submitForm（validate → loginApi → setToken/setUserInfo → ElMessage.success → router.replace(redirect)）；redirect 从 `route.query.redirect as string ?? '/'` 取；样式：flex 居中 + 白色卡片（380px/圆角 8px/轻阴影）；**2026-09-16 重构为 useForm 消费**（form/formRef/loading/submit 全部对齐 useForm；rules 用 FormRules 类型；password 规则拆两条；TR-8.2 验证通过）
  - `src/router/index.ts`：顶层 `/login` 路由（requiresAuth: false）；`beforeEach` 守卫采用 vue-router 4 函数式写法（return true / return { path, query }），白名单走 meta.requiresAuth === false，已登录访问登录页踢回首页，无 token 时 `to.fullPath` 作 redirect 值；request.ts 拦截器 401 跳转与 DefaultLayout 登出按钮依赖的路由就绪
  - TR-6.1/6.2/6.3/6.4 浏览器走查通过
- **Notes**: 踩坑：validate 失败会 reject，需 try-catch 吞掉；request.ts 拦截器已弹 ElMessage，LoginView catch 静默吞异常防 unhandled rejection；redirect 用 path 匹配而非 name（`name: '/login'` 会匹配不到，name 是 'login'）；RouteMeta 自定义字段声明合并未建，模板用 `as string` 断言兜底

## Task 7: Pinia 持久化与应用 Store
- **Owner**: `[用户]`
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 6
- **Description**:
  - 安装 `pinia-plugin-persistedstate`
  - 在 `main.ts` 中注册插件
  - user store 配置 `persist` 持久化 token 与用户信息
  - 创建 `src/stores/app.ts`：侧边栏折叠状态、主题等全局 UI 状态
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `rule` TR-7.1: 刷新后 user store 的 token 从 localStorage 恢复；证据：pinia devtools / 登录态保持
  - `rule` TR-7.2: app store 的侧边栏状态持久化；证据：刷新后折叠状态保持
- **Completion Evidence**（2026-09-15）:
  - `src/stores/app.ts`：isCollapse + toggleCollapse（无参取反），`persist: { pick: ['isCollapse'] }` 精确指定
  - TR-7.2 满足：Task 5 布局折叠按钮实测，刷新后折叠状态保持；TR-7.1 此前已满足
  - type-check 通过
- **Notes**: 踩坑记录：`persist` 类型靠插件 import 注入，不注册插件则类型报错且持久化静默失效（详见 jk-archive/patterns/pinia-plugin-persistedstate-类型扩展失效.md）

## Task 8: 自定义 Composables
- **Owner**: `[用户]`
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 3
- **Description**:
  - 创建 `src/composables/useTable.ts`：封装列表查询、分页、加载状态、重置
  - 创建 `src/composables/useForm.ts`：封装表单数据、校验、重置、提交
  - 创建 `src/composables/useModal.ts`：封装弹窗显示/隐藏、确认回调
  - 创建 `src/composables/usePermission.ts`：权限判断方法
  - 每个 composable 均有完整 TS 类型
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-8.1: `useTable` 返回响应式的 list、loading、pagination、fetch、reset 方法；证据：代码审查
  - `rule` TR-8.2: `useForm` 集成 Element Plus 表单校验；证据：组件中调用 validate 成功/失败
  - `rule` TR-8.3: 至少一个页面使用了 composable 且逻辑正确；证据：代码审查 + 页面功能正常
- **Completion Evidence**（2026-09-15）:
  - `useTable.ts`：泛型 `<T, Q>`；fetcher `PageQuery & Q`；watch page/pageSize；finally 关 loading
  - `useForm.ts`：`<F>` 自动推导；FormInstance validate catch；reset + clearValidate
  - `useModal.ts`：`<T = undefined>`；confirm 成功才 close；close 清 formData
  - type-check 通过；usePermission 延后到 Task 11（权限控制时再写）
- **Notes**: usePermission 延后 —— 无消费方提前写没用；Task 9 用户列表页将同时消费 useTable/useForm/useModal 满足 TR-8.3

## Task 9: 业务列表 CRUD 页面
- **Owner**: `[用户]`
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 5, Task 8
- **Description**:
  - 创建 `src/views/user/UserList.vue`：查询表单 + 数据表格 + 分页
  - 使用 `useTable` composable 管理列表数据
  - 新增/编辑弹窗（复用表单组件）
  - 删除操作带确认提示
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-9.1: 列表加载、查询、分页切换功能正常；证据：浏览器操作
  - `rule` TR-9.2: 新增弹窗提交后列表刷新；证据：列表新增一条数据
  - `rule` TR-9.3: 编辑后数据更新；证据：列表数据变化
  - `rule` TR-9.4: 删除确认后数据移除；证据：列表减少一条
- **Completion Evidence**（2026-09-16）:
  - mock/list.ts：加 name + status 筛选逻辑（query 参数显式布尔转换），新增/编辑/删除 CRUD 完整
  - UserListView.vue：查询表单 + 表格 + 分页 + 弹窗，完整 CRUD（新增/编辑/删除）
  - useTable 消费：`<UserItem, { name?: string; status?: string }>` 显式传 Q；模板直接绑 query；handleSearch 只设 page.value=1（靠 watch 自动 fetch）
  - useModal 消费：dialogFormData + watch 打开时同步；onConfirm 区分新增/编辑（API + ElMessage + fetch）
  - useForm 消费：el-form :model / ref / :loading 全部对齐 useForm 返回值；API 逻辑收在 useModal.onConfirm，useForm.onSubmit 空实现；异步校验器（用户名查重）
  - useForm 泛型约束调整：`Record<string, unknown>` → `object`（interface 无索引签名）
  - TR-9.1/9.2/9.3/9.4 + TR-10.1/10.2/10.3 浏览器走查通过
  - type-check 通过

## Task 10: 表单校验页面
- **Owner**: `[用户]`
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 8, Task 9
- **Description**:
  - 在新增/编辑表单中实现 Element Plus 表单校验
  - 包含必填、长度、格式（手机号、邮箱）、自定义校验规则
  - 使用 `useForm` composable 管理
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `rule` TR-10.1: 提交空表单显示必填错误；证据：页面错误提示
  - `rule` TR-10.2: 非法手机号/邮箱显示格式错误；证据：校验提示
  - `rule` TR-10.3: 合法数据校验通过并发起请求；证据：接口被调用
- **Completion Evidence**（2026-09-16）:
  - UserListView：表单校验（必填 + 邮箱格式 + 手机号正则 + 异步用户名查重），rules 内联 validator 自动推断类型
  - LoginView：用 useForm 重写（消费方 2，验证 composable 通用性），password 规则拆两条（required 管必填、validator 管长度），FormRules 类型标注让参数自动推断
  - mock 查重路由：GET /api/user/check?name=xxx（避免 POST /api/user 和新增路由冲突）
  - 异步 validator 规范：统一用 callback（校验失败 callback(new Error)、空值/异常 callback() 兜底）
  - TR-10.1/10.2/10.3 浏览器走查通过；type-check 通过

## Task 11: 权限控制
- **Owner**: `[用户]`
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 6
- **Description**:
  - 在路由 `meta` 中配置 `roles` 权限
  - 路由守卫中根据用户角色过滤可访问路由
  - 创建 `v-permission` 自定义指令控制按钮级权限
  - 创建无权限提示页
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rule` TR-11.1: 无权限用户访问受保护路由被重定向或提示无权限；证据：浏览器交互
  - `rule` TR-11.2: 无权限按钮被隐藏/禁用；证据：页面 DOM 检查
  - `rule` TR-11.3: 有权限用户可正常访问与操作；证据：功能正常

## Task 12: 仪表盘首页（ECharts 数据可视化）
- **Owner**: `[可选]`
- **Status**: `pending`
- **Priority**: low
- **Depends On**: Task 5, Task 6
- **Description**:
  - 安装 `echarts`、`vue-echarts`
  - 创建 `src/views/dashboard/DashboardView.vue`
  - 展示数据卡片（Element Plus Card/Statistic）
  - 渲染折线图、柱状图、饼图三种图表，封装 `EChart` 组件处理 resize
- **Acceptance Criteria Addressed**: AC-2, AC-14
- **Test Requirements**:
  - `rule` TR-12.1: 仪表盘页面正常渲染数据卡片与三种图表；证据：浏览器截图
  - `rule` TR-12.2: 数据来自 mock 接口或 store；证据：代码审查
  - `rule` TR-12.3: 窗口 resize 后图表自适应不溢出；证据：resize 前后截图

## Task 13: 文件上传下载
- **Owner**: `[可选]`
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 3, Task 4
- **Description**:
  - 创建 `src/views/file/FileUploadView.vue`
  - 使用 Element Plus Upload 组件实现单/多文件上传，带进度条
  - 图片预览（el-image）、文件下载（axios blob + a 标签下载）
  - Mock 上传/下载接口
- **Acceptance Criteria Addressed**: AC-15
- **Test Requirements**:
  - `rule` TR-13.1: 选择文件上传显示进度条并成功；证据：浏览器交互
  - `rule` TR-13.2: 图片可点击预览大图；证据：预览弹窗
  - `rule` TR-13.3: 点击下载触发文件保存；证据：浏览器下载栏

## Task 14: 富文本编辑器
- **Owner**: `[可选]`
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 3, Task 4
- **Description**:
  - 安装 `@wangeditor/editor`、`@wangeditor/editor-for-vue`
  - 创建 `src/views/rich-text/RichTextView.vue`
  - 封装 `RichEditor` 组件，支持工具栏、内容双向绑定、图片上传
  - Mock 图片上传与内容保存接口
- **Acceptance Criteria Addressed**: AC-16
- **Test Requirements**:
  - `rule` TR-14.1: 编辑器渲染且工具栏可用；证据：浏览器截图
  - `rule` TR-14.2: 输入内容后可获取 HTML 文本；证据：console/提交数据
  - `rule` TR-14.3: 插入图片成功；证据：编辑器内图片显示

## Task 15: Excel 导入导出
- **Owner**: `[可选]`
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 9
- **Description**:
  - 安装 `xlsx`
  - 在用户列表页增加「导出 Excel」与「导入 Excel」按钮
  - 导出：将列表数据转为 xlsx 并下载
  - 导入：选择 xlsx 文件解析为数据并展示/合并到列表
- **Acceptance Criteria Addressed**: AC-17
- **Test Requirements**:
  - `rule` TR-15.1: 点击导出下载 xlsx 文件，内容与列表一致；证据：下载文件内容
  - `rule` TR-15.2: 选择 xlsx 导入后数据正确解析并展示；证据：列表数据变化
  - `rule` TR-15.3: 非 xlsx 文件导入有错误提示；证据：错误提示

## Task 16: WebSocket 实时通信
- **Owner**: `[可选]`
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 3
- **Description**:
  - 创建 `src/composables/useWebSocket.ts`：封装连接、心跳、断线重连、消息回调
  - 创建 `src/views/message/MessageView.vue`：消息列表，实时接收推送
  - 使用 Mock WebSocket（或 `mockjs` + 定时推送模拟）
  - 收到消息时 Element Plus Notification 提醒
- **Acceptance Criteria Addressed**: AC-18
- **Test Requirements**:
  - `rule` TR-16.1: 连接建立且心跳日志正常；证据：控制台日志
  - `rule` TR-16.2: 收到推送消息后列表实时更新并弹通知；证据：页面通知
  - `rule` TR-16.3: 断线后自动重连；证据：重连日志

## Task 17: 高级交互（拖拽 + 虚拟滚动）
- **Owner**: `[可选]`
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 2
- **Description**:
  - 安装 `sortablejs` + `@types/sortablejs`（或 `vuedraggable`）
  - 创建 `src/views/advanced/AdvancedView.vue`
  - 拖拽排序区域：拖拽后数据顺序更新
  - 虚拟滚动区域：使用 `vue-virtual-scroller` 或自实现，渲染万级数据仅可视节点
- **Acceptance Criteria Addressed**: AC-19
- **Test Requirements**:
  - `rule` TR-17.1: 拖拽列表项后顺序更新；证据：拖拽前后顺序对比
  - `rule` TR-17.2: 虚拟列表数据量 10000+ 时 DOM 节点数远小于数据量；证据：DOM 检查
  - `rule` TR-17.3: 滚动虚拟列表流畅无明显卡顿；证据：浏览器交互

## Task 18: 主题切换
- **Owner**: `[可选]`
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 5, Task 7
- **Description**:
  - 在 app store 中增加 theme（light/dark）与 primaryColor 状态，持久化
  - 顶栏增加主题切换按钮（明暗 + 主题色选择）
  - 通过 CSS 变量 + Element Plus 暗黑模式（`el-dark` class）实现全局切换
  - 切换时实时生效，刷新保持
- **Acceptance Criteria Addressed**: AC-20
- **Test Requirements**:
  - `rule` TR-18.1: 切换明暗模式全局样式立即变化；证据：截图对比
  - `rule` TR-18.2: 切换主题色 Element Plus 主色变化；证据：按钮/链接颜色
  - `rule` TR-18.3: 刷新后主题保持；证据：刷新后样式

## Task 19: 国际化 i18n
- **Owner**: `[可选]`
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 5, Task 7
- **Description**:
  - 安装 `vue-i18n`
  - 创建 `src/locales/`：zh-CN、en-US 语言包
  - 配置 i18n 实例，在 `main.ts` 注册
  - 路由菜单、页面文案、Element Plus 组件语言切换
  - 顶栏增加语言切换，持久化
- **Acceptance Criteria Addressed**: AC-21
- **Test Requirements**:
  - `rule` TR-19.1: 切换为英文后菜单与页面文案变英文；证据：截图
  - `rule` TR-19.2: Element Plus 组件（如分页、空状态）语言同步切换；证据：组件文案
  - `rule` TR-19.3: 刷新后语言保持；证据：刷新后语言

## Task 20: 整体验收与构建
- **Owner**: `[AI]` + `[用户]`
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 - Task 19
- **Description**:
  - 执行 `npm run type-check` 确保零错误
  - 执行 `npm run build` 确保构建成功
  - 全流程走查：登录 → 仪表盘 → 列表 CRUD → 表单 → 权限 → 登出（+ 进阶功能）
  - 清理脚手架默认示例文件（HelloWorld、TheWelcome 等）
- **Acceptance Criteria Addressed**: AC-13, AC-11, AC-12
- **Test Requirements**:
  - `rule` TR-20.1: `npm run type-check` 退出码 0；证据：终端输出
  - `rule` TR-20.2: `npm run build` 退出码 0 且产物生成；证据：dist 目录
  - `rubric` TR-20.3: TypeScript 类型严格度；scale 1-5；anchors 1=大量any/3=部分any/5=全量严格类型无any；threshold >= 4；证据：代码扫描
  - `rubric` TR-20.4: 目录结构与代码分层；scale 1-5；anchors 1=混乱/3=基本分层/5=清晰规范单一职责；threshold >= 4；证据：目录树审查
- **Notes**: 此任务为最终验收门

# Vue3 + TS 练习项目 - 产品需求文档

## Overview
- **Summary**: 搭建一个功能完整、工程化规范的 Vue 3 + TypeScript 练习项目，覆盖 Vue3 核心能力、路由与状态管理、工程化规范、真实业务场景。
- **Purpose**: 作为个人练习 Vue3 与 TS 的实战演练场，具备可运行、可扩展、可学习的完整骨架与示例功能。
- **Target Users**: 项目作者本人（学习用途）。

## Goals
- 掌握 Vue3 Composition API 与 `<script setup>` 的核心用法。
- 掌握 TypeScript 在 Vue 组件、Store、API 层中的类型设计。
- 建立工程化体系：ESLint + Prettier、提交规范、路径别名、环境变量。
- 实现真实业务场景：登录鉴权、列表 CRUD、表单校验、权限控制等。
- 形成可复用的请求层与 Mock 数据能力。
- 覆盖进阶能力：数据可视化、文件上传下载、富文本、Excel 导入导出、WebSocket、拖拽与虚拟滚动、主题切换、国际化。

## Non-Goals
- 不实现真实后端接口，所有数据通过 Mock 模拟。
- 不做复杂的生产级性能优化（如 SSR、PWA、微前端）。
- 不做单元测试覆盖率要求（可选择性添加）。

## Background & Context
- 当前项目为 Vite 官方脚手架默认产物，已安装 Vue 3.5、Pinia 4、Vue Router 5、TypeScript 6。
- 用户已确认技术选型：Element Plus 作为 UI 库，Axios + Mock 作为网络层与数据模拟。
- 练习方向覆盖：Vue3 核心能力、路由与状态、工程化能力、真实业务场景。

## 实现分工
本项目为个人学习项目，核心 Vue3 + TS 能力由用户手写实现，AI 负责基础设施与辅助：

**AI 负责（纯基础设施，不含 Vue3 核心逻辑）：**
- ESLint / Prettier / Vite 配置、路径别名、环境变量
- Element Plus 按需引入配置
- Mock 方案搭建（`vite-plugin-mock` + 接口骨架）
- 项目目录结构创建
- 依赖安装

**用户自己实现（核心 Vue3 + TS 能力，AI 不直接给完整代码）：**
- 路由结构、动态路由、路由守卫
- Pinia store 设计（用户、权限、标签页、主题）
- Axios 封装（拦截器、泛型响应、错误处理）
- TS 类型设计（`ApiResponse<T>`、`Paginated<T>`、`TableColumn<T>`）
- 组件通信（props、emits、v-model、插槽、作用域插槽）
- 自定义 composables（`useTable`、`useForm`、`useModal`）
- 权限控制（按钮权限、动态菜单）
- 登录流程（token、持久化、刷新、登出）

**进阶功能（图表/上传/富文本/Excel/WebSocket/拖拽/主题/i18n）：** 用户自选，可自写或让 AI 生成后理解。

**协作方式：** 用户卡住时 AI 给思路与关键 API 提示；用户写完后 AI 做 review 与改进建议；AI 不直接输出核心完整组件。

## Functional Requirements
- **FR-1**: 工程化基础配置（ESLint、Prettier、路径别名 `@`、环境变量）。
- **FR-2**: Element Plus 完整接入（按需引入、全局样式、消息提示）。
- **FR-3**: Axios 请求层封装（实例、请求/响应拦截器、错误处理、Token 注入、类型化响应）。
- **FR-4**: Mock 数据层（使用 Mock 方案模拟接口，覆盖登录、列表、详情等）。
- **FR-5**: 布局系统（侧边栏 + 顶栏 + 内容区，响应式）。
- **FR-6**: 登录鉴权（登录页、Token 存储、路由守卫、登出）。
- **FR-7**: 仪表盘首页（数据卡片、图表占位）。
- **FR-8**: 业务列表示例（CRUD：查询、分页、新增、编辑、删除）。
- **FR-9**: 表单校验示例（Element Plus 表单、自定义校验、提交处理）。
- **FR-10**: Pinia 多 Store 协作与持久化（用户 Store、应用 Store、业务 Store）。
- **FR-11**: 自定义 Composables（如 `useTable`、`useForm`、`usePermission`）。
- **FR-12**: 权限控制（路由级与按钮级权限）。
- **FR-13**: 数据可视化（ECharts 折线图、柱状图、饼图，支持响应式 resize）。
- **FR-14**: 文件上传下载（图片/文件上传、预览、下载，带进度）。
- **FR-15**: 富文本编辑器（wangEditor 或 Tinymce，支持图片上传）。
- **FR-16**: Excel 导入导出（基于 xlsx 库，支持列表数据导出与导入解析）。
- **FR-17**: WebSocket 实时通信（连接、心跳、断线重连、消息推送通知）。
- **FR-18**: 高级交互（拖拽排序、虚拟滚动长列表）。
- **FR-19**: 主题切换（明暗模式 + 自定义主题色，持久化）。
- **FR-20**: 国际化 i18n（中英切换，路由菜单与页面文案多语言）。

## Non-Functional Requirements
- **NFR-1**: 代码符合 Airbnb JavaScript 风格，Prettier 默认格式化。
- **NFR-2**: 严格 TypeScript 类型，禁用 `any`、`@ts-ignore`。
- **NFR-3**: 单文件组件不超过 300 行，超限时拆分。
- **NFR-4**: `npm run type-check` 零错误，`npm run build` 成功。
- **NFR-5**: 目录结构清晰，分层合理（api / components / composables / stores / views / router / utils / types）。

## Constraints
- **Technical**: Vue 3.5、TypeScript 6、Vite 8、Pinia 4、Vue Router 5、Element Plus。
- **Business**: 个人练习项目，无真实后端。
- **Dependencies**: 需新增依赖：`element-plus`、`@element-plus/icons-vue`、`axios`、`vite-plugin-mock`、`mockjs`、`pinia-plugin-persistedstate`、`eslint`、`prettier`、`sass`、`echarts`、`vue-echarts`、`wangEditor`、`xlsx`、`vuedraggable`（或 `@vueuse/integrations` + `sortablejs`）、`vue-i18n`、`unplugin-auto-import`、`unplugin-vue-components` 等。

## Assumptions
- 用户使用最新稳定版本的依赖，可通过 npm/pnpm 安装。
- 练习项目以功能覆盖为主，视觉设计不做高要求。
- Mock 数据足够支撑所有业务示例的完整流程。

## Acceptance Criteria

### AC-1: 工程化配置可用
- **Type**: `rule`
- **Given**: 项目根目录存在 `.eslintrc`、`.prettierrc`、`tsconfig` 别名配置
- **When**: 执行 `npm run lint` 和 `npm run type-check`
- **Then**: 无错误输出，路径别名 `@` 可正确解析
- **Pass Condition**: 两个命令均以 0 退出
- **Evidence**: 终端命令输出

### AC-2: Element Plus 正常接入
- **Type**: `rule`
- **Given**: 项目已安装 element-plus 并配置
- **When**: 启动开发服务器并访问任意使用 Element Plus 组件的页面
- **Then**: 组件正常渲染，样式生效
- **Pass Condition**: 页面可见 Element Plus 组件且无控制台报错
- **Evidence**: 浏览器截图/控制台

### AC-3: Axios 请求层封装完整
- **Type**: `rule`
- **Given**: 存在 axios 实例与拦截器
- **When**: 发起任意请求
- **Then**: 请求自动携带 Token，响应自动解析业务 code，错误统一提示
- **Pass Condition**: 拦截器逻辑可在代码中验证且请求类型安全
- **Evidence**: 代码审查 + 一次请求日志

### AC-4: Mock 数据可用
- **Type**: `rule`
- **Given**: 配置了 Mock 中间件
- **When**: 调用登录、列表、详情接口
- **Then**: 返回符合类型定义的模拟数据
- **Pass Condition**: 接口返回结构与 TS 类型一致
- **Evidence**: 浏览器 Network 面板

### AC-5: 登录鉴权流程完整
- **Type**: `rule`
- **Given**: 用户未登录
- **When**: 访问受保护路由
- **Then**: 重定向到登录页；登录成功后进入首页；登出后无法访问受保护页面
- **Pass Condition**: 路由守卫正确拦截并跳转
- **Evidence**: 浏览器操作流程

### AC-6: CRUD 列表功能完整
- **Type**: `rule`
- **Given**: 进入业务列表页
- **When**: 执行查询、分页、新增、编辑、删除操作
- **Then**: 每项操作均有反馈，数据正确更新
- **Pass Condition**: 五个操作均正常完成且无报错
- **Evidence**: 浏览器操作截图

### AC-7: 表单校验生效
- **Type**: `rule`
- **Given**: 打开表单页面
- **When**: 提交空表单或非法数据
- **Then**: 显示校验错误提示，不发起请求
- **Pass Condition**: 必填校验、格式校验均生效
- **Evidence**: 浏览器交互

### AC-8: Pinia 持久化生效
- **Type**: `rule`
- **Given**: 用户已登录
- **When**: 刷新页面
- **Then**: 用户状态从持久化存储恢复，保持登录
- **Pass Condition**: localStorage/pinia state 正确恢复
- **Evidence**: 刷新后仍为登录态

### AC-9: 自定义 Composable 可复用
- **Type**: `rule`
- **Given**: 存在 `useTable` 等 composables
- **When**: 在列表页中使用
- **Then**: 列表逻辑由 composable 提供，组件代码精简
- **Pass Condition**: composable 被至少一个组件正确引用
- **Evidence**: 代码审查

### AC-10: 权限控制生效
- **Type**: `rule`
- **Given**: 不同权限的用户登录
- **When**: 访问无权限路由或按钮
- **Then**: 路由被拦截，按钮隐藏或禁用
- **Pass Condition**: 权限指令与路由守卫均生效
- **Evidence**: 浏览器操作

### AC-11: 类型安全质量
- **Type**: `rubric`
- **Dimension**: TypeScript 类型严格度
- **Scale**: 1-5
- **Anchors**: 1 = 大量 any / 类型缺失; 3 = 主要类型有定义但部分 any; 5 = 全量严格类型，无 any，API 响应类型化
- **Pass Threshold**: >= 4
- **Evidence**: 代码审查 `tsconfig.app.json` strict 配置与代码扫描

### AC-12: 代码组织质量
- **Type**: `rubric`
- **Dimension**: 目录结构与代码分层
- **Scale**: 1-5
- **Anchors**: 1 = 结构混乱; 3 = 有基本分层但不清晰; 5 = 分层清晰、命名规范、单一职责
- **Pass Threshold**: >= 4
- **Evidence**: 目录树审查

### AC-13: 构建与类型检查通过
- **Type**: `rule`
- **Given**: 所有功能已实现
- **When**: 执行 `npm run build`
- **Then**: 构建成功，无 TypeScript 错误
- **Pass Condition**: 构建命令以 0 退出
- **Evidence**: 终端构建输出

### AC-14: 数据可视化生效
- **Type**: `rule`
- **Given**: 进入仪表盘页面
- **When**: 页面加载
- **Then**: 渲染至少三种图表（折线、柱状、饼图），窗口 resize 时图表自适应
- **Pass Condition**: 图表可见且 resize 后不溢出
- **Evidence**: 浏览器截图（含 resize 前后）

### AC-15: 文件上传下载生效
- **Type**: `rule`
- **Given**: 进入文件上传页面
- **When**: 选择文件上传、点击预览/下载
- **Then**: 上传带进度条，预览正常，下载触发文件保存
- **Pass Condition**: 三个操作均成功
- **Evidence**: 浏览器交互 + Network

### AC-16: 富文本编辑器生效
- **Type**: `rule`
- **Given**: 进入富文本页面
- **When**: 输入内容、插入图片、提交
- **Then**: 编辑器工具栏可用，内容可获取，图片可插入
- **Pass Condition**: 提交后内容正确保存（mock）
- **Evidence**: 浏览器交互

### AC-17: Excel 导入导出生效
- **Type**: `rule`
- **Given**: 进入列表页
- **When**: 点击导出 Excel、选择 Excel 导入
- **Then**: 导出生成可下载的 xlsx 文件，导入解析后数据展示
- **Pass Condition**: 导出文件内容正确，导入数据行数匹配
- **Evidence**: 浏览器交互 + 文件内容

### AC-18: WebSocket 实时通信生效
- **Type**: `rule`
- **Given**: 进入消息页面
- **When**: 建立连接、接收推送消息
- **Then**: 连接成功（心跳），收到消息后弹通知并更新列表
- **Pass Condition**: 消息列表实时增长，心跳正常
- **Evidence**: 浏览器控制台 + 通知

### AC-19: 拖拽与虚拟滚动生效
- **Type**: `rule`
- **Given**: 进入高级交互页面
- **When**: 拖拽列表项排序、滚动虚拟列表
- **Then**: 拖拽后顺序更新，虚拟列表渲染仅可视区域，滚动流畅
- **Pass Condition**: 拖拽排序生效，虚拟列表 DOM 节点数远小于数据量
- **Evidence**: 浏览器交互 + DOM 检查

### AC-20: 主题切换生效
- **Type**: `rule`
- **Given**: 用户在顶栏点击主题切换
- **When**: 切换明暗模式或主题色
- **Then**: 全局样式立即切换，刷新后保持
- **Pass Condition**: 主题持久化且全局生效
- **Evidence**: 刷新后主题保持

### AC-21: 国际化生效
- **Type**: `rule`
- **Given**: 用户切换语言
- **When**: 切换为英文
- **Then**: 菜单、页面文案、Element Plus 组件文案切换为英文，刷新保持
- **Pass Condition**: 所有文案正确切换并持久化
- **Evidence**: 浏览器截图（中英对比）

## Open Questions
- [x] Mock 方案：采用 `vite-plugin-mock`（基于 Mock.js），与 Vite 集成度高，仅开发环境生效。

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
  - 心得/问题：ApiResponse/PageResult/PageQuery/UserInfo 已落在 `src/api/types.ts`（暂未按计划拆到 src/types/，后续可调整）；table 相关类型待做

### 阶段 2：状态与登录

- [ ] **T6 登录鉴权**（进行中）
  - 文件：`src/stores/user.ts`、`src/views/login/LoginView.vue`、路由守卫
  - 要点：token 存储、登录/登出、路由守卫拦截
  - 心得/问题：user store 与登录接口全链路已通（App.vue 临时按钮验证）；剩 LoginView 页面、路由守卫、登出按钮；request.ts 的 401 跳转依赖的 `/login` 路由随本任务创建

- [ ] **T7 Pinia 持久化与应用 Store**（进行中）
  - 文件：`src/stores/app.ts`、`main.ts` 注册持久化插件
  - 要点：`pinia-plugin-persistedstate`、user store 持久化、app store（侧边栏折叠/主题）
  - 心得/问题：main.ts 已注册插件、user store persist 已生效；坑——persist 类型靠插件 import 注入，不注册则类型报错且持久化静默失效；剩 app store。详见 jk-archive/patterns/pinia-plugin-persistedstate-类型扩展失效.md

### 阶段 3：布局与路由

- [ ] **T5 布局系统**
  - 文件：`src/layouts/DefaultLayout.vue`
  - 要点：侧边栏（可折叠）+ 顶栏 + 内容区；菜单基于路由动态生成；Element Plus Container
  - 组件通信：props / 插槽
  - 心得/问题：________________

- [ ] **路由结构与动态路由**
  - 文件：`src/router/index.ts`
  - 要点：静态路由 + 动态路由（按权限过滤）、路由 meta（title/roles/icon）
  - 心得/问题：________________

### 阶段 4：复用能力（重点练习）

- [ ] **T8 自定义 Composables**
  - `useTable`：列表查询、分页、loading、重置
  - `useForm`：表单数据、校验、重置、提交
  - `useModal`：弹窗显隐、确认回调
  - `usePermission`：权限判断
  - 心得/问题：________________

- [ ] **组件通信练习**（在以下页面中刻意使用）
  - props / emits：父子传值
  - v-model：表单组件双向绑定
  - 插槽 / 作用域插槽：表格列自定义
  - provide/inject：布局与子组件通信
  - 心得/问题：________________

### 阶段 5：业务页面

- [ ] **T9 业务列表 CRUD 页面**
  - 文件：`src/views/user/UserList.vue`
  - 要点：查询表单 + 表格 + 分页 + 新增/编辑弹窗 + 删除确认
  - 必须使用 `useTable` composable
  - 心得/问题：________________

- [ ] **T10 表单校验**
  - 要点：必填、长度、格式（手机号/邮箱）、自定义校验规则
  - 使用 `useForm` composable
  - 心得/问题：________________

- [ ] **T11 权限控制**
  - 要点：路由级（meta.roles + 守卫）、按钮级（`v-permission` 自定义指令）、无权限页
  - 心得/问题：________________

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

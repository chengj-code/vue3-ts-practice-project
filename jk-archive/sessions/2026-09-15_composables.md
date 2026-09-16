---
title: 自定义 Composables — useTable / useForm / useModal
type: session
date: 2026-09-15
status: 已完成
tags: [vue3, composable, typescript, 泛型, hook, element-plus]
related_files: [src/composables/useTable.ts, src/composables/useForm.ts, src/composables/useModal.ts, src/api/types.ts]
---

# 自定义 Composables — Task 8 全部三个

## 需求

spec Task 8：创建通用 composables，与 Task 9（用户列表 CRUD）衔接。三个 composable 分工：useTable 管拉数据、useForm 管提数据、useModal 管开关弹窗。

## 方案

### useTable — 列表查询三件套

- 泛型双参数：`<T>` 列表项类型（从 fetcher 返回值自动推导）、`<Q>` 查询参数额外字段（默认空对象）
- fetcher 参数 = `PageQuery & Q` 交叉类型，与项目已有 `PageQuery` / `PageResult<T>` 对齐
- watch page/pageSize 自动 fetch；不 watch query（防打字风暴）；finally 关 loading
- 不 import 具体 API，保持通用

### useForm — 表单提交三件套

- 泛型单参数：`<F>` 表单数据类型（从 initialData 自动推导）
- 集成 Element Plus `FormInstance`：submit 先 validate（失败 reject 需 catch）再调 onSubmit
- reset 同时 `clearValidate()` 清红框
- onSubmit 异常不 catch，让它冒泡到业务层（finally 只负责关 loading）

### useModal — 弹窗开关

- 泛型单参数：`<T = undefined>` 弹窗数据类型（新增场景 open() 不传参）
- confirm 成功才 close（失败不关弹窗，拦截器已弹错误提示）
- close 主动清 formData，防下次 open 残留

## 代码改动

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| src/composables/useTable.ts | 新增 | 泛型双参数 + watch 分页联动 |
| src/composables/useForm.ts | 新增 | Element Plus FormInstance 集成 + validate catch |
| src/composables/useModal.ts | 新增 | confirm 成功才 close + 新增场景受控断言 |

## 遇到的问题与解决

| 问题 | 原因 | 解决 | 教训/可复用点 |
|------|------|------|--------------|
| `ref<Q>({})` 类型报错 | `{}` 不是合法 Q | `as Q` 受控断言 | 泛型 ref 初始化常需断言 |
| FormInstance 不能直接从 element-plus 导入 | IDE 缓存问题（实际 2.14.5 确实导出了） | 重启 TS Server | 依赖升级后 IDE 可能需刷新 |
| `catch (error)` error 未使用 | ESLint no-unused-vars | 改成 `catch` | Prettier 也会自动清 |
| composable 顶层 import 具体 API | 耦合业务 | 删掉，fetcher/onConfirm 由调用方传 | composable 保持通用 |

## 在 Task 9 中的消费（2026-09-16）

useTable + useModal 在 UserListView 里首次完整消费，遇到的问题与解决：

| 问题 | 原因 | 解决 |
|------|------|------|
| `<el-table<UserItem>>` Vite 模板解析报错 | Vue SFC 模板不支持 TS 泛型 | 改回普通标签，row 类型用 `as UserItem` 断言 |
| query 两套状态（searchForm + useTable.query）不同步 | searchForm 绑模板，query 绑 API | 删掉 searchForm，模板直接 `v-model="query.name"` |
| handleSearch 双请求 | page.value=1 触发 watch fetch + 手动 fetch | 只设 page.value=1 靠 watch 自动 fetch |
| `<Q>` 没传 → 筛选参数类型宽松 → mock 严格比较不匹配 | useTable 默认 Q = Record<string, unknown> | 显式传 `<Q>` 对齐 mock 期望的 string 类型 |
| onConfirm 缺 ElMessage + fetch | 闭包内忘了引用 ElMessage 和 useTable.fetch | 补 import，onConfirm 成功后 fetch() 刷新列表 |
| dialogForm 缺 createTime 字段 | addUserApi 期望 Omit<UserItem,"id"> 含 createTime | dialogForm 加 createTime: '' 默认值 |
| useModal.formData 和 dialogForm 两套状态 | open(row) 只存 formData，el-form 绑 dialogForm | watch dialogVisible 打开时 Object.assign 同步 |
| handleDelete 删到当前页空但 page 不回退 | 边界场景未处理 | list 长度为 1 且 page > 1 时 page--（watch 自动 fetch） |

## 待办 / 后续

- [x] 在 UserListView 里消费 useTable + useForm + useModal（TR-8.3 已满足）
- [ ] `src/types/router.d.ts` RouteMeta 声明合并未建
- [ ] 脚手架遗留 HomeView/AboutView/counter.ts/base.css 待 Task 20 清理

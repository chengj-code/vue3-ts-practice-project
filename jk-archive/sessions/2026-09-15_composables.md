---
title: 自定义 Composables — useTable
type: session
date: 2026-09-15
status: 进行中（useTable 完成，useForm/useModal 待写）
tags: [vue3, composable, typescript, 泛型, hook, 列表]
related_files: [src/composables/useTable.ts, src/api/types.ts]
---

# 自定义 Composables — useTable 实现与泛型推导

## 需求

spec Task 8：创建通用 composables，与 Task 9（用户列表 CRUD）衔接。useTable 是第一个，封装列表查询三件套（数据 + 加载态 + 分页）。

## 方案

泛型双参数设计：

- `<T>` = 列表项类型，从 fetcher 返回值 `PageResult<T>` 自动推导
- `<Q>` = 查询参数额外字段类型，默认 `Record<string, unknown>`
- fetcher 参数 = `PageQuery & Q` 交叉类型，分页与筛选合并传给 API

关键设计决策：

- **不 watch query** —— 用户打字时不自动请求，防打字风暴；业务页面在"查询"按钮 click 时手动调 fetch()
- **finally 关 loading** —— 无论成功失败都关，错误让拦截器弹，composable 不吞异常
- **sync 回传的 page/pageSize** —— 后端可能纠正，同步保证状态一致
- **reset 主动 fetch** —— 清空 + 回到第一页 + 自动刷新
- **不 import 具体 API** —— composable 保持通用，业务页面传 fetcher 进来

## 代码改动

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| src/composables/useTable.ts | 新增 | 泛型双参数 + watch 分页联动 + finally 关 loading |

## 泛型推导四步法（从 any 到完整）

| 步骤 | 写法 | 效果 |
|---|---|---|
| 1 全 any | `ref<any[]>([])` | 能跑无提示 |
| 2 加 `<T>` | `ref<T[]>([])` | list 有类型，IDE 提示 |
| 3 加 `<Q>` | `ref<Q>({} as Q)` | query 字段有类型提示 |
| 4 对齐项目类型 | `PageQuery & Q` / `PageResult<T>` | 与 getUserListApi 签名自然对齐 |

## 遇到的问题与解决

| 问题 | 原因 | 解决 | 教训/可复用点 |
|------|------|------|--------------|
| `ref<Q>({})` 类型报错 | `{}` 不是合法 Q（Q 可能有必填字段） | `as Q` 受控断言 | 泛型 ref 初始化常需断言 |
| composable 顶层 import 具体 API | 误导性引用，耦合业务 | 删掉，fetcher 由调用方传 | composable 保持通用 |
| `<Q>` 缺默认值 | 调用方不传时 TS 报错 | `= Record<string, unknown>` | 泛型有约束时最好给默认 |
| `ref`/`watch` 靠 auto-import | 虽能跑但项目约定显式导入 | 补 `import { ref, watch } from 'vue'` | composable 文件显式导入 Vue API |

## 待办 / 后续

- [ ] useForm 实现（Task 8 第二件）
- [ ] useModal 实现（Task 8 第三件）
- [ ] 在 UserListView 里消费 useTable（TR-8.3，同时开启 Task 9）
- [ ] `src/types/router.d.ts` RouteMeta 声明合并未建

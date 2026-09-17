---
title: useTable watch 触发语义与查询防重（条件 fetch 模式）
type: pattern
date: 2026-09-17
verified: 2026-09-17
tags: [vue3, composable, useTable, watch, 防重复请求, element-plus, 分页]
related_files: [src/composables/useTable.ts, src/views/User/UserListView.vue]
source: sessions/2026-09-17_useTable查询失效与重复请求.md
---

# useTable watch 触发语义与查询防重（条件 fetch 模式）

## 适用场景

- 列表页「查询按钮点了没反应」（尤其在第 1 页时）
- 「翻页后再筛选掉两次接口」的重复请求
- 设计 useTable 类 composable 的 search/reset 触发机制时

## 方案要点

先记住两个 Vue 稳定语义（整个模式的地基）：

1. **ref 同值赋值不触发 watch**：`page.value = 1` 当已是 1 时，`Object.is` 相等，依赖不更新（阶段 1 根因）
2. **watch 对对象默认引用比较**：`() => query.value` 返回同一引用，内部属性 mutate 不触发；`deep: true` 能触发但查询框每击键发请求（方案 C 失败原因）

防重设计三选一：

| 方案 | 请求次数 | 风险 |
|------|----------|------|
| ~~状态标记（skipNextWatch）~~ | 1 次 | 标记设了没消费 → 残留吞掉下一次翻页 ❌ |
| ~~deep watch query~~ | 每次击键 | 体验差 ❌ |
| **条件 fetch（推荐）** | 1 次 | 无状态、无残留 ✅ |

条件 fetch 核心：**值没变 → 手动 fetch；值变了 → 交给 watch**。每个分支显式知道请求由谁发出。

## 示例

```ts
// watch 恢复纯净，只管真正的用户翻页
watch([page, pageSize], () => {
    fetch();
})

// 搜索：已在第一页就手动发（同值赋值不触发 watch），否则改 page 交给 watch
const search = () => {
    if (page.value === 1) {
        fetch();
    } else {
        page.value = 1;
    }
};

// 重置：分页参数均未变化时手动 fetch，否则交给 watch 触发
const reset = () => {
    query.value = {} as Q;
    if (page.value === 1 && pageSize.value === defaultPageSize) {
        fetch();
    } else {
        page.value = 1;
        pageSize.value = defaultPageSize;
    }
};
```

消费方：`const { search, reset } = useTable(...)`，`handleSearch = () => search()`。

## 注意事项 / 坑

- **不要靠「把 page 改成 1」间接触发 fetch**：page 已是 1 时是同值赋值，watch 不跑——这就是「page 1 搜索 bug」
- **不要用 skip 标记防重**：第 1 页查询时 watch 不触发 → 标记无人消费 → 下一次正常翻页被残留标记吞掉（翻页失效一次）
- **page + pageSize 同 tick 同时变化**：数组源 watch 只触发一次（Vue 批量调度），reset 里不用担心双请求
- **query 不进 watch**：查询表单的触发权在用户（点按钮），自动触发要么 deep（击键发请求）要么 debounce（另一种需求形态）
- fetch 本身仍保留导出：删除/新增后刷新列表继续直接调 fetch，与 search/reset 互不干扰

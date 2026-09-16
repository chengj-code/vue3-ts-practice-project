---
title: Vue SFC 模板不能写 TypeScript 泛型
type: pattern
date: 2026-09-16
verified: 2026-09-16
tags: [vue3, vite, 模板编译, typescript, element-plus]
related_files: [src/views/User/UserListView.vue]
source: sessions/2026-09-16_用户列表CRUD.md
---

# Vue SFC 模板不能写 TypeScript 泛型

## 适用场景

Vue SFC `<template>` 里想给组件写泛型参数（如 `<el-table<UserItem>>`），运行时 Vite 报 "Invalid end tag" 或类型检查报 "DefaultRow is not assignable to UserItem"。

## 方案要点

**根因**：Vue SFC 模板是 HTML 超集，只支持 Vue 指令（v-if / :attr / {{ expr }}），TypeScript 泛型 `<T>` 是 script 层面的特性，模板标签名上不能写。Vite 的模板解析器把 `<el-table<UserItem>>` 当成非法标签 —— 找不到 `</el-table<UserItem>>` 的闭合就报 "Invalid end tag"。

## 示例

```html
<!-- ❌ 错误：模板不能写泛型 -->
<el-table<UserItem> :data="list">
  <template #default="{ row }">
    <!-- row 类型不确定 -->
  </template>
</el-table>

<!-- ✅ 正确 1：去掉泛型，row 用类型断言 -->
<el-table :data="list">
  <template #default="{ row }">
    <el-button @click="handleEdit(row as UserItem)">编辑</el-button>
  </template>
</el-table>

<!-- ✅ 正确 2：在 script 里定义行类型别名 -->
<script setup lang="ts">
type Row = UserItem
</script>
<template>
  <el-table :data="list">
    <template #default="{ row }">
      <el-button @click="handleEdit(row as Row)">编辑</el-button>
    </template>
  </el-table>
</template>
```

## 注意事项 / 坑

- 这个问题在 Element Plus 新版（2.14+）特别明显：`el-table` 泛型 `RowT` 在 TS 类型层是泛型组件，但模板里泛型被忽略，row 类型退化为 `DefaultRow`
- `as UserItem` 断言**只在编译时有效**，运行时无任何检查 —— 如果数据源类型真的变了，断言会掩盖类型错误
- v-model 绑定 query.name 这类 ref 字段时，模板里直接写 `query.name`（自动解包），不要写 `query.value.name`

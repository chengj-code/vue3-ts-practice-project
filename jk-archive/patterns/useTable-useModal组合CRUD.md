---
title: useTable + useModal 组合实现 CRUD 页面
type: pattern
date: 2026-09-16
verified: 2026-09-16
tags: [vue3, composable, CRUD, useTable, useModal, element-plus, typescript]
related_files: [src/composables/useTable.ts, src/composables/useModal.ts, src/views/User/UserListView.vue]
source: sessions/2026-09-16_用户列表CRUD.md
---

# useTable + useModal 组合实现 CRUD 页面

## 适用场景

管理后台的列表 + 新增/编辑 + 删除标准 CRUD 页面。useTable 管列表数据（分页/筛选/刷新），useModal 管弹窗开关（新增/编辑共用），两者组合覆盖 80% 的业务列表场景。

## 方案要点

1. **useTable 消费**：`<T, Q>` 显式传 Q 对齐后端/mock 期望的筛选参数类型；模板直接绑 `query.name` 而不是维护第二套 searchForm 状态
2. **handleSearch 只设 page**：`page.value = 1` 靠 watch 自动 fetch，不要手动再加 fetch() 导致双请求
3. **useModal 消费**：解构 `visible / formData / open / close / confirm`；el-dialog 绑 visible，取消按钮用 close（同步清 formData）
4. **两套表单状态同步**：useModal 的 formData（存 row 原始数据）和 el-form 的 model（reactive 弹窗表单）是两套状态，用 watch visible 打开时 Object.assign 同步
5. **onConfirm 里区分新增/编辑**：`formData.value?.id` 存在 → update，否则 add；成功后 fetch() 刷新列表
6. **onConfirm 必须补 ElMessage + fetch**：useModal 只管开关弹窗，业务层自己负责用户反馈和列表刷新
7. **删除边界处理**：删到当前页只剩 1 条且 page > 1 时 `page.value -= 1`，watch 自动 fetch 上一页

## 示例

```typescript
// useTable 消费
const { query, fetch, reset, list, loading, total, page, pageSize } = useTable<UserItem, { name?: string; status?: string }>(
  getUserListApi,
  { immediate: true }
)

// useModal 消费
const { visible: dialogVisible, formData: dialogFormData, open, close, confirm } = useModal<UserItem>({
  onConfirm: async () => {
    if (dialogFormData.value?.id) {
      await updateUserApi(dialogFormData.value.id, dialogForm)
      ElMessage.success('更新成功')
    } else {
      await addUserApi(dialogForm)
      ElMessage.success('新增成功')
    }
    fetch()  // 刷新列表
  },
})

// watch 同步两套表单状态
watch(dialogVisible, (visible) => {
  if (!visible) return
  Object.assign(dialogForm, dialogFormData.value ?? { id: 0, name: '', ... })
})

// 查询只设 page
const handleSearch = () => { page.value = 1 }
```

## 注意事项 / 坑

- useTable 的 query 是 ref，模板 v-model 绑时直接 `query.name`（不要 `query.value.name`）
- useModal 的 close 会清 formData，但不会清弹窗内 el-form 的校验提示 —— 需要 formRef.clearValidate() 时在 watch 里补
- confirm 失败时 useModal 内部 catch 了不会关弹窗 —— 这是正确行为，用户可以修改后重试
- dialogForm 必须包含 addUserApi 期望的所有字段（如 createTime），即使新增时默认空字符串
- 删除操作独立用 ElMessageBox，不走 useModal（useModal 管 el-dialog）

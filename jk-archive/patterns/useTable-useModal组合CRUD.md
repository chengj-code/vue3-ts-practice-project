---
title: useTable + useModal + useForm 组合实现 CRUD 页面
type: pattern
date: 2026-09-16
verified: 2026-09-16
revised: 2026-09-17
tags: [vue3, composable, CRUD, useTable, useModal, useForm, element-plus, typescript]
related_files: [src/composables/useTable.ts, src/composables/useModal.ts, src/composables/useForm.ts, src/views/User/UserListView.vue]
source: sessions/2026-09-16_用户列表CRUD.md
---

# useTable + useModal + useForm 组合实现 CRUD 页面

## 适用场景

管理后台的列表 + 新增/编辑 + 删除标准 CRUD 页面。useTable 管列表数据，useModal 管弹窗开关 + API 调用，useForm 管表单数据 + 校验 + loading。三者组合覆盖 80% 的业务列表场景。

## 方案要点

### useTable 消费

1. `<T, Q>` 显式传 Q 对齐后端/mock 期望的筛选参数类型
2. 模板直接绑 `query.name`，不维护第二套 searchForm 状态
3. handleSearch 只设 `page.value = 1`，靠 watch 自动 fetch（**不手动调 fetch**，避免双请求）

### useModal 消费（只管弹窗 + API）

4. 解构 `visible / formData / open / close / confirm`
5. onConfirm **只放 API 逻辑**（add/update + ElMessage + fetch），不做表单校验
6. onConfirm 里区分新增/编辑：`formData.value?.id` 存在 → update，否则 add
7. 删除边界处理：删到当前页只剩 1 条且 page > 1 时 `page.value -= 1`

### useForm 消费（只管表单 + 校验）

8. el-form `:model` 直接绑 useForm 返回的 `form`，**不要再手动声明 dialogForm**
9. el-form `ref` 直接绑 useForm 返回的 `formRef`，**不要再手动声明 formRef**
10. onSubmit **空实现**（API 全在 useModal.onConfirm），useForm 只做 validate
11. 弹窗打开时 watch visible，Object.assign(form.value, formData.value ?? 默认值) 同步数据
12. handleSubmit 串联但**必须带门禁**：submit 返回 `Promise<boolean>`（校验失败 false / 成功 true），`if (!(await submitForm())) return` 后再 `await confirm()`。2026-09-17 走查抓到过无门禁版本空表单绕过校验直接入库的线上级 bug（见 sessions/2026-09-17_task20验收与useForm校验门禁修复.md）

### useForm 泛型约束调整

13. `F extends object` 而非 `F extends Record<string, unknown>`，因为 interface 没有索引签名

### 异步校验器（用户名查重）

14. Element Plus async validator 统一用 callback：校验失败 callback(new Error)，其他 callback()
15. 空值交给 required 规则拦截，validator 直接 callback()
16. 编辑模式跳过查重
17. mock 查重接口用 GET + query 参数，避免和新增路由（POST /api/user）冲突

## 示例

```typescript
// 1. useTable：列表 + 分页 + 筛选
const { query, fetch, reset, list, loading: listLoading, total, page, pageSize } =
  useTable<UserItem, { name?: string; status?: string }>(getUserListApi, { immediate: true })

// 2. useForm：表单数据 + 校验 + loading
const defaultForm = { id: 0, name: '', age: 18, email: '', phone: '', status: true, createTime: '' }
const { form, formRef, loading, submit: submitForm } = useForm<DialogForm>({
  initialData: { ...defaultForm },
  onSubmit: async () => { /* API 全在 useModal.onConfirm */ },
})

// 3. useModal：弹窗开关 + API
const { visible: dialogVisible, formData: dialogFormData, open, close, confirm } = useModal<UserItem>({
  onConfirm: async () => {
    if (dialogFormData.value?.id) {
      await updateUserApi(dialogFormData.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await addUserApi(form.value)
      ElMessage.success('新增成功')
    }
    fetch()
  },
})

// 4. 弹窗打开时同步表单数据
watch(dialogVisible, (visible) => {
  if (!visible) return
  Object.assign(form.value, dialogFormData.value ?? { ...defaultForm })
})

// 5. handleSubmit 串联两者（门禁不可省）
const handleSubmit = async () => {
  const valid = await submitForm() // validate → onSubmit(空) → loading 自动关；失败返回 false
  if (!valid) return               // 校验不过必须拦住，否则 confirm 会让脏数据入库
  await confirm()                  // onConfirm(调 API) → 成功后 close
}
```

模板：

```html
<el-form :model="form" ref="formRef" :rules="formRules">
  <el-form-item prop="name"><el-input v-model="form.name" /></el-form-item>
  ...
</el-form>
<el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
```

## 注意事项 / 坑

- **submit 结果必须门禁 confirm**（2026-09-17 血泪修正）：useForm 校验失败不抛错只返回 false，页面侧无条件继续 await confirm 就会空/脏数据入库。表单校验的验收必须包含反向断言「非法数据时请求根本没发出」，只看红字提示不够
- API 逻辑**只放一处**（useModal.onConfirm），useForm.onSubmit 必须空实现，否则会双调
- useForm 返回的 `form` 和模板 `:model` 绑定，不要再手动声明 reactive dialogForm
- useForm 返回的 `formRef` 和模板 `ref` 绑定，不要再手动声明 ref
- useTable 的 query 是 ref，模板 v-model 绑时直接 `query.name`（不要 `query.value.name`）
- useModal.close 会清 formData，但不会清 el-form 校验提示 —— 需要 formRef.clearValidate() 时在 watch 里补
- confirm 失败时 useModal 内部 catch 了不会关弹窗 —— 正确行为，用户可修改重试
- dialogForm 必须包含 addUserApi 期望的所有字段（如 createTime），即使新增时默认空字符串
- 删除操作独立用 ElMessageBox，不走 useModal（useModal 管 el-dialog）
- mock 查重接口用 GET，POST 会和新增路由冲突

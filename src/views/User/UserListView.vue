<template>
  <div class="user-list">
    <!-- 页头：控制台风格的模块标识 -->
    <div class="page-head">
      <p class="page-eyebrow">SYSTEM // USER MANAGEMENT</p>
      <h2 class="page-title">用户管理</h2>
    </div>

    <!-- 查询表单 -->
    <el-card class="console-card search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="query.name" placeholder="请输入姓名" @keyup.enter="handleSearch" clearable
            style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" value="true" />
            <el-option label="禁用" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button class="btn-reset" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 + 表格 -->
    <el-card class="console-card table-card">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <i class="title-bar" />
            用户列表
          </div>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <el-table :data="list" v-loading="listLoading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'" effect="plain">
              {{ row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row as UserItem)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row as UserItem)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" background />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗（console-dialog 为 teleport 到 body 后的全局命名空间样式） -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" destroy-on-close class="console-dialog">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="form.age" :min="1" :max="120" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormRules } from 'element-plus'
import { addUserApi, deleteUserApi, getUserByNameApi, getUserListApi, updateUserApi, type UserItem } from '@/api/modules/list'
import { useTable } from '@/composables/useTable'
import { useModal } from '@/composables/useModal'
import { useForm } from '@/composables/useForm'

// ========== 查询表单 ==========

const { query, fetch, search, reset, list, loading: listLoading, total, page, pageSize } = useTable<UserItem, { name?: string; status?: string }>(
  getUserListApi,
  { immediate: true }
)

// ========== 弹窗表单（useForm 管校验 + loading + 表单数据） ==========

interface DialogForm {
  id: number
  name: string
  age: number
  email: string
  phone: string
  status: boolean
  createTime: string
}

const defaultDialogForm: DialogForm = {
  id: 0, name: '', age: 18, email: '', phone: '', status: true, createTime: '',
}

const { form, formRef, loading, submit: submitForm } = useForm<DialogForm>({
  initialData: { ...defaultDialogForm },
  onSubmit: async () => {
    // API 逻辑全在 useModal.onConfirm，这里空实现
  },
})

// ========== 弹窗开关（useModal 管开关 + API 调用） ==========

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

const isEdit = computed(() => !!dialogFormData.value?.id)
const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

// ========== 校验规则 ==========

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    {
      trigger: 'blur',
      validator: async (_rule, value, callback) => {
        if (!value) return callback()  // 空值由 required 规则拦截
        if (isEdit.value) return callback()  // 编辑跳过
        try {
          const user = await getUserByNameApi(value)
          if (user) {
            callback(new Error('该姓名已存在'))
          } else {
            callback()
          }
        } catch {
          callback()  // mock 接口异常时不阻塞提交
        }
      },
    },
  ],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

// ========== 弹窗打开时同步表单数据 ==========

watch(dialogVisible, (visible) => {
  if (!visible) return
  Object.assign(form.value, dialogFormData.value ?? { ...defaultDialogForm })
})

// ========== 事件处理 ==========

const handleSearch = () => search()

const handleReset = () => { reset() }

const handleAdd = () => { open() }

const handleEdit = (row: UserItem) => { open(row) }

const handleDelete = async (row: UserItem) => {
  try {
    await ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '警告', { type: 'warning' })
    await deleteUserApi(row.id)
    ElMessage.success('删除成功')
    fetch()
    // 边界：删完当前页空了且 page > 1，回退一页
    if (list.value.length === 1 && page.value > 1) {
      page.value -= 1  // watch 自动 fetch
    }
  } catch {
    // 用户点取消静默
  }
}

const handleSubmit = async () => {
  await submitForm()  // useForm: validate → onSubmit(空) → loading 自动关
  await confirm()     // useModal: onConfirm(调 API) → 成功后 close
}
</script>

<style scoped lang="scss">
.user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ============ 页头 ============ */
.page-head {
  padding: 2px 2px 4px;
}

.page-eyebrow {
  margin: 0 0 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.26em;
  color: var(--console-accent);
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--console-text-1);
}

/* ============ 卡片 ============ */
.console-card {
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--console-line);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.search-card {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.btn-reset {
  --el-button-text-color: var(--console-text-2);
  --el-button-bg-color: rgba(255, 255, 255, 0.03);
  --el-button-border-color: var(--console-line-strong);

  &:hover {
    --el-button-text-color: var(--console-text-1);
    --el-button-bg-color: rgba(255, 255, 255, 0.06);
    --el-button-border-color: #3a4653;
  }
}

/* ============ 表格卡头 ============ */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--console-text-1);
}

.title-bar {
  width: 3px;
  height: 14px;
  background: var(--console-accent);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.7);
}

/* ============ 表格 ============ */
.table-card {
  :deep(.el-table) {
    /* 透明底，让卡片底色透出；表头/hover/边框单独定制 */
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: #111a23;
    --el-table-header-text-color: var(--console-text-2);
    --el-table-border-color: var(--console-line);
    --el-table-row-hover-bg-color: rgba(52, 211, 153, 0.06);
    --el-table-fixed-box-shadow: -8px 0 12px -8px rgba(0, 0, 0, 0.6);

    font-size: 13px;
  }

  :deep(.el-table__header-wrapper) {
    font-family: var(--font-body);
  }

  :deep(th.el-table__cell) {
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  /* 斑马纹：暗色下只提亮一点点 */
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
    background: rgba(255, 255, 255, 0.018);
  }

  :deep(.el-table__inner-wrapper::before) {
    background-color: var(--console-line);
  }
}

/* ============ 分页 ============ */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
</style>

<!-- 弹窗 teleport 到 body，scoped 选择器够不到，用命名空间全局样式 -->
<style lang="scss">
.console-dialog {
  padding: 4px;
  background: #131b24;
  border: 1px solid #1e2730;
  border-radius: 14px;
  box-shadow: 0 32px 80px -24px rgba(0, 0, 0, 0.85);

  .el-dialog__header {
    margin-right: 0;
    padding: 18px 22px;
    border-bottom: 1px solid #1e2730;
  }

  .el-dialog__title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .el-dialog__headerbtn {
    top: 16px;
  }

  .el-dialog__body {
    padding: 24px 22px 8px;
  }

  .el-dialog__footer {
    padding: 12px 22px 20px;
  }
}
</style>

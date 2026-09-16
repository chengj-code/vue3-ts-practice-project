<template>
  <div class="user-list">
    <!-- 查询表单 -->
    <el-card class="search-card">
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
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 + 表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'" effect="light">
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" destroy-on-close>
      <el-form :model="dialogForm" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="dialogForm.age" :min="1" :max="120" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="dialogForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="dialogForm.status" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { addUserApi, deleteUserApi, getUserListApi, updateUserApi, type UserItem } from '@/api/modules/list'
import { useTable } from '@/composables/useTable'
import { useModal } from '@/composables/useModal'

// ========== 查询表单 ==========

const { query, fetch, reset, list, loading, total, page, pageSize } = useTable<UserItem, { name?: string; status?: string }>(
  (params) => {
    return getUserListApi(params)
  },
  {
    immediate: true,
  }
)

const { visible: dialogVisible, formData: dialogFormData, open, close, confirm } = useModal<UserItem>({
  onConfirm: async (data) => {
    if (dialogFormData.value?.id) {
      await updateUserApi(dialogFormData.value?.id, dialogForm);
      ElMessage.success('更新成功')
    } else {
      await addUserApi(dialogForm);
      ElMessage.success('新增成功')
    }
    fetch()
  }
})

// ========== 弹窗 ==========
// dialogForm 里加 createTime 字段（默认空字符串）
const dialogForm = reactive({
  id: 0,
  name: '',
  age: 18,
  email: '',
  phone: '',
  status: true,
  createTime: '',  // ← 补上，新增时 mock 会替换，编辑时从 row 带过来
})
const submitLoading = ref(false)
const isEdit = computed(() => !!dialogFormData.value?.id)
const formRef = ref<FormInstance | null>(null)

const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
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

const handleSearch = () => {
  page.value = 1;
}

const handleReset = () => {
  reset();
}
// 推荐：加一个 watch，弹窗打开时自动同步 dialogForm
watch(dialogVisible, (visible) => {
  if (!visible) return
  // dialogFormData.value 来自 useModal.open(row)
  // - 新增时：undefined → 用默认值
  // - 编辑时：UserItem → 直接赋值
  Object.assign(dialogForm, dialogFormData.value ?? {
    id: 0, name: '', age: 18, email: '', phone: '', status: true, createTime: '',
  })
})

const handleAdd = () => {
  open();
}

const handleEdit = (row: UserItem) => {
  open(row)
}


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
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitLoading.value = true
    await confirm();
  } catch {
    // 校验失败
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.table-card {
  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

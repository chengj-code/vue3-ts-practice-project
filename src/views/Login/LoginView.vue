<template>
    <div class="login-view">
        <div class="login-card">
            <h2 class="login-title">系统登录</h2>
            <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="login-form">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="login-btn" @click="submitForm">登录</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { ElForm } from 'element-plus';
import router from '@/router';
import { useUserStore } from '@/stores/user';
import { loginApi } from '@/api/modules/user';
type ElFormInstance = InstanceType<typeof ElForm>;
const formRef = ref<ElFormInstance | null>(null);
const form = ref({
    username: 'admin',
    password: '123456'
});
const userStore = useUserStore();
const route = useRoute();
const redirect = (route.query.redirect as string) ?? '/';

const checkPasswordValidator = (rule: any, value: any, callback: any) => {
    if (!value) {
        return callback(new Error('请输入密码'));
    } else if (value.length < 6) {
        return callback(new Error('密码长度不能小于6位'));
    } else {
        return callback();
    }
}

const rules = ref({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ validator: checkPasswordValidator, trigger: 'blur' }]
});

const submitForm = async () => {
    try {
        await formRef.value?.validate()
    } catch {
        return;
    }
    try {
        const res = await loginApi(form.value);
        userStore.setToken(res.token);
        userStore.setUserInfo(res.userInfo);
        ElMessage.success('登录成功');
        router.replace(redirect);
    } catch {
        // request.ts 拦截器已弹 ElMessage，这里只吞异常防 unhandled rejection
    }
}
</script>

<style scoped lang="scss">
.login-view {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
}

.login-card {
    width: 380px;
    padding: 40px 32px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.login-title {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 28px;
}

.login-form {
    .el-form-item {
        margin-bottom: 22px;
    }
}

.login-btn {
    width: 100%;
}
</style>

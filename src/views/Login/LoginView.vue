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
                    <el-button type="primary" class="login-btn" :loading="loading" @click="submit">登录</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script setup lang="ts">
import router from '@/router';
import { useUserStore } from '@/stores/user';
import { loginApi, type LoginParams } from '@/api/modules/user';
import { useForm } from '@/composables/useForm';
import type { FormItemRule, FormRules } from 'element-plus';
const defaultFormData = {
    username: 'admin',
    password: '123456'
}
const userStore = useUserStore();
const route = useRoute();
const redirect = (route.query.redirect as string) ?? '/';

// type FormItemRuleValidator = (rule: FormItemRule, value: unknown, callback: (error?: string | Error) => void) => void | Promise<void>
// const checkPasswordValidator = (rule, value, callback) => {
//     if (!value) {
//         return callback(new Error('请输入密码'));
//     } else if (String(value).length < 6) {
//         return callback(new Error('密码长度不能小于6位'));
//     } else {
//         return callback();
//     }
// }
const rules: FormRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        {
            validator: (_rule, value, callback) => {
                if (String(value).length < 6) {
                    return callback(new Error('密码长度不能小于6位'));
                } else {
                    return callback();
                }
            },
            trigger: 'blur'
        }]
}
const { form, formRef, submit, loading } = useForm<LoginParams>({
    initialData: { ...defaultFormData },
    onSubmit: async (data) => {
        try {
            const res = await loginApi(data);
            userStore.setToken(res.token);
            userStore.setUserInfo(res.userInfo);
            ElMessage.success('登录成功');
            router.replace(redirect);
        } catch {
        }
    }
})
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

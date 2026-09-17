<template>
  <div class="login-view">
    <!-- 左侧品牌区：控制台氛围（网格 + 光晕 + 扫描线 + 终端状态卡） -->
    <aside class="brand-panel">
      <div class="brand-top">
        <div class="logo-mark"><span /></div>
        <span class="brand-name">CONSOLE//OS</span>
      </div>

      <div class="brand-main">
        <p class="brand-eyebrow">VUE 3 · TYPESCRIPT · PINIA · ELEMENT PLUS</p>
        <h1 class="brand-headline">
          从一个登录框开始，<br />
          练完<span class="accent">整条前端工程链路</span>
        </h1>

        <div class="status-card">
          <div class="status-row">
            <span class="dot" />
            <span class="status-key">AUTH SERVICE</span>
            <span class="status-dots">··············</span>
            <span class="status-val ok">ONLINE</span>
          </div>
          <div class="status-row">
            <span class="dot" />
            <span class="status-key">ROUTE GUARD</span>
            <span class="status-dots">···············</span>
            <span class="status-val ok">ARMED</span>
          </div>
          <div class="status-row">
            <span class="dot" />
            <span class="status-key">MOCK SERVER</span>
            <span class="status-dots">··············</span>
            <span class="status-val ok">RUNNING</span>
          </div>
          <div class="status-row status-cursor-line">
            <span class="prompt">$</span>
            <span class="status-cmd">await signIn()</span>
            <span class="cursor" />
          </div>
        </div>
      </div>

      <div class="brand-footer">
        <span>VUE3-TS-PRACTICE</span>
        <span>LOCAL DEV / BUILD 2026.09</span>
      </div>
    </aside>

    <!-- 右侧表单区：所有绑定与校验逻辑保持原样，仅改呈现 -->
    <main class="form-panel">
      <div class="login-card">
        <p class="form-eyebrow">SIGN IN</p>
        <h2 class="form-title">欢迎登录控制台</h2>

        <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          class="login-form"
          @keyup.enter="submit"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="UserIcon"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              :prefix-icon="LockIcon"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" :loading="loading" @click="submit">
              进 入 控 制 台
            </el-button>
          </el-form-item>
        </el-form>

        <div class="test-hint">
          <span class="hint-label">TEST ACCOUNT</span>
          <span class="hint-code">admin / 123456</span>
          <span class="hint-sep">·</span>
          <span class="hint-code">user / 123456</span>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
// 仅新增两个图标 import（展示用途），其余逻辑一行未动
import { User as UserIcon, Lock as LockIcon } from '@element-plus/icons-vue'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { loginApi, type LoginParams } from '@/api/modules/user'
import { useForm } from '@/composables/useForm'
import type { FormRules } from 'element-plus'
const defaultFormData = {
  username: 'admin',
  password: '123456',
}
const userStore = useUserStore()
const route = useRoute()
const redirect = (route.query.redirect as string) ?? '/'

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
          return callback(new Error('密码长度不能小于6位'))
        } else {
          return callback()
        }
      },
      trigger: 'blur',
    },
  ],
}
const { form, formRef, submit, loading } = useForm<LoginParams>({
  initialData: { ...defaultFormData },
  onSubmit: async (data) => {
    try {
      const res = await loginApi(data)
      userStore.setToken(res.token)
      userStore.setUserInfo(res.userInfo)
      ElMessage.success('登录成功')
      router.replace(redirect)
    } catch {}
  },
})
</script>

<style scoped lang="scss">
/* ============ 设计 Token（仅本页作用域，不污染全局 / 不影响 T18 主题切换） ============ */
.login-view {
  --bg-base: #0a0f15;
  --bg-brand: #0b1118;
  --bg-form: linear-gradient(180deg, #0c1219 0%, #090e14 100%);
  --surface: rgba(255, 255, 255, 0.035);
  --line: rgba(148, 163, 184, 0.16);
  --accent: #34d399;
  --accent-bright: #6ee7b7;
  --accent-deep: #052018;
  --danger: #f87171;
  --text-1: #e6edf3;
  --text-2: #93a1b3;
  --text-3: #5d6b7c;
  --font-display: 'Chakra Petch', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'JetBrains Mono', 'Cascadia Code', Consolas, monospace;
  --font-body: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif;

  display: flex;
  height: 100%;
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-1);
  font-family: var(--font-body);
}

/* ============ 左侧品牌区 ============ */
.brand-panel {
  position: relative;
  flex: 1 1 56%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  padding: 44px 56px;
  overflow: hidden;
  background:
    radial-gradient(900px 620px at 82% 12%, rgba(16, 185, 129, 0.17), transparent 62%),
    radial-gradient(680px 680px at 6% 96%, rgba(56, 189, 248, 0.07), transparent 60%),
    var(--bg-brand);
}

/* 网格纹理：边缘用 mask 淡出，避免硬边 */
.brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.07) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse at 60% 40%, black 25%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse at 60% 40%, black 25%, transparent 78%);
  pointer-events: none;
}

/* 缓慢下移的扫描光带 */
.brand-panel::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -140px;
  height: 140px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(52, 211, 153, 0.045) 45%,
    rgba(52, 211, 153, 0.08) 50%,
    rgba(52, 211, 153, 0.045) 55%,
    transparent
  );
  animation: scan 9s linear infinite;
  pointer-events: none;
}

.brand-top,
.brand-main,
.brand-footer {
  position: relative;
  z-index: 1;
}

.brand-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  position: relative;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(52, 211, 153, 0.55);
  border-radius: 9px;

  span {
    position: absolute;
    inset: 8px;
    background: var(--accent);
    border-radius: 3px;
    box-shadow: 0 0 14px rgba(52, 211, 153, 0.7);
    animation: breathe 2.6s ease-in-out infinite;
  }
}

.brand-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--text-1);
}

.brand-eyebrow {
  margin: 0 0 18px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.22em;
  color: var(--accent);
  opacity: 0.85;
}

.brand-headline {
  margin: 0 0 36px;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.02em;

  .accent {
    position: relative;
    color: var(--accent-bright);
    white-space: nowrap;
  }
}

/* 终端状态卡 */
.status-card {
  width: 100%;
  max-width: 420px;
  padding: 20px 22px;
  background: rgba(10, 16, 23, 0.72);
  border: 1px solid var(--line);
  border-radius: 12px;
  backdrop-filter: blur(6px);
  font-family: var(--font-mono);
  font-size: 13px;
  box-shadow: 0 24px 60px -30px rgba(0, 0, 0, 0.9);
}

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 2;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
    animation: breathe 2.6s ease-in-out infinite;
  }

  .status-key {
    color: var(--text-2);
  }

  .status-dots {
    flex: 1;
    color: rgba(148, 163, 184, 0.35);
    letter-spacing: 2px;
    overflow: hidden;
    white-space: nowrap;
  }

  .status-val {
    font-weight: 600;

    &.ok {
      color: var(--accent-bright);
    }
  }

  .prompt {
    color: var(--accent);
  }

  .status-cmd {
    color: var(--text-2);
  }
}

.status-cursor-line {
  margin-top: 2px;
  border-top: 1px dashed rgba(148, 163, 184, 0.14);
  padding-top: 6px;
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: var(--accent);
  animation: blink 1.1s steps(1) infinite;
}

.brand-footer {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--text-3);
}

/* ============ 右侧表单区 ============ */
.form-panel {
  flex: 0 0 44%;
  min-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--bg-form);
  border-left: 1px solid var(--line);
}

.login-card {
  width: 100%;
  max-width: 372px;
}

.form-eyebrow {
  margin: 0 0 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.3em;
  color: var(--accent);
}

.form-title {
  margin: 0 0 34px;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  /* 暗色输入框：毛玻璃底 + 细边，聚焦时翡翠绿描边+光晕 */
  :deep(.el-input__wrapper) {
    padding: 5px 14px;
    background: var(--surface);
    border-radius: 10px;
    box-shadow: inset 0 0 0 1px var(--line);
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
    }
  }

  :deep(.el-input.is-focus .el-input__wrapper),
  :deep(.el-input__wrapper.is-focus) {
    box-shadow:
      inset 0 0 0 1px var(--accent),
      0 0 0 3px rgba(52, 211, 153, 0.12);
  }

  :deep(.el-input__inner) {
    height: 36px;
    color: var(--text-1);

    &::placeholder {
      color: var(--text-3);
    }
  }

  :deep(.el-input__prefix-inner),
  :deep(.el-input__suffix-inner) {
    color: var(--text-2);
    font-size: 16px;
  }

  :deep(.el-form-item__error) {
    color: var(--danger);
  }
}

.login-btn {
  width: 100%;
  height: 46px;
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  /* 抵消字间距造成的视觉偏移 */
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-deep);
  border-radius: 10px;
  box-shadow: 0 10px 28px -10px rgba(52, 211, 153, 0.55);
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;

  &:hover,
  &:focus {
    background: var(--accent-bright);
    border-color: var(--accent-bright);
    color: var(--accent-deep);
    box-shadow: 0 12px 32px -10px rgba(52, 211, 153, 0.7);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.test-hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px dashed rgba(148, 163, 184, 0.18);
  font-family: var(--font-mono);
  font-size: 12px;

  .hint-label {
    color: var(--text-3);
    letter-spacing: 0.16em;
  }

  .hint-code {
    color: var(--text-2);
  }

  .hint-sep {
    color: var(--text-3);
  }
}

/* ============ 入场动画：子元素错峰浮现 ============ */
.brand-top {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.brand-eyebrow {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
}

.brand-headline {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.16s both;
}

.status-card {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.26s both;
}

.brand-footer {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.34s both;
}

.form-eyebrow {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.14s both;
}

.form-title {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both;
}

.login-form {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
}

.test-hint {
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@keyframes breathe {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.55;
    transform: scale(0.86);
  }
}

@keyframes scan {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(calc(100vh + 140px));
  }
}

/* ============ 响应式：窄屏隐藏品牌区，表单全屏居中 ============ */
@media (max-width: 960px) {
  .brand-panel {
    display: none;
  }

  .form-panel {
    flex: 1;
    min-width: 0;
    border-left: none;
  }
}
</style>

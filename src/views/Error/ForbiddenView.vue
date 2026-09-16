<template>
    <!-- 403 与登录页同一世界观：暗色底 + 网格 + 翡翠绿强调，主体是一张"终端报错卡" -->
    <div class="forbidden-page">
        <div class="forbidden-inner">
            <p class="error-eyebrow">ACCESS DENIED</p>
            <div class="error-numeral">403</div>

            <div class="terminal-card">
                <div class="terminal-bar">
                    <span class="bar-dot red" />
                    <span class="bar-dot yellow" />
                    <span class="bar-dot green" />
                    <span class="bar-title">zsh — permission check</span>
                </div>
                <div class="terminal-body">
                    <p class="term-line">
                        <span class="prompt">$</span>
                        <span class="cmd">run /user/list</span>
                    </p>
                    <p class="term-line error">
                        <span class="cross">×</span>
                        PERMISSION DENIED: requires role [admin]
                    </p>
                    <p class="term-line dim">http_status: 403_forbidden · route_guard: blocked</p>
                    <p class="term-line">
                        <span class="prompt">$</span>
                        <span class="cursor" />
                    </p>
                </div>
            </div>

            <p class="error-desc">抱歉，您当前的角色无权访问该页面</p>

            <div class="error-actions">
                <el-button class="btn-ghost" size="large" @click="goBack">返回上一页</el-button>
                <el-button type="primary" class="btn-accent" size="large" @click="goHome">返回首页</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
    router.push('/')
}

const goBack = () => {
    router.back()
}
</script>

<style scoped lang="scss">
/* 与 LoginView 共用同一套暗夜 Token（页面作用域，保持两个文件可独立阅读） */
.forbidden-page {
    --bg-base: #0a0f15;
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

    position: relative;
    display: grid;
    place-items: center;
    min-height: 100vh;
    padding: 40px 20px;
    overflow: hidden;
    background:
        radial-gradient(820px 520px at 50% -8%, rgba(16, 185, 129, 0.13), transparent 62%),
        var(--bg-base);
    color: var(--text-1);
    font-family: var(--font-body);
}

/* 网格纹理（同登录页手法，居中淡出） */
.forbidden-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%);
    pointer-events: none;
}

.forbidden-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 480px;
    text-align: center;
}

.error-eyebrow {
    margin: 0 0 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.34em;
    color: var(--danger);
    animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.error-numeral {
    font-family: var(--font-display);
    font-size: 132px;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: 0.02em;
    background: linear-gradient(180deg, #f1f5f9 20%, rgba(148, 163, 184, 0.25) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 34px rgba(52, 211, 153, 0.22));
    animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
}

/* 终端报错卡 */
.terminal-card {
    width: 100%;
    margin-top: 8px;
    text-align: left;
    background: rgba(10, 16, 23, 0.78);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
    backdrop-filter: blur(6px);
    box-shadow: 0 24px 60px -30px rgba(0, 0, 0, 0.9);
    animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both;
}

.terminal-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.025);

    .bar-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;

        &.red {
            background: #ff5f57;
        }
        &.yellow {
            background: #febc2e;
        }
        &.green {
            background: #28c840;
        }
    }

    .bar-title {
        margin-left: 6px;
        font-family: var(--font-mono);
        font-size: 12px;
        color: var(--text-3);
        letter-spacing: 0.04em;
    }
}

.terminal-body {
    padding: 18px 20px;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 2.1;
}

.term-line {
    margin: 0;
    color: var(--text-2);
    word-break: break-all;

    &.error {
        color: var(--danger);
    }

    &.dim {
        color: var(--text-3);
        font-size: 12px;
    }

    .prompt {
        color: var(--accent);
        margin-right: 8px;
    }

    .cross {
        display: inline-block;
        margin-right: 8px;
        font-weight: 700;
    }
}

.cursor {
    display: inline-block;
    width: 8px;
    height: 15px;
    margin-left: 8px;
    background: var(--accent);
    vertical-align: -2px;
    animation: blink 1.1s steps(1) infinite;
}

.error-desc {
    margin: 22px 0 26px;
    font-size: 14px;
    color: var(--text-2);
    letter-spacing: 0.06em;
    animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
}

.error-actions {
    display: flex;
    gap: 14px;
    animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.36s both;
}

.btn-ghost {
    height: 44px;
    padding: 0 22px;
    color: var(--text-2);
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 10px;
    transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;

    &:hover,
    &:focus {
        color: var(--text-1);
        border-color: rgba(148, 163, 184, 0.45);
        background: rgba(255, 255, 255, 0.04);
    }
}

.btn-accent {
    height: 44px;
    padding: 0 26px;
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: 0.18em;
    text-indent: 0.18em;
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-deep);
    border-radius: 10px;
    box-shadow: 0 10px 28px -10px rgba(52, 211, 153, 0.55);
    transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;

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

@media (max-width: 480px) {
    .error-numeral {
        font-size: 96px;
    }

    .error-actions {
        flex-direction: column;
        width: 100%;

        .el-button {
            width: 100%;
        }
    }
}
</style>

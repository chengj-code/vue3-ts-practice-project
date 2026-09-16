<template>
    <!-- 403 页是顶层路由（不在 DefaultLayout 内），需要自己撑满整屏并居中 -->
    <div class="forbidden-page">
        <div class="forbidden-card">
            <!-- el-result 自带 403 状态图标与排版，icon/title/sub-title/extra 四个插槽各司其职 -->
            <el-result icon="warning" title="403" sub-title="抱歉，您没有权限访问该页面">
                <template #extra>
                    <!-- 返回上一页：有历史就回退，没有历史时 back() 不会跳走，故配首页按钮兜底 -->
                    <el-button @click="goBack">返回上一页</el-button>
                    <el-button type="primary" @click="goHome">返回首页</el-button>
                </template>
            </el-result>
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

<style scoped>
.forbidden-page {
    display: flex;
    justify-content: center;
    align-items: center;
    /* dvh 比 vh 更准：移动端浏览器地址栏伸缩时不会留白；老浏览器自动回退到上面的 vh */
    height: 100vh;
    height: 100dvh;
    background-color: var(--el-fill-color-light);
}

.forbidden-card {
    /* 白色卡片 + 圆角 + 轻阴影，和 LoginView 的卡片语言保持一致 */
    padding: 24px 48px;
    background-color: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
}
</style>

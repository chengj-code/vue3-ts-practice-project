<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '210px'" class="layout-aside">
      <div class="brand">
        <div class="brand-mark"><span /></div>
        <span v-show="!isCollapse" class="brand-name">CONSOLE//OS</span>
      </div>

      <el-menu class="layout-menu" router :default-active="$route.path" :collapse="isCollapse">
        <!-- 递归渲染子路由 -->
        <template v-for="item in layoutRoutes" :key="item.path">
          <el-menu-item :index="'/' + item.path">
            <el-icon>
              <component :is="iconMap[item?.meta?.icon as string] ?? More" />
            </el-icon>
            <span>{{ item?.meta?.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container class="layout-body">
      <!-- 顶栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <component :is="isCollapse ? Expand : Fold" />
          </el-icon>
          <span class="header-crumb">{{ $route.meta.title }}</span>
        </div>
        <div class="header-right">
          <!-- 明暗切换：图标表状态（亮色显示月亮=点它去暗色） -->
          <el-tooltip :content="isDark ? '切换为亮色模式' : '切换为暗色模式'" placement="bottom">
            <el-icon class="header-action" @click="toggleTheme">
              <component :is="isDark ? Sunny : Moon" />
            </el-icon>
          </el-tooltip>
          <!-- 品牌色色板：复用 el-dropdown 的 command 模式（与用户菜单同款），command 传色值 -->
          <el-dropdown trigger="click" @command="onBrandCommand">
            <el-icon class="header-action"><Brush /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="c in BRAND_PRESETS" :key="c.value" :command="c.value">
                  <span class="color-dot" :style="{ background: c.value }" />
                  {{ c.label }}
                  <el-icon v-if="primaryColor === c.value" class="color-check">
                    <Check />
                  </el-icon>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown @command="onCommand">
            <span class="header-user">
              <span class="user-avatar">{{
                (userInfo?.nickname ?? userInfo?.username ?? '?').charAt(0)
              }}</span>
              <span class="user-meta">
                <span class="user-name">{{ userInfo?.nickname ?? userInfo?.username }}</span>
                <span class="user-role">{{ userInfo?.roles?.[0] ?? 'unknown' }}</span>
              </span>
              <el-icon class="user-arrow">
                <ArrowDown />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区：子路由页面渲染处 -->
      <el-main class="layout-main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import {
  ArrowDown,
  Brush,
  Check,
  Expand,
  Fold,
  Moon,
  More,
  Odometer,
  Sunny,
  SwitchButton,
  User,
} from '@element-plus/icons-vue'
import { usePermission } from '@/composables/usePermission'
import { BRAND_PRESETS } from '@/stores/app'

const userStore = useUserStore()
const appStore = useAppStore()
const { hasRole } = usePermission()
const { userInfo } = storeToRefs(userStore)
const { isCollapse, theme, primaryColor } = storeToRefs(appStore)
const { toggleCollapse, toggleTheme, setPrimaryColor } = appStore

// 暗色为 true：图标表「可前往的状态」，亮色显示月亮、暗色显示太阳
const isDark = computed(() => theme.value === 'dark')

const onBrandCommand = (color: string) => {
  setPrimaryColor(color)
}

const layoutRoutes = computed(() =>
  (router.options.routes.find((item) => item.name === 'layout')?.children ?? [])
    .filter((item) => !item?.meta?.hidden)
    .filter((item) => hasRole(item?.meta?.roles)),
)

const iconMap: Record<string, Component> = {
  Odometer,
  User,
}
const onCommand = (command: string) => {
  if (command === 'logout') {
    userStore.clearUser()
    router.replace('/login')
  }
}
</script>

<style scoped lang="scss">
.layout {
  height: 100%;
}

/* ============ 侧边栏 ============ */
.layout-aside {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background:
    radial-gradient(
      420px 320px at 110% -8%,
      color-mix(in srgb, var(--console-accent) 8%, transparent),
      transparent 60%
    ),
    var(--console-bg);
  border-right: 1px solid var(--console-line);
  transition: width 0.3s;
}

/* 侧边栏细网格，靠内边缘淡出 */
.layout-aside::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: linear-gradient(90deg, black 0%, transparent 92%);
  -webkit-mask-image: linear-gradient(90deg, black 0%, transparent 92%);
  pointer-events: none;
}

.brand {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 18px;
  border-bottom: 1px solid var(--console-line);
  white-space: nowrap;
}

.brand-mark {
  position: relative;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border: 1px solid color-mix(in srgb, var(--console-accent) 55%, transparent);
  border-radius: 8px;

  span {
    position: absolute;
    inset: 6px;
    background: var(--console-accent);
    border-radius: 2px;
    box-shadow: 0 0 10px color-mix(in srgb, var(--console-accent) 60%, transparent);
  }
}

.brand-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--console-text-1);
}

.nav-label {
  position: relative;
  z-index: 1;
  padding: 18px 20px 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.26em;
  color: var(--console-text-3);
}

.layout-menu {
  position: relative;
  z-index: 1;
  flex: 1;
  width: 100%;
  border-right: none;
  background: transparent;

  /* 覆盖 el-menu 的组件级配色变量 */
  --el-menu-bg-color: transparent;
  --el-menu-text-color: var(--console-text-2);
  --el-menu-hover-bg-color: color-mix(in srgb, var(--console-accent) 8%, transparent);
  --el-menu-active-color: var(--console-accent);

  :deep(.el-menu-item) {
    height: 46px;
    margin: 4px 12px;
    border-radius: 9px;
    font-size: 14px;
  }

  /* 折叠态：注意 collapse 类加在 el-menu 根元素自身（与 .layout-menu 同节点），
     必须用 &.el-menu--collapse 同元素复合选择器；写成后代选择器会零匹配。
     EP 原生居中靠 “64 = 20(padding) + 24(icon) + 20(padding)”，
     margin 改变块宽后必须 padding:0 + justify-content:center 补偿 */
  &.el-menu--collapse {
    :deep(.el-menu-item) {
      margin: 4px 8px;
      padding: 0;
      justify-content: center;
    }
  }

  :deep(.el-menu-item:hover) {
    color: var(--console-text-1);
    background: color-mix(in srgb, var(--console-accent) 8%, transparent);
  }

  :deep(.el-menu-item.is-active) {
    font-weight: 600;
    color: var(--console-accent);
    background: color-mix(in srgb, var(--console-accent) 12%, transparent);
    box-shadow: inset 2px 0 0 var(--console-accent);
  }
}

.aside-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--console-line);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--console-text-3);
  white-space: nowrap;

  .footer-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--console-accent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--console-accent) 80%, transparent);
    animation: footer-breathe 2.6s ease-in-out infinite;
  }
}

/* ============ 顶栏 ============ */
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 22px;
  background: var(--console-surface);
  border-bottom: 1px solid var(--console-line);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.collapse-btn,
.header-action {
  /* el-icon 天生 width/height:1em，border-box 下加 padding 会把 content
     吃成 2px、flex 把 svg 压扁；放开固定尺寸让按钮=图标+padding 的大热区 */
  width: auto;
  height: auto;
  padding: 8px;
  font-size: 18px;
  color: var(--console-text-2);
  border-radius: 8px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    color: var(--console-accent);
    background: color-mix(in srgb, var(--console-accent) 10%, transparent);
  }
}

/* 品牌色色板菜单里的色点与选中态 */
.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--console-line-strong) inset;
}

.color-check {
  margin-left: auto;
  color: var(--console-accent);
}

.header-crumb {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--console-text-3);

  // &::first-letter {
  //   color: var(--console-accent);
  // }
}

.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 6px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
  outline: none;

  &:hover {
    background: var(--console-fill);
  }
}

.user-avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--console-accent-deep);
  background: var(--console-accent);
  border-radius: 9px;
  box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--console-accent) 60%, transparent);
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;

  .user-name {
    font-size: 13px;
    color: var(--console-text-1);
  }

  .user-role {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--console-text-3);
  }
}

.user-arrow {
  font-size: 12px;
  color: var(--console-text-3);
}

/* ============ 内容区 ============ */
.layout-main {
  position: relative;
  padding: 22px;
  background:
    radial-gradient(
      900px 420px at 88% -10%,
      color-mix(in srgb, var(--console-accent) 5%, transparent),
      transparent 60%
    ),
    var(--console-bg);

  /* 内容浮在网格纹理之上 */
  > * {
    position: relative;
    z-index: 1;
  }
}

.layout-main::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at 80% 0%, black 0%, transparent 55%);
  -webkit-mask-image: radial-gradient(ellipse at 80% 0%, black 0%, transparent 55%);
  pointer-events: none;
}

@keyframes footer-breathe {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}
</style>

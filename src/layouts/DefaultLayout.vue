<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '210px'" class="layout-aside">
      <div class="brand">
        <div class="brand-mark"><span /></div>
        <span v-show="!isCollapse" class="brand-name">CONSOLE//OS</span>
      </div>

      <div v-show="!isCollapse" class="nav-label">NAVIGATION</div>

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

      <div v-show="!isCollapse" class="aside-footer">
        <span class="footer-dot" />
        DEV BUILD · 2026.09
      </div>
    </el-aside>

    <el-container class="layout-body">
      <!-- 顶栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <component :is="isCollapse ? Expand : Fold" />
          </el-icon>
          <span class="header-crumb">// {{ $route.meta.title }}</span>
        </div>
        <div class="header-right">
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
import router from '@/router';
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';
import { ArrowDown, Expand, Fold, More, Odometer, SwitchButton, User } from '@element-plus/icons-vue';
import { usePermission } from '@/composables/usePermission';

const userStore = useUserStore();
const appStore = useAppStore();
const { userInfo } = storeToRefs(userStore);
const { isCollapse } = storeToRefs(appStore);
const { toggleCollapse } = appStore;
const layoutRoutes = (router.options.routes?.find((item) => item.name === 'layout')?.children ?? []).filter((item) => !item?.meta?.hidden);
const iconMap: Record<string, Component> = {
  Odometer,
  User,
}
const onCommand = (command: string) => {
  if (command === 'logout') {
    userStore.clearUser();
    router.replace('/login');
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
    radial-gradient(420px 320px at 110% -8%, rgba(52, 211, 153, 0.08), transparent 60%),
    #0c1218;
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
  border: 1px solid rgba(52, 211, 153, 0.55);
  border-radius: 8px;

  span {
    position: absolute;
    inset: 6px;
    background: var(--console-accent);
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);
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
  --el-menu-hover-bg-color: rgba(52, 211, 153, 0.08);
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
    background: rgba(52, 211, 153, 0.08);
  }

  :deep(.el-menu-item.is-active) {
    font-weight: 600;
    color: var(--console-accent);
    background: rgba(52, 211, 153, 0.12);
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
    box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
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
  background: rgba(10, 15, 21, 0.82);
  border-bottom: 1px solid var(--console-line);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.collapse-btn {
  /* el-icon 天生 width/height:1em，border-box 下加 padding 会把 content
     吃成 2px、flex 把 svg 压扁；放开固定尺寸让按钮=图标+padding 的大热区 */
  width: auto;
  height: auto;
  padding: 8px;
  font-size: 18px;
  color: var(--console-text-2);
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: var(--console-accent);
    background: rgba(52, 211, 153, 0.1);
  }
}

.header-crumb {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--console-text-3);

  &::first-letter {
    color: var(--console-accent);
  }
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
    background: rgba(255, 255, 255, 0.04);
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
  box-shadow: 0 4px 14px -4px rgba(52, 211, 153, 0.6);
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
    radial-gradient(900px 420px at 88% -10%, rgba(52, 211, 153, 0.05), transparent 60%),
    var(--console-bg);

  /* 内容浮在网格纹理之上 */
  >* {
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

<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '210px'" class="layout-aside">
      <div class="layout-logo">{{ isCollapse ? 'V' : 'Vue3 Admin' }}</div>
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
          <el-icon @click="toggleCollapse">
            <component :is="isCollapse ? Expand : Fold" />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="onCommand">
            <span class="header-user">
              {{ userInfo?.nickname ?? userInfo?.username }}
              <el-icon>
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

.layout-aside {
  background-color: #fff;
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s;
  overflow-x: hidden;
}

.layout-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid var(--el-border-color-light);
}

.layout-menu {
  width: 100%;
  border-right: none;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-user {
  cursor: pointer;
}

.layout-main {
  background-color: #f5f7fa;
}

.header-left {
  cursor: pointer;
}
</style>

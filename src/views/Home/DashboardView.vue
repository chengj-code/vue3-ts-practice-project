<template>
  <div class="dashboard" v-loading="loading">
    <!-- 页头：控制台风格模块标识；右侧 ADMIN 徽标挂 v-permission，保留 T11 按钮级权限测试载体 -->
    <div class="page-head">
      <div>
        <h2 class="page-title">仪表盘</h2>
      </div>
      <el-tag v-permission="['admin']" type="success" effect="plain">ADMIN</el-tag>
    </div>

    <!-- 数据卡片区：4 个统计卡片，接口未返回前显示占位符 -->
    <div class="stat-grid">
      <el-card v-for="card in statCards" :key="card.label" class="console-card stat-card">
        <p class="stat-label">{{ card.label }}</p>
        <p class="stat-value">{{ card.value }}</p>
      </el-card>
    </div>

    <!-- 图表区：折线全宽，柱状 + 饼图各半；数据到达后 EChart 的 watch(option) 自动 setOption 更新 -->
    <div class="chart-grid">
      <el-card class="console-card chart-card chart-wide">
        <template #header>
          <div class="chart-title"><i class="title-bar" />近 7 天新增趋势</div>
        </template>
        <EChart :option="trendOption" height="300px" />
      </el-card>
      <el-card class="console-card chart-card">
        <template #header>
          <div class="chart-title"><i class="title-bar" />年龄段分布</div>
        </template>
        <EChart :option="ageOption" height="280px" />
      </el-card>
      <el-card class="console-card chart-card">
        <template #header>
          <div class="chart-title"><i class="title-bar" />启用 / 禁用占比</div>
        </template>
        <EChart :option="statusOption" height="280px" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import EChart from '@/components/EChart.vue'
import type { ECOption } from '@/types/echarts'
import { useAppStore } from '@/stores/app'
import {
  getAgeDistributionApi,
  getDashboardStatsApi,
  getStatusDistributionApi,
  getTrendApi,
  type AgeGroupItem,
  type DashboardStats,
  type StatusItem,
  type TrendItem,
} from '@/api/modules/dashboard'

// ========== 数据获取：4 个接口无相互依赖，Promise.all 并发 ==========

const stats = ref<DashboardStats | null>(null)
const trend = ref<TrendItem[]>([])
const ageDist = ref<AgeGroupItem[]>([])
const statusDist = ref<StatusItem[]>([])
const loading = ref(true)

const fetchAll = async () => {
  loading.value = true
  try {
    const [s, t, a, st] = await Promise.all([
      getDashboardStatsApi(),
      getTrendApi(),
      getAgeDistributionApi(),
      getStatusDistributionApi(),
    ])
    stats.value = s
    trend.value = t
    ageDist.value = a
    statusDist.value = st
  } catch {
    // request.ts 拦截器对业务/HTTP 错误已统一 ElMessage 提示，这里静默防 unhandled rejection
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)

// ========== 统计卡片 ==========

const statCards = computed(() => [
  { label: '用户总数', value: stats.value?.totalUsers ?? '-' },
  { label: '启用用户', value: stats.value?.activeUsers ?? '-' },
  { label: '禁用用户', value: stats.value?.disabledUsers ?? '-' },
  { label: '今日新增', value: stats.value?.todayNew ?? '-' },
])

// ========== 图表 option 组装（computed：数据 ref 变化 → 新 option → EChart watch 自动更新） ==========

const appStore = useAppStore()
const isDark = computed(() => appStore.theme === 'dark')

// canvas 内文字不继承 CSS 变量——色值按主题在 JS 侧重算，theme 变化
// → 这些 computed 重跑 → option 重算 → EChart 的 watch 自动 setOption
const AXIS_COLOR = computed(() => (isDark.value ? '#8b9bb0' : '#5a6b80'))
const SPLIT_COLOR = computed(() =>
  isDark.value ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
)
// 主色跟品牌色走（store 换色 → 图表同步变色）
const ACCENT = computed(() => appStore.primaryColor)

// brand hex → rgba 小工具：透明度版用于面积填充等需要 alpha 的场景
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 折线：近 7 天新增趋势
const trendOption = computed<ECOption>(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 48, right: 24, top: 20, bottom: 28 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trend.value.map((i) => i.date),
    axisLabel: { color: AXIS_COLOR.value },
    axisLine: { lineStyle: { color: SPLIT_COLOR.value } },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: AXIS_COLOR.value },
    splitLine: { lineStyle: { color: SPLIT_COLOR.value } },
  },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: trend.value.map((i) => i.count),
      itemStyle: { color: ACCENT.value },
      lineStyle: { color: ACCENT.value, width: 2 },
      areaStyle: { color: hexToRgba(ACCENT.value, 0.12) },
    },
  ],
}))

// 柱状：年龄段分布
const ageOption = computed<ECOption>(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 48, right: 24, top: 20, bottom: 28 },
  xAxis: {
    type: 'category',
    data: ageDist.value.map((i) => i.range),
    axisLabel: { color: AXIS_COLOR.value },
    axisLine: { lineStyle: { color: SPLIT_COLOR.value } },
    axisTick: { alignWithLabel: true },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: AXIS_COLOR.value },
    splitLine: { lineStyle: { color: SPLIT_COLOR.value } },
  },
  series: [
    {
      name: '人数',
      type: 'bar',
      barWidth: '45%',
      data: ageDist.value.map((i) => i.count),
      itemStyle: { color: ACCENT.value, borderRadius: [4, 4, 0, 0] },
    },
  ],
}))

// 饼图：启用/禁用占比（环形）
const statusOption = computed<ECOption>(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, textStyle: { color: AXIS_COLOR.value } },
  series: [
    {
      name: '状态占比',
      type: 'pie',
      radius: ['45%', '68%'],
      center: ['50%', '44%'],
      data: statusDist.value,
      label: { color: AXIS_COLOR.value, formatter: '{b}: {c}' },
      itemStyle: {
        borderRadius: 6,
        // 描边取卡片底色，亮色下自动切白
        borderColor: isDark.value ? '#131b24' : '#ffffff',
        borderWidth: 2,
      },
      color: [ACCENT.value, '#f87171'],
    },
  ],
}))
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ============ 页头 ============ */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 4px;
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--console-text-1);
}

/* ============ 卡片通用 ============ */
.console-card {
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid var(--console-line);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

/* ============ 统计卡片 ============ */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-label {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  color: var(--console-text-2);
}

.stat-value {
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 600;
  color: var(--console-text-1);
}

/* ============ 图表区：折线跨两列，柱状/饼图各半 ============ */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-wide {
  grid-column: span 2;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--console-text-1);
}

.title-bar {
  width: 3px;
  height: 13px;
  background: var(--console-accent);
  border-radius: 2px;
  box-shadow: 0 0 8px color-mix(in srgb, var(--console-accent) 70%, transparent);
}

/* 窄屏降级：统计卡 2 列、图表单列 */
@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }

  .chart-wide {
    grid-column: auto;
  }
}
</style>

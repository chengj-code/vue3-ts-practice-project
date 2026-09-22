<template>
  <!-- 图表容器：宽度跟随父级，高度由 prop 控制（flex/grid 子项默认不撑高，必须给明确高度，否则 init 后图不显示） -->
  <div ref="containerRef" class="echart" :style="{ height }" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
// init/use 从 echarts/core 拿（而非全量 echarts）
// 注册放在本组件模块内而非 main.ts：模块首次被 import 时执行一次（use 幂等，所有实例共享），
// echarts 因此只被打进消费方（仪表盘）的路由 chunk，入口主包不背这份体积
import { init, use, type EChartsType } from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ECOption } from '@/types/echarts'

// 按需注册（漏注册不报错，对应部分静默消失）；注册集与 types/echarts.ts 的 ECOption 组合对齐
use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  CanvasRenderer,
])

const props = withDefaults(
  defineProps<{
    /** 图表配置（ECOption = 项目按需注册的图表/组件组合类型） */
    option: ECOption
    /** 容器高度，默认 320px */
    height?: string
  }>(),
  { height: '320px' },
)

const containerRef = ref<HTMLDivElement | null>(null)
// 实例与观察者用 let 持有：与组件实例 1:1 的非响应式资源，放 ref 反而会被代理拖慢
let chart: EChartsType | null = null
let observer: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return
  chart = init(containerRef.value)
  chart.setOption(props.option, { notMerge: true })

  // 用 ResizeObserver 监听「容器尺寸」而非 window.resize：
  // 侧边栏折叠只改容器宽度、窗口不变，window resize 不会触发，图表会溢出或留白
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(containerRef.value)
})

// option 更新（如接口数据到达/筛选变化）时同步到图表
// notMerge: true 整体替换，防止切换数据后旧 series 残留；代价是 legend 选中态等交互状态重置（当前无此场景）
watch(
  () => props.option,
  (option) => {
    chart?.setOption(option, { notMerge: true })
  },
  { deep: true },
)

onBeforeUnmount(() => {
  // 顺序：先断观察者再 dispose，防止回调里访问已销毁实例
  observer?.disconnect()
  observer = null
  chart?.dispose()
  chart = null
})
</script>

<style scoped lang="scss">
.echart {
  width: 100%;
}
</style>

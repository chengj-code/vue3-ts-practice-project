---
title: ECharts 按需注册与路由级分包（封装组件）
type: pattern
date: 2026-09-22
verified: 2026-09-22
tags: [echarts, 按需引入, tree-shaking, 组件封装, ResizeObserver, 性能优化, vue3]
related_files: [src/components/EChart.vue, src/types/echarts.ts]
source: sessions/2026-09-18_T12仪表盘ECharts.md
---

# ECharts 按需注册与路由级分包（封装组件）

## 适用场景

Vue3 项目引入 ECharts；关心首屏体积与「第三方库接入 Vue 的生命周期管理」。

## 方案要点

1. **按需引入**：从 `echarts/core` 拿核心，按需注册图表/渲染器/组件（漏注册不报错，对应部分静默不渲染）：

```ts
import { use } from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
use([BarChart, LineChart, PieChart, CanvasRenderer, GridComponent, LegendComponent, TitleComponent, TooltipComponent])
```

2. **注册位置决定分包归属**：注册写 main.ts → echarts/core 进首屏主包（本项目 gzip 222KB）；挪进封装组件模块内（模块首次 import 时 `use` 一次，幂等）→ echarts 归入使用它的路由 chunk（主包 gzip 降到 22KB，降 90%）。
3. **封装组件四件事**：onMounted init（容器用 ref）；`watch(option, deep)` + `setOption(opt, { notMerge: true })` 防旧 series 残留；ResizeObserver 监听**容器**（侧边栏折叠等容器变化不触发 window.resize）；onBeforeUnmount 先 `observer.disconnect()` 再 `chart.dispose()`。
4. **类型**：`ComposeOption<...>` 组合出项目专属 Option 类型，option props 有完整提示。

## 示例

```ts
// 封装组件内（不是 main.ts）——模块级执行一次即可
use([BarChart, LineChart, PieChart, CanvasRenderer, GridComponent, LegendComponent, TooltipComponent])
```

## 注意事项 / 坑

- 漏注册组件（如 LegendComponent）不报错，图上该部分静默消失
- flex/grid 子项默认不撑高，图表容器要给明确高度，否则 init 后图 0 高不显示
- watch option 更新时 `notMerge: true`，否则切换数据旧 series 残留
- 卸载顺序：先断 observer 再 dispose，防回调访问已销毁实例

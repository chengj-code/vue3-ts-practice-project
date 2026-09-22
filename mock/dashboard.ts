import type { MockMethod } from 'vite-plugin-mock'
import { Mock, success } from './_utils'
import { allList } from './list'

// ========== 业务类型（与 src/api/modules/dashboard.ts 保持一致） ==========

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  disabledUsers: number
  todayNew: number
}

interface TrendItem {
  date: string // MM-DD
  count: number
}

interface AgeGroupItem {
  range: string // 年龄段，如 '18-25'
  count: number
}

interface StatusItem {
  name: string // 启用/禁用
  value: number
}

// ========== 数据生成 ==========

// 近 7 天每日新增：create_time 由 mockjs 随机生成无日期规律，趋势用模拟随机数
// 模块级生成一次并缓存——stats 与 trend 共用同一份，保证「今日新增」卡片和折线图末位对得上
function generateTrend(): TrendItem[] {
  const list: TrendItem[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const pad = (n: number) => String(n).padStart(2, '0')
    list.push({
      date: `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      count: Mock.mock('@integer(5, 40)'),
    })
  }
  return list
}

const trendData = generateTrend()

// 年龄段分布：从 allList 实时分桶，与列表 CRUD 真实联动（新增/删除后刷新仪表盘数字会变）
function groupByAge(): AgeGroupItem[] {
  const groups = [
    { range: '18-25', min: 18, max: 25 },
    { range: '26-35', min: 26, max: 35 },
    { range: '36-45', min: 36, max: 45 },
    { range: '46-60', min: 46, max: 60 },
  ]
  return groups.map(({ range, min, max }) => ({
    range,
    count: allList.filter((u) => u.age >= min && u.age <= max).length,
  }))
}

// 状态占比：饼图数据用 { name, value } 形状（echarts pie 惯例）
function groupByStatus(): StatusItem[] {
  const active = allList.filter((u) => u.status).length
  return [
    { name: '启用', value: active },
    { name: '禁用', value: allList.length - active },
  ]
}

// ========== 接口定义 ==========

export default [
  // 统计卡片：总数/启用/禁用实时算，今日新增取趋势末位（同一数据源）
  {
    url: '/api/dashboard/stats',
    method: 'get',
    response: () => {
      const activeUsers = allList.filter((u) => u.status).length
      const stats: DashboardStats = {
        totalUsers: allList.length,
        activeUsers,
        disabledUsers: allList.length - activeUsers,
        todayNew: trendData[trendData.length - 1].count,
      }
      return success(stats)
    },
  },
  // 近 7 天新增趋势（折线）
  {
    url: '/api/dashboard/trend',
    method: 'get',
    response: () => success(trendData),
  },
  // 年龄段分布（柱状）
  {
    url: '/api/dashboard/age-distribution',
    method: 'get',
    response: () => success(groupByAge()),
  },
  // 启用/禁用占比（饼图）
  {
    url: '/api/dashboard/status-distribution',
    method: 'get',
    response: () => success(groupByStatus()),
  },
] as MockMethod[]

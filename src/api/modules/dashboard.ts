import request from '../request'

// 以下类型均与 mock/dashboard.ts 保持一致

/** 统计卡片数据 */
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  disabledUsers: number
  todayNew: number
}

/** 近 7 天新增趋势项（折线） */
export interface TrendItem {
  date: string // MM-DD
  count: number
}

/** 年龄段分布项（柱状） */
export interface AgeGroupItem {
  range: string
  count: number
}

/** 启用/禁用占比项（饼图，{ name, value } 为 echarts pie 惯例形状） */
export interface StatusItem {
  name: string
  value: number
}

export function getDashboardStatsApi() {
  return request.get<DashboardStats>('/dashboard/stats')
}

export function getTrendApi() {
  return request.get<TrendItem[]>('/dashboard/trend')
}

export function getAgeDistributionApi() {
  return request.get<AgeGroupItem[]>('/dashboard/age-distribution')
}

export function getStatusDistributionApi() {
  return request.get<StatusItem[]>('/dashboard/status-distribution')
}

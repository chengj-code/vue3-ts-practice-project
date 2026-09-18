// API 层通用类型（从 src/api/types.ts 迁入，api/types.ts 保留 re-export 兼容旧引用）

/** 统一响应结构：mock/后端约定 `{ code, message, data }` */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页查询参数（所有列表接口的公共入参） */
export interface PageQuery {
  page?: number
  pageSize?: number
}

/** 分页响应结构（所有列表接口的公共出参） */
export interface PageResult<T> {
  total: number
  list: T[]
  page: number
  pageSize: number
}

/** 登录用户信息（user store 持久化结构） */
export interface UserInfo {
  id: number
  username: string
  nickname?: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

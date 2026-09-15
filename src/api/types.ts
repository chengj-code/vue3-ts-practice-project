export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
}

export interface PageQuery {
    page?: number
    pageSize?: number
}

export interface PageResult<T> {
    total: number
    list: T[],
    page: number
    pageSize: number
}

export interface UserInfo {
    id: number
    username: string
    nickname?: string
    avatar?: string
    roles: string[]
    permissions: string[]
}
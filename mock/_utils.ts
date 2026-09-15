import Mock from 'mockjs'

/**
 * 统一的 mock 响应结构。
 * 用户在定义 ApiResponse<T> 时需与此结构保持一致：
 * { code, message, data }
 */
export interface MockResult<T> {
  code: number
  message: string
  data: T
}

export function success<T>(data: T, message = 'ok'): MockResult<T> {
  return { code: 0, message, data }
}

export function fail(message: string, code = -1): MockResult<null> {
  return { code, message, data: null }
}

export { Mock }

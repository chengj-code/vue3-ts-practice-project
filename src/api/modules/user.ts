import request from '../request'
import type { UserInfo } from '../types'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

export function loginApi(params: LoginParams) {
  return request.post<LoginResult>('/login', params)
}

export function getUserInfoApi() {
  return request.get<UserInfo>('/user/info')
}

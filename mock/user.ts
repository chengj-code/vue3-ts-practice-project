import type { MockMethod } from 'vite-plugin-mock'
import { Mock, success, fail } from './_utils'

interface LoginBody {
  username: string
  password: string
}

export default [
  // 登录接口
  {
    url: '/api/login',
    method: 'post',
    response: ({ body }: { body: LoginBody }) => {
      const { username, password } = body
      if (username === 'admin' && password === '123456') {
        return success({
          token: Mock.mock('@guid'),
          userInfo: {
            id: 1,
            username: 'admin',
            nickname: '管理员',
            avatar: '',
            roles: ['admin'],
            permissions: ['user:list', 'user:add', 'user:edit', 'user:delete'],
          },
        })
      }
      if (username === 'user' && password === '123456') {
        return success({
          token: Mock.mock('@guid'),
          userInfo: {
            id: 2,
            username: 'user',
            nickname: '普通用户',
            avatar: '',
            roles: ['user'],
            permissions: ['user:list'],
          },
        })
      }
      return fail('用户名或密码错误')
    },
  },
  // 获取当前用户信息
  {
    url: '/api/user/info',
    method: 'get',
    response: () =>
      success({
        id: 1,
        username: 'admin',
        nickname: '管理员',
        roles: ['admin'],
        permissions: ['user:list', 'user:add', 'user:edit', 'user:delete'],
      }),
  },
] as MockMethod[]

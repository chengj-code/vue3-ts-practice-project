import type { MockMethod } from 'vite-plugin-mock'
import { Mock, success } from './_utils'

// 生成模拟用户列表数据
function generateList(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: Mock.mock('@cname'),
    age: Mock.mock('@integer(18, 60)'),
    email: Mock.mock('@email'),
    phone: Mock.mock(/^1[3-9]\d{9}$/),
    status: Mock.mock('@boolean'),
    createTime: Mock.mock('@datetime'),
  }))
}

interface UserItem {
  id: number
  name: string
  age: number
  email: string
  phone: string
  status: boolean
  createTime: string
}

const allList: UserItem[] = generateList(238)

interface ListQuery {
  page?: string
  pageSize?: string
  name?: string
  status?: string
}

export default [
  // 用户列表（分页 + 筛选）
  {
    url: '/api/user/list',
    method: 'get',
    response: ({ query }: { query: ListQuery }) => {
      const page = Number(query.page) || 1
      const pageSize = Number(query.pageSize) || 10
      // 筛选（注意 query 全是字符串，status 需显式转布尔）
      let filtered = allList
      if (query.name?.trim()) {
        filtered = filtered.filter((item) => item.name.includes(query.name!.trim()))
      }
      if (query.status === 'true') {
        filtered = filtered.filter((item) => item.status === true)
      } else if (query.status === 'false') {
        filtered = filtered.filter((item) => item.status === false)
      }
      const total = filtered.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      return success({
        list: filtered.slice(start, end),
        total,
        page,
        pageSize,
      })
    },
  },
  // 新增用户
  {
    url: '/api/user',
    method: 'post',
    response: ({ body }: { body: Omit<UserItem, 'id'> }) => {
      const item: UserItem = { id: allList.length + 1, ...body }
      allList.unshift(item)
      return success(item)
    },
  },
  // 更新用户
  {
    url: '/api/user/:id',
    method: 'put',
    response: ({ body, url }: { body: Partial<UserItem>; url: string }) => {
      const id = Number(url.split('/').pop())
      const idx = allList.findIndex((item) => item.id === id)
      if (idx > -1) {
        allList[idx] = { ...allList[idx], ...body }
        return success(allList[idx])
      }
      return success(null)
    },
  },
  // 删除用户
  {
    url: '/api/user/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const idx = allList.findIndex((item) => item.id === id)
      if (idx > -1) allList.splice(idx, 1)
      return success(null)
    },
  },
] as MockMethod[]

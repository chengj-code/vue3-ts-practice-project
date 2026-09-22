import type { MockMethod } from 'vite-plugin-mock'
import { Mock, success } from './_utils'

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// 生成模拟用户列表数据
function generateList(count: number) {
  return Array.from({ length: count }, () => ({
    id: Mock.mock('@increment'),
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

// 导出供 mock/dashboard.ts 复用：仪表盘统计与列表 CRUD 共用同一份数据源，数字真实联动
export const allList: UserItem[] = generateList(238)

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
  // 新增用户（后端自动生成 createTime）
  {
    url: '/api/user',
    method: 'post',
    response: ({ body }: { body: Omit<UserItem, 'id' | 'createTime'> }) => {
      const item: UserItem = {
        ...body,                              // body 可能带脏 id（如前端默认值 0），被后面覆盖
        id: Mock.mock('@increment'),          // 后端生成，优先级最高
        createTime: formatDate(new Date()),   // 后端生成
      }
      allList.unshift(item)
      return success(item)
    },
  },
  // 更新用户（createTime 由后端保留，前端传了也忽略）
  {
    url: '/api/user/:id',
    method: 'put',
    response: ({ body, url }: { body: Partial<UserItem>; url: string }) => {
      const id = Number(url.split('/').pop())
      const idx = allList.findIndex((item) => item.id === id)
      if (idx > -1) {
        const { createTime, ...rest } = body  // 忽略前端传来的 createTime
        allList[idx] = { ...allList[idx], ...rest }
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
  // 查重：按姓名查是否存在（异步校验器用）
  {
    url: '/api/user/check',
    method: 'get',
    response: ({ query }: { query: { name?: string } }) => {
      const name = query.name?.trim()
      if (!name) return success(null)
      const found = allList.find((item) => item.name === name)
      return success(found ?? null)
    },
  },
] as MockMethod[]

import { ref, watch } from 'vue'
import type { PageQuery, PageResult } from '@/api/types'

// - `<T>` = 列表项类型（比如`UserItem` ）， `<Q>` = 查询参数额外字段（比如`{ name?: string; status?: boolean }` ）。不传 Q 时默认`Record<string, unknown>` ，最宽松
// - fetcher 参数 =`PageQuery & Q` ，把分页和筛选合并成一个对象传给 API —— 和`getUserListApi` 签名自然对齐，业务页面直接传`getUserListApi` 就行
// - options 控制是否首屏自动拉、默认 pageSize
export function useTable<T, Q extends Record<string, unknown> = Record<string, unknown>>(
  fetcher: (params: PageQuery & Q) => Promise<PageResult<T>>,
  options?: {
    immediate?: boolean
    defaultPageSize?: number
  },
) {
  const { immediate = true, defaultPageSize = 10 } = options ?? {}
  const list = ref<T[]>([])
  const loading = ref(false)
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)
  const query = ref<Q>({} as Q)

  const fetch = async () => {
    loading.value = true
    try {
      const res = await fetcher({
        page: page.value,
        pageSize: pageSize.value,
        ...query.value,
      })
      list.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  // 只监听分页变化（用户翻页）；search/reset 在值无变化时自行 fetch，避免重复请求
  watch([page, pageSize], () => {
    fetch()
  })

  // 搜索：已在第一页就手动发（同值赋值不触发 watch），否则改 page 交给 watch
  const search = () => {
    if (page.value === 1) {
      fetch()
    } else {
      page.value = 1
    }
  }

  // 重置：清空条件；分页参数均未变化时手动 fetch，否则交给 watch 触发
  const reset = () => {
    query.value = {} as Q
    if (page.value === 1 && pageSize.value === defaultPageSize) {
      fetch()
    } else {
      page.value = 1
      pageSize.value = defaultPageSize
    }
  }

  if (immediate) {
    fetch()
  }

  return { list, loading, page, pageSize, total, query, fetch, search, reset }
}

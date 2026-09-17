import type { UserInfo } from '@/api/types'
export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    const setToken = (newToken: string) => {
      token.value = newToken
    }

    const setUserInfo = (newUserInfo: UserInfo | null) => {
      userInfo.value = newUserInfo
    }

    const clearUser = () => {
      token.value = ''
      userInfo.value = null
    }
    return {
      token,
      userInfo,
      setToken,
      setUserInfo,
      clearUser,
    }
  },
  {
    persist: true,
  },
)

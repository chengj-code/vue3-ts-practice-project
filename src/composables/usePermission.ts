import { useUserStore } from '@/stores/user'
const ADMIN_ROLE = 'admin'
export function usePermission() {
  const userStore = useUserStore()

  const isAdmin = (): boolean => userStore.userInfo?.roles?.includes(ADMIN_ROLE) ?? false

  const hasAny = (required: string[] | undefined, mine: string[]): boolean => {
    if (!required || required.length === 0) return true
    if (isAdmin()) return true
    return required.some((item) => mine.includes(item))
  }

  const hasRole = (role?: string[]): boolean => hasAny(role, userStore.userInfo?.roles ?? [])

  const hasPermission = (permission?: string[]): boolean =>
    hasAny(permission, userStore.userInfo?.permissions ?? [])
  return { hasRole, hasPermission }
}

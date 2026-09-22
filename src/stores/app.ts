// 主题模式联合类型：限定取值，避免任意字符串混进 store
export type ThemeMode = 'light' | 'dark'

// 主题色预设（DefaultLayout 色板消费）：brand 色是 EP 主色与 console-accent 的唯一源头
// 选 600 档：亮色模式下实心按钮配白字有足够对比；暗色模式由 color-mix 自动提亮
export const BRAND_PRESETS = [
  { label: '翡翠绿', value: '#059669' },
  { label: '科技蓝', value: '#2563eb' },
  { label: '暗夜紫', value: '#7c3aed' },
  { label: '落日橙', value: '#ea580c' },
] as const

export const useAppStore = defineStore(
  'app',
  () => {
    const isCollapse = ref(false)
    // 默认暗色：与项目控制台风格底子一致（index.html 的 FOUC 脚本用同一个默认值）
    const theme = ref<ThemeMode>('dark')
    // 品牌色只存「源头色」：派生色阶（hover/disabled/浅底）全部由 CSS color-mix 动态计算
    const primaryColor = ref<string>('#10b981')

    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value
    }

    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }

    const setPrimaryColor = (color: string) => {
      primaryColor.value = color
    }

    return {
      isCollapse,
      theme,
      primaryColor,
      toggleCollapse,
      toggleTheme,
      setPrimaryColor,
    }
  },
  {
    persist: {
      // T7 的坑：pick 不加的 key 静默不持久化——主题两项必须显式列出
      pick: ['isCollapse', 'theme', 'primaryColor'],
    },
  },
)

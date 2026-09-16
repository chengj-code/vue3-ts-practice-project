/// <reference types="vite/client" />

export {}

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_API_BASE_URL: string
    readonly VITE_USE_MOCK: boolean
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    roles?: string[]
  }
}

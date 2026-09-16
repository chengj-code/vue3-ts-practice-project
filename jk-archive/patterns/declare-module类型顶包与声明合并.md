---
title: declare module 在脚本文件中顶掉整个包类型（模块增强写成了模块替身）
type: pattern
date: 2026-09-16
verified: 2026-09-16
tags: [typescript, declare-module, 模块增强, 声明合并, env.d.ts, vue-router]
related_files: [env.d.ts, src/router/index.ts]
---

# declare module 在脚本文件中顶掉整个包类型（模块增强写成了模块替身）

## 适用场景

在 `env.d.ts` 里写 `declare module 'vue-router' { interface RouteMeta {...} }` 给第三方包扩展类型后，整个项目突然报：

- `TS2305: Module '"vue-router"' has no exported member 'createRouter'`（官方导出全部"消失"）
- `TS7006: Parameter 'to' implicitly has an 'any' type`（守卫回调失去类型，连锁反应）
- 或第三方包的所有 API 类型都变成 any

## 根因

TS 对 `declare module 'xxx'` 的解释，取决于**所在文件是不是模块**（顶层有无 import/export）：

| 文件性质 | declare module 的含义 | 结果 |
|----------|----------------------|------|
| 脚本文件（无顶层 import/export） | **环境模块声明**：这份声明就是该模块的全部类型 | 真实包类型被整体遮蔽，官方导出全消失 |
| 模块文件（有顶层 import/export） | **模块增强（augmentation）**：与包内同名 interface 声明合并 | 官方类型保留，自定义字段追加成功 |

脚手架自带的 `env.d.ts` 默认没有顶层 import/export，是脚本文件，直接加 `declare module` 必然顶包。

## 方案要点

1. 文件顶层加一行 `export {}`，把文件标记为模块
2. 此时 `declare module 'vue-router'` 自动变成模块增强，与官方 `interface RouteMeta` 同名合并
3. **连带修复**：文件变模块后，顶层的 `interface ImportMetaEnv` / `interface ImportMeta` 也从全局接口变成局部接口，必须用 `declare global { ... }` 包起来，否则自定义 env 字段静默退化为 `any`（vite 自带 ImportMetaEnv 有 `Record<string, any>` 索引签名，所以不报错但类型丢失）
4. `declare module '*.vue'` 通配符声明在模块文件中依然合法，无需改动

## 示例

```ts
// env.d.ts —— 正确结构
/// <reference types="vite/client" />

export {} // 关键：把本文件标记为模块，下面的 declare module 才是“增强”

declare global {
  // 文件变模块后，全局接口增强必须包在 declare global 里
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_USE_MOCK: boolean
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

declare module 'vue-router' {
  // 同名 interface 与官方 RouteMeta 声明合并，不是覆盖
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    roles?: string[]
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
```

## 注意事项 / 坑

- 判断文件是不是模块只看**顶层**有没有 import/export；文件里写了 `declare module` 不算
- `declare module '*.vue'` 在脚本文件里不顶包，是因为 `.vue` 本来就没有真实类型文件——那是"从零声明"而非"增强已有包"
- 增强已存在的包（vue-router、pinia、vue 等）必须走模块文件；声明通配符/不存在的模块才用脚本文件
- 字段拼写要与项目约定一致：本项目是 `requiresAuth`（带 s），vue-router 5 的 RouteMeta 继承 `Record<PropertyKey, unknown>`，拼错字段名不报错但静默退化为 unknown，增强等于白写
- 验证增强是否真生效：故意写一个不存在的 meta 字段（如 `to.meta.role`），应立刻 TS 报错；悬停合法字段显示精确类型而非 any/unknown

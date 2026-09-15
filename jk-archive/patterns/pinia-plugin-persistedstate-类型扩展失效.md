---
title: pinia-plugin-persistedstate 类型扩展失效（persist 报错）
type: pattern
date: 2026-09-15
verified: 2026-09-15
tags: [pinia, typescript, 持久化, store]
related_files: [src/main.ts, src/stores/user.ts]
source: sessions/2026-09-15_axios请求层封装.md
---

# pinia-plugin-persistedstate 类型扩展失效（persist 报错）

## 适用场景

store 里写 `persist: true` 报错："对象字面量只能指定已知属性，'persist' 不在类型 DefineStoreOptions/DefineSetupStoreOptions 中"。同时意味着运行时持久化也**没有生效**。

## 方案要点

1. `persist` 属性不是 Pinia 自带，是插件通过 `declare module 'pinia'` 做**类型扩展**注入的
2. TS 的模块扩展只有在该模块被 import 后才加载 → 必须在入口文件 import 并注册插件
3. 不注册插件时是双重问题：类型报错 + 运行时持久化静默失效

## 示例

```ts
// src/main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' // 这行同时加载类型扩展

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
```

```ts
// src/stores/user.ts — setup store 第三参数配置 persist
export const useUserStore = defineStore('user', () => { /* ... */ }, { persist: true })
```

## 注意事项 / 坑

- 仅安装依赖不 import 是不够的，import 行为本身就是类型加载的开关
- 个别 tsconfig 配置下仍报红，可在 env.d.ts 补 `/// <reference types="pinia-plugin-persistedstate" />`
- 类型扩展同时覆盖 options 和 setup 两种 defineStore 写法的第三参数

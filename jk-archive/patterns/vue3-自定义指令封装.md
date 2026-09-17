---
title: Vue3 自定义指令封装（v-permission 模板）
type: pattern
date: 2026-09-17
verified: 2026-09-17
tags: [vue3, 自定义指令, 权限, typescript, directive]
related_files: [src/directives/permission.ts, src/directives/index.ts, src/main.ts]
source: sessions/2026-09-17_v-permission按钮级权限指令.md
---

# Vue3 自定义指令封装（v-permission 模板）

## 适用场景

- 按钮级权限控制（v-permission）
- 自动聚焦（v-focus）、防抖点击（v-debounce）、埋点上报等元素级 DOM 增强
- 需要「复用一段 DOM 操作逻辑 + 声明式挂到模板」的场景

## 方案要点

1. **两层封装**：指令本体文件 + `index.ts` map 出口 + main.ts 批量注册——加新指令只改 directives 层

```ts
// directives/xxx.ts —— 类型三件套
export type XDirective = Directive<HTMLElement, ValueType>  // ① 泛型：元素 + value

declare module 'vue' {                                       // ② 模板类型提示（Vue 3.5+）
  export interface GlobalDirectives { vX: XDirective }
}

export default { mounted(el, binding) { ... } } satisfies XDirective  // ③ satisfies 校验且保留推导
```

```ts
// directives/index.ts
import xxx from './xxx'
export default { xxx }
```

```ts
// main.ts（mount 前）
Object.entries(directives).forEach(([name, d]) => app.directive(name, d))
```

2. **钩子选择**：单 DOM 增强 mounted 就够；binding.value 会变化才加 updated；有副作用监听才用 unmounted 清理

3. **权限类指令的判断透传**：指令内调 usePermission 等判断层（pinia 已 install 时组件外可用），指令只做「判断 → DOM 操作」的接线

## 示例

```ts
export default {
  mounted: (el, binding) => {
    const { hasRole, hasPermission } = usePermission()
    // 语义：roles 或 permissions 任一命中即显示（按钮级权限字符串走 permissions 维度）
    if (hasRole(binding.value) || hasPermission(binding.value)) return
    el.parentNode?.removeChild(el)
  }
} satisfies PermissionDirective
```

## 注意事项 / 坑

- **移除而非隐藏**：权限控制用 `removeChild`，`display:none` 可被 DevTools 绕过，TR 验收「DOM 检查不可见」不通过
- **mounted 一次性**：权限变化不会重新执行指令（非响应式）；登录态切换伴随路由跳转 + 组件重建时可接受，否则改 v-if
- **binding 手动标注 `DirectiveBinding`（无泛型）= any**：会废掉 satisfies 的上下文推导，让它自己推
- **注册名不带 v-**：`app.directive('permission')` ↔ 模板 `v-permission` ↔ GlobalDirectives 的 key `vPermission`
- **指令用在组件上**：el 是组件根 DOM 元素（el-button 根就是 button），removeChild 直接生效
- **el.parentNode 可空**：类型是 `parentNode | null`，可选链兜底
- **测试载体的坑**：页面被路由守卫拦截时按钮级指令「够不到」，用不设 roles 的页面（如 Dashboard）挂测试元素验证

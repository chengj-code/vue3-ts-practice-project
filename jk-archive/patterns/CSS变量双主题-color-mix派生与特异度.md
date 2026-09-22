---
title: CSS 变量双主题体系（color-mix 派生 + FOUC + 特异度竞争）
type: pattern
date: 2026-09-22
verified: 2026-09-22
tags: [css变量, 主题切换, element-plus, color-mix, 特异度, FOUC, 暗色模式]
related_files: [src/assets/main.css, index.html, src/App.vue, src/stores/app.ts]
source: sessions/2026-09-22_T18主题切换.md
---

# CSS 变量双主题体系（color-mix 派生 + FOUC + 特异度竞争）

## 适用场景

Element Plus 项目做明暗主题 + 品牌色切换；任何「组件库 CSS 变量覆盖 + 自定义变量双体系」的场景。

## 方案要点

1. **品牌色单一源头 + color-mix 派生**：只存一个 `--brand-color`，组件库主色全套与自定义 accent 用 CSS 动态派生，JS 换肤只改这一个变量：

```css
:root:root {
  --brand-color: #059669;
  --el-color-primary: var(--brand-color);
  --el-color-primary-light-3: color-mix(in srgb, var(--brand-color) 70%, white);
  --el-color-primary-dark-2: color-mix(in srgb, var(--brand-color) 80%, black);
  /* 暗色块同结构，light-N 向深底混合、主色向白提亮一档 */
}
:root.dark {
  --el-color-primary: color-mix(in srgb, var(--brand-color) 85%, white);
}
```

2. **作用域与特异度（核心坑）**：亮色块 `:root:root`(0,2,0)，暗色块 `:root.dark`(0,2,0) 同级、源顺序在后取胜。**暗色块不能用 `html.dark`(0,1,1)**——会被提了特异度的亮色块反压，出现半亮半暗。亮色块也不能用裸 `:root`(0,1,0)——EP 按需样式分 chunk 后加载，同特异度被打回 EP 默认值。
3. **FOUC 防闪白**：`index.html` head 内同步 IIFE，直接读 pinia persist 的 localStorage（key = store id），框架挂载前挂 class 与品牌色；App.vue 里 `watchEffect` 接管运行时切换（立即执行 + 自动追踪，与 FOUC 脚本幂等重复无害）。
4. **固定暗色页**（登录/403）：局部 Token 体系不参与切换，但要在根元素锁回一组 EP 暗色变量（--el-bg-color/--el-fill-color-blank/--el-text-color-*/--el-border-color*），防止亮色 html 下「暗页亮组件」。
5. **canvas 图表**：不继承 CSS 变量，色值按主题在 JS computed 重算 → option 重算 → 封装组件 watch 自动 setOption。

## 示例

```ts
// App.vue：状态同步到外部世界的教科书 watchEffect 场景
watchEffect(() => {
  document.documentElement.classList.toggle('dark', appStore.theme === 'dark')
})
watchEffect(() => {
  document.documentElement.style.setProperty('--brand-color', appStore.primaryColor)
})
```

## 注意事项 / 坑

- 同一批变量在多作用域竞争时，**各作用域特异度必须有序**（暗色 ≥ 亮色），只提一边会造成部分变量亮暗错乱
- EP 按需样式（unplugin）分 chunk 加载，`<link>` 顺序在 dev 与 build 下不同，靠「源顺序」覆盖组件库变量不可靠，必须特异度压制
- 实心主按钮文字色取决于**底色明度档**：暗色主色是提亮档配深字；亮色主色选 600 档色值配 EP 惯例白字（500 档绿如 #10b981 白字对比不足、深字显脏）
- `persist.pick` 必须显式列全主题字段，漏了静默不持久化
- 色板预设更新后，用户 localStorage 里的旧值不会自动迁移，需重选一次

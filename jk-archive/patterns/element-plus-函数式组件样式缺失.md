---
title: Element Plus 函数式组件样式缺失（按需导入）
type: pattern
date: 2026-09-15
verified: 2026-09-15
tags: [element-plus, 按需导入, unplugin, 样式]
related_files: [src/main.ts, vite.config.ts]
source: sessions/2026-09-15_axios请求层封装.md
---

# Element Plus 函数式组件样式缺失（按需导入）

## 适用场景

用 `unplugin-vue-components` + `ElementPlusResolver` 按需导入时，模板里 `<el-button>` 样式正常，但 `ElMessage.success()` 弹出的是裸结构（无皮肤、无圆角阴影）。

## 方案要点

1. 根因：`Components` 插件靠编译**模板标签**发现组件并自动引 JS+样式；`ElMessage` 等是 **JS 函数调用**，不走模板编译，样式链路永远不触发
2. `AutoImport` + Resolver 只能自动补 import 语句，**不含样式**——"import 有"和"样式有"是两条独立链路
3. 修复二选一：
   - 全量引样式（省心）：`import 'element-plus/dist/index.css'`
   - 严格按需：手动引 4 个函数式组件样式

## 示例

```ts
// src/main.ts — 函数式组件需手动引入样式
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/loading/style/css'
```

## 注意事项 / 坑

- 涉及组件固定为四个：ElMessage / ElMessageBox / ElNotification / ElLoading，其中 ElMessageBox 在删除确认场景高频出现，建议一次配齐
- 模板标签组件（el-button、el-table 等）不需要手动引，resolver 会带样式
- 样式路径用 `/style/css`（编译后 CSS）即可；用 `/style/sass` 需项目支持 sass 且要处理主题变量

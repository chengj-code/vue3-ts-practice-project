---
title: Axios 泛型请求层封装（剥壳模式）
type: pattern
date: 2026-09-15
verified: 2026-09-15
tags: [axios, typescript, 拦截器, 请求封装, vue3]
related_files: [src/api/request.ts, src/api/types.ts, src/api/modules/user.ts]
source: sessions/2026-09-15_axios请求层封装.md
---

# Axios 泛型请求层封装（剥壳模式）

## 适用场景

Vue3/TS 项目统一请求层：token 注入、业务 code 解析、统一错误提示、401 跳登录、业务层拿到纯 data 且类型精确。后端约定 `{ code, message, data }` 响应结构时尤其适用。

## 方案要点

1. `axios.create` 实例读 env 的 baseURL，不直接用全局 axios
2. 请求拦截器：`useStore()` 在函数体内调用（避开 Pinia 未安装 + 循环依赖），注入 `Authorization`
3. 响应拦截器剥壳：`code === 0` → `return res.data`（需 `as AxiosResponse` 满足 axios 签名）；否则提示 + `Promise.reject`
4. 出口对象只暴露 get/post/put/delete，泛型用 **`service.get<T, T>` 双泛型**钉死 R，对齐剥壳后的运行时行为
5. HTTP 错误统一处理：401 清 token 跳登录（加标记防并发重复跳转），状态码映射友好文案

## 示例

```ts
// 出口核心：第二个泛型参数 R = T，是整个封装类型体验的关键
// axios 签名: get<T, R = AxiosResponse<T>, D = any>(...): Promise<R>
const request = {
    get: <T>(url: string, params?: object) => service.get<T, T>(url, { params }),
    post: <T>(url: string, data?: object) => service.post<T, T>(url, data),
    put: <T>(url: string, data?: object) => service.put<T, T>(url, data),
    delete: <T>(url: string, params?: object) => service.delete<T, T>(url, { params }),
}
export default request

// 业务模块：调用处填业务类型，res 直接是纯数据
export function loginApi(params: LoginParams) {
    return request.post<LoginResult>('/login', params)
}
```

## 注意事项 / 坑

- 只写 `get<T>` 时 R 默认 = `AxiosResponse<T>`，类型鼓励你写 `res.data.token`——编译通过但运行时 undefined（拦截器已剥壳）
- 剥壳 `return res.data` 会报 ts2345：axios 拦截器签名硬编码 AxiosResponse，在边界处 `as AxiosResponse` 受控断言，谎言只留这一个点，禁止用 @ts-ignore
- 拦截器 reject 后必须继续 `Promise.reject`，否则错误被吞进 then
- `??` 与 `?:` 混用必须加括号（`??` 优先级高），否则状态码命中时会误走三元分支
- 401 并发请求加 `isRedirecting` 标记防重复弹窗/跳转
- request.get 已包装 `{ params }`，调用处直接传查询对象，不要再包一层

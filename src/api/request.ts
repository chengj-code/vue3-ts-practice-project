import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from './types'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10_000
})
// 请求拦截器 拼接token
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    if (userStore.token) {
        config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    return config
})

// 响应拦截器 统计错误提示
service.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        const res = response.data;
        if (res.code === 0) {
            // 剥壳：运行时返回纯 data，axios 签名要求 AxiosResponse，
            // 类型系统无法表达"拦截器改变响应形态"，边界处断言； // 真实类型由出口 request 对象的 <T, T> 对齐
            return res.data as AxiosResponse
        }
        ElMessage.error(res.message || '请求失败');
        return Promise.reject(new Error(res.message || '请求失败'));
    },
    (error: AxiosError<ApiResponse>) => {
        handleHttpError(error);
        return Promise.reject(error);
    }
)

const ERROR_CODES: Record<number, string> = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '没有权限访问该资源',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
}

let isRedirecting = false;

const handleHttpError = (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status;
    if (status === 401) {
        if (isRedirecting) return;
        isRedirecting = true;
        const userStore = useUserStore();
        userStore.clearUser();
        ElMessage.error('登录已过期，请重新登录');
        const redirect = encodeURIComponent(router.currentRoute.value.fullPath);
        router.push(`/login?redirect=${redirect}`);
        setTimeout(() => {
            isRedirecting = false;
        }, 1000);
        return;
    }
    const msg = ERROR_CODES[status ?? 0] ?? (error.code === 'ECONNABORTED' ? '请求超时，请稍后重试' : '网络异常，请检查网络连接');
    ElMessage.error(msg);
}

// get<T = any, R = AxiosResponse<T>, D = any>(
//   url: string,
//   config?: AxiosRequestConfig<D>,
// ): Promise<R>
// - `T` 描述的是 `response.data` 的类型（axios 以为你没剥壳）
// - `R` 描述的是 最终 resolve 出来的类型
// 只写`service.get<T>(url, ...)` 时，`R` 默认 =`AxiosResponse<T>` ，返回类型就是`Promise<AxiosResponse<T>>` 。但你的响应拦截器已经剥壳`return res.data` ， 运行时实际拿到的是 T 本身 。类型说“你会拿到 AxiosResponse”，运行时却是裸数据——两边对不上，业务层写`res.token` 会直接报类型错误。
const request = {
    get: <T>(url: string, params?: object) => service.get<T, T>(url, { params }),
    post: <T>(url: string, data?: object) => service.post<T, T>(url, data),
    put: <T>(url: string, data?: object) => service.put<T, T>(url, data),
    delete: <T>(url: string, params?: object) => service.delete<T, T>(url, { params }),
}

export default request;
import request from "../request";
import type { PageQuery, PageResult } from "../types";

// 与 mock/list.ts 的 UserItem 保持一致
export interface UserItem {
    id: number;
    name: string;
    age: number;
    email: string;
    phone: string;
    status: boolean;
    createTime: string;
}

export function getUserListApi(params: PageQuery) {
    return request.get<PageResult<UserItem>>('/user/list', params);
}

export function addUserApi(data: Omit<UserItem, "id">) {
    return request.post<UserItem>('/user', data);
}

export function updateUserApi(id: number, data: Partial<UserItem>) {
    return request.put<UserItem | null>(`/user/${id}`, data);
}

export function deleteUserApi(id: number) {
    return request.delete<null>(`/user/${id}`);
}

export function getUserByNameApi(name: string) {
    return request.get<UserItem | null>('/user/check', { name });
}

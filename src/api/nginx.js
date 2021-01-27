import { get, post, put, DELETE } from '@/plugin/utils/request'

// 获取虚拟主机列表
export const getList = (page,pageSize) => get('/api/v1/nginx/query', page,pageSize);
// 添加虚拟主机
export const addVirtualHost = (params) => post("/api/v1/nginx/host", params);
// 搜索
export const searchVirtualHost = (keywords) => get('/api/v1/nginx/query', keywords);
// 编辑主机
export const editVirtualHost = (params) => put("/api/v1/nginx/host", params);
// 删除虚拟主机
export const delVirtualHost = (id) => DELETE('/api/v1/nginx/host', id);

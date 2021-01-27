import { get, post, put, DELETE } from '@/plugin/utils/request'

// 查询
export const search  = (params)=> post('/api/v1/es/search', params);
// 获取es 索引
export const getEsIndex  = ()=> get('/api/v1/es/search', '');
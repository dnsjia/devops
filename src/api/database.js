import { get, post, put, DELETE } from '@/plugin/utils/request'

// 申请数据库权限
export const database  = (params) => post('/api/v1/database', params);
// 获取db申请记录
export const dbRecord = () => get('/api/v1/database', '')
// 同意申请
export const dbRecordAgree = (params) => put('/api/v1/database', params)
// 拒绝申请
export const dbRecordRefuse = (params) => put('/api/v1/database', params)
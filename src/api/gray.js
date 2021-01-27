import { get, post, put, DELETE } from '@/plugin/utils/request'
/**灰度发布接口管理*/

// 获取灰度列表
export const getList  = ()=> get('/api/v1/gray/list');
// 获取灰度域名列表
export const getGrayDomainList  = ()=> get('/api/v1/gray/domain/list');
// 添加灰度规则
export const addGrayRule  = (params)=> post('/api/v1/gray/domain/list',params);
// 删除单个灰度规则
export const delGrayRule  = (id)=> DELETE('/api/v1/gray/domain/list',id);
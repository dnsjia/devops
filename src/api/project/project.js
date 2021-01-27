import { get, post } from '@/plugin/utils/request'

// 获取项目列表
export const getList = (page,size) => get("/api/v1/project/query", page,size);

// 添加项目
export const addProject = (VirtualHostInfo) => post("/api/nginx_search", VirtualHostInfo);

// 删除删除
export const delProject = (id) => post("/api/nginx_search", id);

// 项目搜索
export const searchProject = (keywords) => get("/api/v1/project/query", keywords);

// 根据升级包搜索部署单
export const searchApproval = (keywords) => get('/api/project/searchUpdatePackge', keywords);

// 审批人
export const getApprovalUser = (params) => get('/api/v1/project/approvalUser', params);

// 获取审批列表
export const getApprovalList = (params) => get('/api/v1/project/approvalList', params);

// 获取审批单状态数量统计
export const countApprovalStatus = (params) => get('/api/v1/project/approvalAll', params);

// 创建部署单
export const createDeploy = (id, params, file) => post('/api/v1/deploy', id, params, file);

// 部署单详情
export const deployDetail = (queryId) => post('/api/v1/deploy/detail', queryId );

// 部署单操作日志
export const deployAuditLogs = (taskId) => get('/api/v1/deploy/audit', taskId );

// 部署代码
export const deployCode = (params) => post('/api/v1/deploy/code', params);

// 操作审批状态
export const approvalDeployStatus = (params) => post('/api/v1/deploy/approvalDeploy', params);

// 获取可回滚的部署版本
export const rollBackHistoryVeserion = (id) => get('/api/v1/deploy/rollback', id);

// 根据id回退版本
export const toRollback = (params) => post('/api/v1/deploy/rollback', params);
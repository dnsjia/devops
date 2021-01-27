import { get, post, put, DELETE } from '@/plugin/utils/request'

// 增加测试用例
export const addCase  = (params) => post('/case/insert/', params);
// 获取所有用例信息
export const caseAll  = (params) => get('/case/list/', params);
// 运行用例
export const runCase = (params) => post('/case/runner/', params)
// 获取任务记录
export const getCaseTask = (params) => get('/case/task', params)
// 获取任务日志
export const caseTaskLogs = (taskId) => post('/case/task_logs/', taskId)
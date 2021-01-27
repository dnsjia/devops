import instance, {get, post, put} from "@/plugin/utils/request";

// 工单接口
export const ticketList = (page) => get('/api/v1/ticket/record', page)
// 查看单个工单信息
export const  ticketDetail = (ticketId) => get('/api/v1/ticket/detail', ticketId)
// 获取工单问题分类
export const  ticketType = () => get('/api/v1/ticket/type')
// 提交工单
export const ticket = (params) => post('/api/v1/ticket', params)
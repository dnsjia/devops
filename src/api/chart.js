import { get, post } from '@/plugin/utils/request'

// 获取应用、 工单、 主机、 部署单统计数据
export const getCountChart = (params) => get("/api/v1/dashboard/count");

// 一周部署单图表
export const getDeployChart = (params) => get("/api/v1/dashboard/deployChart");
import { get, post, put, DELETE } from '@/plugin/utils/request'

//获取deployment
export const deployments = (page,pageSize) => get('/k8s/deployments', page, pageSize);
//获取命名空间
export const namespaces = (namespace,page,pageSize) => get('/k8s/namespaces', namespace, page, pageSize);
//获取container group
export const container = (params) => get('/k8s/pods/', params)
//删除某个Pod
export const podDelete = (params) => DELETE('/k8s/pod', params)
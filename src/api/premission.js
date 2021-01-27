import { get, post, put, DELETE } from '@/plugin/utils/request'
//获取树形菜单
export const MenuTree =() => get('/rbac/menu/tree/', '');

/*****************路径相关******************/
export const pathGet = () => get('/rbac/paths/', '')
/*****************角色相关******************/
//获取角色列表
export const rolesGet = () => get('/rbac/roles/', '')
//更新角色信息
export const rolesPut = (suffix, data) => put('/rbac/roles/' + suffix + '/', data)
//添加角色
export const rolesPot = (data) => post('/rbac/roles/', data)
//删除角色
export const rolesDelete = (suffix) => DELETE('/rbac/roles/' + suffix + '/')

/*****************权限相关******************/
//获取权限列表
export const rightsGet = () => get('/rbac/permissions/', '')
//添加权限
export const rightsPot = (data) => post('/rbac/permissions/', data)
//修改权限信息
export const rightsPut = (suffix, data) => put('/rbac/permissions/' + suffix + '/', data)
//删除权限
export const rightsDelete = (suffix) => DELETE('/rbac/permissions/' + suffix + '/')
//获取权限树
export const rightTreeGet = () => get('/rbac/permissions/tree/', '')
//获取所有权限
export const rightAllGet = () => get('/rbac/permissions/all/', '')

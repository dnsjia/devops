import instance, {DELETE, get, post, put} from "@/plugin/utils/request";

// 登录
export const login = (loginInfo) => post('/api/v1/user/login', loginInfo)
// 获取单个用户信息
export const userInfo = () => get('/api/v1/user/getUserInfo', '')
// 更新用户
export const updateUser = (userId) => put('/api/v1/user/getUserInfo', userId)
// 更新用户的角色
export const UserRole = (userId) => put('/api/v1/user/UserRole', userId)
// 删除用户
export const deleteUser = (userId) => DELETE('/api/v1/user/getUserInfo', userId)
// 获取用户信息
export const accountInfo = (page,size) => get('/api/v1/user/getAccountInfo', page,size)
// 忘记密码
export const forgotPwd = (email) => post('/api/v1/account/checkEmailExist', email)
// 发送验证码
export const sendCode = (code) => post('/api/v1/account/sendCode', code)
// 校验验证码
export const checkCode = (code) => post('/api/v1/account/checkCode', code)
// 重置密码
export const resetPwd = (pass) => post('/api/v1/account/resetPwd', pass)
// 修改密码
export const changePassWord = (pass) => post('/api/v1/account/changePassWord', pass)
// 钉钉配置
export const dingConfig = (params) => get('/api/v1/dingding', params)
// 钉钉登录
export const dingCode = (params) => post('/api/v1/dingding/callback', params);

// 获取用户可申请的账号列表
export const account = () => get('/api/v1/user/account', '')
// 提交申请
export const submitAccount = (params) => post('/api/v1/user/account', params)
// 获取用户申请帐号记录
export const accountRecord = (page,size) => get('/api/v1/user/account/record', page, size)
// 拒绝用户申请帐号
export const accountRefuse = (id) => put('/api/v1/user/account/record', id)
// 同意用户申请帐号
export const accountAgree = (id) => post('/api/v1/user/account/record', id)

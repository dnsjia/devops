import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
Vue.use(VueRouter);


const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Layout.vue'),
        children: [
            {
                path: '',
                name: 'Index',
                component: () => import('@/views/Index.vue'),
                meta: {
                    title: '仪表盘',
                }
            },
            {
                path: 'aliyun/ecs',
                name: 'EcsServerList',
                component: () => import('@/views/aliyun/ecs.vue'),
                meta: {
                    title: "服务器",
                    module: "资产管理"
                },
                children: []
            },
            {
                path: 'project',
                name: 'ProjectList',
                component: () => import('@/views/project/Application.vue'),
                meta: {
                    title: "项目列表",
                    module: "应用发布"
                },
                children: []
            },
            {
                path: 'deploy/create',
                name: 'Deploy',
                component: () => import('@/views/deploy/CreateDeploy.vue'),
                meta: {
                    title: "创建发布单",
                    module: "应用发布"
                },
                children: []
            },
            {
                path: 'approval',
                name: 'ApprovalList',
                component: () => import('@/views/project/Approval.vue'),
                meta: {
                    title: "审批列表",
                    module: "应用发布"
                },
                children: []
            },
            {
                path: 'deploy/detail',
                name: 'DeployDetail',
                component: () => import('@/views/deploy/Detail.vue'),
                meta: {
                    title: "任务单详情",
                    module: "应用发布"
                },
                children: []
            },
            {
                path: 'nginx/list',
                name: 'Nginx',
                component: () => import('@/views/nginx/List.vue'),
                meta: {
                    title: "转发列表",
                    module: "虚拟主机"
                },
                children: []
            },
            {
                path: 'gray/list',
                name: 'Gray',
                component: () => import('@/views/gray/List.vue'),
                meta: {
                    title: "灰度列表",
                    module: "灰度规则"
                },
                children: []
            },
            {
                path: 'loadbalance/list',
                name: 'Loadbalance',
                component: () => import('@/views/loadbalance/Offline.vue'),
                meta: {
                    title: "负载均衡",
                    module: "SLB"
                },
                children: []
            },
            {    path: 'ticket',
                name: 'Ticket',
                component: () => import('@/views/ticket/Ticket.vue'),
                meta: {
                    title: "工单列表",
                    module: "工单"
                },
                children: []
            },
            {    path: 'ticket/detail',
                name: 'TicketDetail',
                component: () => import('@/views/ticket/Detail.vue'),
                meta: {
                    title: "工单详情",
                    module: "工单列表"
                },
                children: []
            },
            {
                path: 'container/workload',
                name: 'Container',
                component: () => import('@/views/container/List.vue'),
                meta: {
                    title: "工作负载",
                    module: "容器管理"
                },
                children: []
            },
            {
                path: 'container/node',
                name: 'Container',
                component: () => import('@/views/container/Node.vue'),
                meta: {
                    title: "节点池",
                    module: "容器管理"
                },
                children: []
            },
            {
                path: 'container/podLogs',
                name: 'PodLogs',
                component: () => import('@/views/container/PodLogs.vue'),
                meta: {
                    title: "容器日志",
                    module: "容器管理"
                },
                children: []
            },
            {
                path: 'user/account',
                name: 'Account',
                component: () => import('@/views/user/Account.vue'),
                meta: {
                    title: "账号申请",
                    module: "权限申请"
                },
                children: []
            },
            {
                path: 'user/account/record',
                name: 'AccountRecord',
                component: () => import('@/views/user/AccountRecord.vue'),
                meta: {
                    title: "申请记录",
                    module: "权限申请"
                },
                children: []
            },
            {
                path: 'user/manage',
                name: 'UserManage',
                component: () => import('@/views/user/UserManage.vue'),
                meta: {
                    title: "用户中心",
                    module: "权限管理"
                },
                children: []
            },
            {
                path: 'user/database',
                name: 'Database',
                component: () => import('@/views/user/UserDatabase.vue'),
                meta: {
                    title: "数据库权限",
                    module: "用户管理"
                },
                children: []
            },
            {
                path: 'application/restart',
                name: 'AppRestart',
                component: () => import('@/views/application/AppRestart.vue'),
                meta: {
                    title: "应用重启",
                    module: "运维工具"
                },
                children: []
            },

            {
                path: 'rights',
                name: 'Rights',
                component: () => import('@/views/roles/Rights.vue'),
                meta: {
                    title: "权限列表",
                    module: "权限管理"
                },
                children: []
            },
            {
                path: 'roles',
                name: 'Roles',
                component: () => import('@/views/roles/Roles.vue'),

                meta: {
                    title: "角色列表",
                    module: "权限管理"
                },
                children: []
            },
            {
                path: 'application/diagnosis',
                name: 'AppDiagnosis',
                component: () => import('@/views/application/AppDiagnosis.vue'),
                meta: {
                    title: "在线诊断",
                    module: "运维工具"
                },
                children: []
            },
            {
                path: 'application/es',
                name: 'ElasticSearch',
                component: () => import('@/views/application/ElasticSearch.vue'),
                meta: {
                    title: "ES查询",
                    module: "运维工具"
                },
                children: []
            },
            {
                path: 'autocase/case',
                name: 'Case',
                component: () => import('@/views/autocase/Case.vue'),
                meta: {
                    title: "用例管理",
                    module: "自动化测试"
                },
                children: []
            },
            {
                path: 'autocase/case/task',
                name: 'CaseTask',
                component: () => import('@/views/autocase/CaseTask.vue'),
                meta: {
                    title: "用例任务",
                    module: "自动化测试"
                },
                children: []
            },
        ],

    },
    {
        path: '/user/login',
        name: 'Login',
        component: () => import('@/views/user/Login.vue'),
        meta: {
            title: '用户登录',
            module: "用户登录"
        }
    },
    {
        path: '/user/register',
        name: 'Register',
        component: () => import('@/views/user/Register.vue'),
        meta: {
            title: '用户注册',
            module: "用户注册"
        }
    },
    {
        path: '/user/forgotPwd',
        name: 'ForgotPwd',
        component: () => import('@/views/user/ForgotPwd.vue'),
        meta: {
            title: '忘记密码'
        }
    },
    {
        path: '*',
        component: () => import('@/views/Error404.vue'),
        meta: {
            title: 'Not Found 当前页面未找到!'
        }
    }


];


const router = new VueRouter({
    routes,
    mode: 'history',
    base: process.env.BASE_URL,
});

// 导航守卫
router.beforeEach((to, from, next) => {
    if (to.path == '/user/forgotPwd'){
        return next()
    }

    if (!localStorage.getItem("onLine")) {
        if (to.path !== '/user/login') {
            return next('/user/login')
        }
    }


    // 进度条start
    NProgress.start();
    document.title = to.meta.title + " - 小飞猪运维平台";
    next()
});

router.afterEach(() => {
    NProgress.done()
});


export default router

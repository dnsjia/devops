<template>
  <a-layout id="layout" style="min-height: 100vh">
    <a-layout-sider class="left-memu" v-model="collapsed" collapsible>
      <div class="logo" title="运维平台">{{collapsed?'': + this.ENV.Title}}</div>
      <a-menu theme="dark" :defaultOpenKeys="openKeys" :default-selected-keys="['1']" mode="inline">
        <a-menu-item key="1">
            <a-icon type="dashboard"/>
            <span>仪表盘</span>
        </a-menu-item>

        <a-sub-menu key="server">
            <span slot="title"><a-icon type="cloud-server"/><span>资产管理</span></span>
            <a-menu-item key="server1">服务器</a-menu-item>
            <a-menu-item key="switch1">交换机</a-menu-item>
        </a-sub-menu>

        <a-menu-item key="3">
            <router-link tag="div" :to="{name: 'Login'}"><a-icon type="database"/><span>应用发布</span></router-link>
        </a-menu-item>

        <a-menu-item key="4">
            <a-icon type="container"/>
            <span>容器管理</span>
        </a-menu-item>

        <a-menu-item key="虚拟主机">
            <router-link tag="div" :to="{name: 'Nginx'}"><a-icon type="share-alt"/><span>虚拟主机</span></router-link>
        </a-menu-item>

        <a-menu-item key="6">
          <a-icon type="gateway"/>
          <span>灰度规则</span>
        </a-menu-item>
        <a-menu-item key="7">
            <a-icon type="apartment"/>
            <span>负载均衡</span>
        </a-menu-item>
        <a-menu-item key="8">
            <a-icon type="tool"/>
            <span>工单提交</span>
        </a-menu-item>

        <a-sub-menu key="sub1">
            <span slot="title"><a-icon type="user"/><span>用户管理</span></span>
            <a-menu-item key="sub2">权限回收</a-menu-item>
            <a-menu-item key="sub3">帐号申请</a-menu-item>
            <a-menu-item key="sub4">修改密码</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="sub2">
            <span slot="title"><a-icon type="notification"/><span>消息通知</span></span>
        </a-sub-menu>

      </a-menu>
    </a-layout-sider>
    <a-layout>

      <a-layout-header class="flex j-s" style="background: #fff; padding: 0">
          <a-dropdown style="margin-right: 20px">
            <a-badge :count="1"><a-avatar shape="square" style="color: #f56a00; backgroundColor: #fde3cf">U</a-avatar></a-badge>

            <a-menu slot="overlay">
                <a-menu-item>
                    <a href="javascript:;"><a-icon type="redo"/>修改密码</a>
                </a-menu-item>

                <a-menu-item>
                    <a href="javascript:;" @click="logout"><a-icon type="logout"/>注销登录</a>
                </a-menu-item>

                <a-menu-item>
                    <a href="javascript:;">3rd menu item</a>
                </a-menu-item>
            </a-menu>
          </a-dropdown>
      </a-layout-header>

      <a-layout-content style="margin: 0 16px">
          <a-breadcrumb style="margin: 16px 0">
              <a-breadcrumb-item>User</a-breadcrumb-item>
              <a-breadcrumb-item>Bill</a-breadcrumb-item>
          </a-breadcrumb>
          <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
              <!--这里是view渲染后的内容-->
              <router-view></router-view>
          </div>
      </a-layout-content>

      <a-layout-footer style="text-align: center">
          ©2020 运维平台/DEVOPS
      </a-layout-footer>

    </a-layout>

  </a-layout>

</template>


<script>
  export default {
    data() {
      return {
        collapsed: false,
        selectedKeys: [],
        openKeys: []
      };
    },
    watch: {
      $route(){
      }
    },
    created() {
      if (this.$router.meta && this.$router.meta.module) {
        this.openKeys = [this.$router.meta.module];
      }
      this.selectedKeys = [this.$router.path];
    },
    methods: {
      logout() {
        // 清除缓存
        this.$router.push({name: 'Login'});
      }
    }
  }
</script>

<style>
#layout .logo {
    height: 32px;
    line-height: 32px;
    color: #fff;
    text-align: center;
    letter-spacing: 8px;
    font-size: 12px;
    font-weight: bold;
    margin: 16px;
}

</style>

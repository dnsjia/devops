<template>
<div>
  <a-layout id="layout" style="min-height: 100vh">
    <a-layout-sider v-model="collapsed" collapsible>
      <div class="logo"  title="运维平台">{{ collapsed ? '' : + this.ENV.Title }}</div>
        <a-menu theme="dark" :defaultOpenKeys="openKeys" :default-selected-keys="selectedKeys" mode="inline">

        <a-menu-item key="dashboard">
          <router-link tag="div" :to="{name: 'Index'}"><a-icon type="dashboard"/><span>仪表盘</span></router-link>
        </a-menu-item>
        <template v-for="item in menuItems">
        <!--一级菜单-->
        <a-sub-menu v-if="item.children && item.is_active" :index="item.id + ''">
          <template slot="title">
            <a-icon v-if="item.icon" :type="item.icon"/>
            <span>{{item.name}}</span>
          </template>
          <!-- 二级菜单 -->
          <a-menu-item :index="subItem.path"
                        v-for="subItem in item.children"
                        :key="subItem.id"
                        v-if="subItem.is_active">
              <router-link :to="{path:subItem.path}">
              <a-icon v-if="subItem.icon" :type="subItem.icon"/>
                <span>{{subItem.name}}</span>
              </router-link>
          </a-menu-item>
        <!--没有二级菜单的一级菜单-->
        </a-sub-menu>
        <a-menu-item v-else>
          <template v-if="!item.children && item.is_active">
              <router-link :to="{path:item.path}">
            <a-icon v-if="item.icon" :type="item.icon"/>
                <span>{{item.name}}</span>
              </router-link>
          </template>
        </a-menu-item>
      </template>
      </a-menu>
    </a-layout-sider>
  <a-layout>
      <a-layout-header style="background: #fff; padding: 0" >
      <a-dropdown style="margin-right: 120px; margin-top: 18px; float:right">
          <a-badge :count="0"><a-avatar :src="current_user" icon="user" /></a-badge>

          <a-menu slot="overlay">
            <a-menu-item>
              <a href="javascript:;" @click="resetShowModel"><a-icon type="redo"/>修改密码</a>
            </a-menu-item>

            <a-menu-item>
              <a href="javascript:;" @click="logout"><a-icon type="logout"/>注销登录</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>

      </a-layout-header>

      <a-layout-content :style="{margin: '0 16px'}">
          <!--面包屑-->
          <a-breadcrumb  style="margin: 14px 0">
            <a-breadcrumb-item>     首页</a-breadcrumb-item>
            <a-breadcrumb-item v-if="$route.meta.module"><a href="">{{ $route.meta.module }}</a></a-breadcrumb-item>
            <a-breadcrumb-item>{{ $route.meta.title }}</a-breadcrumb-item>
          </a-breadcrumb>

        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <!--这里是view渲染后的内容-->
          <router-view></router-view>
        </div>
        <a-back-top />
      </a-layout-content>

      <a-layout-footer style="text-align: center">©2020 运维平台/DEVOPS</a-layout-footer>

    </a-layout>
  </a-layout>

<!-- Start 修改密码Model   -->
  <a-modal title="修改密码" :visible="resetPwdVisible" :confirm-loading="resetPwdConfirmLoading"
           @ok="resetPwdHandleOk(ruleResetForm)"
           @cancel="resetPwdHandleCancel"
           cancelText="取消"
           okText="确定"
  >
    <a-form-model ref="ruleResetForm" :model="ruleResetForm" :rules="rulesReset" v-bind="layout">
      <a-form-model-item label="新密码" prop="pass">
        <a-input-password v-model="ruleResetForm.pass" type="password" autocomplete="off" />
      </a-form-model-item>
      <a-form-model-item label="确认新密码" prop="checkNewPass">
        <a-input-password v-model="ruleResetForm.checkNewPass" type="password" autocomplete="off" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>

<!--  Stop 修改密码Model  -->
</div>

</template>
<script>
import {mapGetters} from "vuex";
import {MenuTree} from '@/api/premission'
import {changePassWord} from '@/api/user'
export default {
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'));
      } else {
        if (this.ruleResetForm.checkNewPass !== '') {
          this.$refs.ruleResetForm.validateField('checkNewPass');
        }
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'));
      } else if (value !== this.ruleResetForm.pass) {
        callback(new Error("两次输入的密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      collapsed: false,
      selectedKeys: [],
      openKeys: [],
      // 修改密码Model
      resetPwdVisible: false,
      resetPwdConfirmLoading: false,
      // 关闭时销毁 Modal 里的子元素
      destroyOnClose: false,
      rulesReset: {
        pass: [{ validator: validatePass, trigger: 'change'},
          {pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{6,25}$/, message: '密码必须为6-25个字母且包含数字及特殊符号'}],
        checkNewPass: [{ validator: validatePass2, trigger: 'change' }],
      },
      ruleResetForm: {
        pass: '',
        checkNewPass: '',
      },
      layout: {
        labelCol: {span: 4},
        wrapperCol: {span: 20},
      },
      // 菜单
      menuItems: [],
    };
  },
  watch: {
    $route() {
      //console.log(this.$route, 'watch')
      console.log('watch')
    }
  },
  created() {
    this.getMenuTreeList();
    if (this.$router.meta && this.$router.meta.module) {
      this.openKeys = [this.$router.meta.module];
    }
    this.selectedKeys = [this.$route.path]
  },
  methods: {
    logout() {
      // 清除缓存
      localStorage.removeItem('token')
      localStorage.removeItem('onLine') // 登录状态
      sessionStorage.removeItem('avatar')
      this.$router.push({name: 'Login'});
    },
    resetShowModel(){
      this.resetPwdVisible = true;
    },
    resetPwdHandleOk(e){
      // 点击修改密码， 开始校验input 内容
      this.$refs.ruleResetForm.validate(valid => {
        if (valid) {
          // 校验通过
          this.resetPwdConfirmLoading = false;
          changePassWord({'email':this.$cookies.get("email"), 'password': this.ruleResetForm.checkNewPass}).then((resp) => {
            if (resp.errcode === 0) {
              this.$msgsuccess(resp.msg)
              // 关闭Model
              this.resetPwdVisible = false;
              // 清空修改密码input 中的内容
              this.ruleResetForm.pass = ''
              this.ruleResetForm.checkNewPass = ''
              // 密码修改成功后重新登陆
              this.logout()
            } else {
                this.$msgerror(resp.msg)
            }
          })
        }
      });
    },
    // 修改密码 取消按钮
    resetPwdHandleCancel(e){
      this.resetPwdVisible = false;
      // 清空修改密码input 中的内容
      this.ruleResetForm.pass = ''
      this.ruleResetForm.checkNewPass = ''
      // 重置form 校验提示信息
      this.$refs.ruleResetForm.resetFields();
    },
    getMenuTreeList() {
      MenuTree().then((res) => {
        this.menuItems = res;
      })
    }
  },
  computed: {
    current_user(){
      return sessionStorage.getItem("avatar")
    }
  }
};
</script>

<style>
#layout .logo {
  height: 32px;
  line-height: 32px;
  margin: 16px;
  text-align: center;
  letter-spacing: 8px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
</style>

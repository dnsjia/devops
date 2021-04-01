<template>
  <div id="app" class="loginBox">
 <h3 class="login-title"><img src="../../assets/logo.jpg" width="90px" height="80px"/></h3>
    <a-tabs default-active-key="1" @change="callback">

      <a-tab-pane key="1" tab="账号登录">
      <a-form id="components-form-demo-normal-login" :form="form" class="login-form" @submit="handleSubmit">
        <a-form-item>
            <a-input v-decorator="[
                'username',{
                rules: [{type: 'email', message: '帐号邮箱格式不正确'},{ required: true, message: '用户名不能为空!' }] },]"
                placeholder="邮箱" >
              <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)"/>
            </a-input>
        </a-form-item>

        <a-form-item>
            <a-input v-decorator="[
                'password',{
                rules: [{ required: true, message: '密码不能为空!' }] },]" type="password" placeholder="密码">
              <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)"/>
            </a-input>
        </a-form-item>

        <a-form-item>
            <a-checkbox v-decorator="['remember',{valuePropName: 'checked',initialValue: true,},]">
                记住帐号
            </a-checkbox>
            <a class="login-form-forgot" href="/user/forgotPwd">忘记密码</a>
            <a-button type="primary" html-type="submit" class="login-form-button">登录</a-button>
        </a-form-item>
      </a-form>

      </a-tab-pane>

      <a-tab-pane key="2" tab="钉钉登录"  force-render>
        <div id="login_container" class="login-container"></div>
      </a-tab-pane>

    </a-tabs>
  </div>
</template>


<script>
import {login} from '@/api/user';
import {dingConfig, dingCode} from '@/api/user';
import {getQueryVariable} from "@/plugin/utils/getQueryVariable";
import Vue from 'vue';

export default {
  data: {
    widthVar: "0px", // 1. 设置默认box 高度
  },
  watch: {
    $route: {
      handler: function (route) {
        return ''
      },
      immediate: true
    }
  },
  beforeCreate() {
     this.form = this.$form.createForm(this, {name: 'normal_login'});
    },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          const resp = await login(values);
          if (resp.errcode === 0) {
            this.$msgsuccess(resp.msg);
            // 登陆成功后设置浏览器localStorage email: test@qq.com , 并在router/index.ts 路由拦截, 退出时Layout.vue
            // 删除localStorage email
            this.$cookies.set('email',values.username)
            this.$cookies.set("token", resp.token, 1, 60 * 60 * 4) //2小时过期
            localStorage.setItem("onLine", 1)
            localStorage.setItem("token", resp.token)
            if (values.remember) {
              localStorage.setItem("email", values.username)
            } else {
              localStorage.removeItem("email")
            }
            // 登录成功跳转到首页
            this.$router.push('/')
          } else {
              this.$msgerror(resp.msg)
          }
        }
      });
    },
    callback(key) {
      if (key === 2) {
        this.dcode()
        // 2. 切换tables 钉钉登陆标签时, 使用账号登录将高度设置为 0px
        this.widthVar = "500px";
      }
    },
    ddLogin() {
      const code = getQueryVariable("code"); //查看当前Url中有没有state的这个参数，如果有这个参数证明扫码登录成功重定向地址已经调转完成
      if (code) {
        const state = getQueryVariable("state");
        const temp = {code: code, state: state};
        //钉钉跳转的url后会携带code，state，要传给后台，即调用后台api
        const resp = dingCode(temp).then((_data) => {
          this.widthVar = "500px";
          if (_data.errcode === 0){
            this.$cookies.set("token", _data.token)
            localStorage.setItem("onLine", 1)
            localStorage.setItem("token", _data.token)
            sessionStorage.setItem("avatar", _data.avatar)
            this.$router.push('/')
          } else {
            // 登录失败
            this.$msgerror(_data.msg)
            this.dcode()
          }
        });
      } else {
        //默认二维码的显示
        this.dcode()
      }
    },
    dcode(){
      dingConfig({}).then(_data => {
        const _this = this;
        const {msg, errcode, appid} = _data;
        // 后端返回的钉钉配置信息
        //console.log(msg, errcode, appid);
        if (errcode === 0) {
          const _url = encodeURIComponent(this.ENV.homeURL);
          const goto = encodeURIComponent('https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=' + appid +
              '&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=' + _url);
          const obj = DDLogin({
            id: "login_container",//这里需要你在自己的页面定义一个HTML标签并设置id，例如<div id="login_container"></div>或<span id="login_container"></span>
            goto: goto, //请参考注释里的方式
            style: "border:none;background-color:#FFFFFF;",
            width: "310",
            height: "310"
          });
          const handleMessage = function (event) {
            const origin = event.origin;
            if (origin === "https://login.dingtalk.com") { //判断是否来自ddLogin扫码事件。
              const loginTmpCode = event.data; //拿到loginTmpCode后就可以在这里构造跳转链接进行跳转了
              const url2 = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=' + appid +
                  '&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=' +
                  _url + "&loginTmpCode=" + loginTmpCode;
              window.location.href = url2;
            }
          };
          if (typeof window.addEventListener !== 'undefined') {
            window.addEventListener('message', handleMessage, false);
          } else if (typeof window.attachEvent !== 'undefined') {
            window.attachEvent('onmessage', handleMessage);
          }
        }
        else {
          this.$msgerror("服务器钉钉配置错误")
        }
      });
      },
    getLocalStorage(){
      const test = localStorage.getItem("email");
      this.form.setFieldsValue({username: test,});
    },
  },
  mounted() {
    this.ddLogin();
    this.getLocalStorage();
  }
};

</script>

<style scoped>
body{
  overflow: auto;
}
.loginBox {
    width: 370px;
    /*2.0 绑定data --widthVar 数据*/
    height: var(--widthVar);
    /*边框 1px  solid 颜色*/
    border: 1px solid #DCDFE6;
    margin: 150px auto;
    /*左上右下内边距*/
    padding: 10px 20px 10px 20px;
    /* 边框 弧度*/
    border-radius: 20px;
    /* 阴影 0px 水平, 0px 垂直, 20px 深度 , 颜色 #DCDFE6 */
    box-shadow: 0px 0px 20px #DCDFE6;
}


.login-title {
    /*登录标题居中*/
    text-align: center;
    /* 登录文字与登录框的下边距*/
    margin-bottom: 10px;
}

#components-form-demo-normal-login .login-form {
    max-width: 300px;
}

#components-form-demo-normal-login .login-form-forgot {
    float: right;
}

#components-form-demo-normal-login .login-form-button {
    width: 100%;
}

.login-container {
    text-align: center;
  }



</style>

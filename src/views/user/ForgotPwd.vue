
<template>

  <div id="forgetPwd" class="forgetPwd">

    <a-steps :current="current" :status="status" labelPlacement="vertical">
      <a-step description="" title="填写登录账号" />
      <a-step description="" title="验证" />
      <a-step description="" title="重置密码" />
    </a-steps>
    <a-divider />

    <a-form v-show="forgotInput1" id="forgot-pwd1" :form="form" class="forgot-email" @submit="emailSubmit">
        <a-form-item label="邮箱:">
            <a-input v-decorator="['email',{ rules: [{type: 'email', message: '帐号邮箱格式不正确'},
                                  { required: true, message: '邮箱用户名不能为空!' }] },]"  placeholder="请输入邮箱">
            </a-input>
        </a-form-item>

        <a-form-item>
            <a-button class="login-form-button" html-type="submit" type="primary">下一步,验证</a-button>
        </a-form-item>
    </a-form>

    <div id="verifySmg">
        <a-form-model v-show="forgotInput2" ref="ruleForm" v-bind="layout" :model="ruleForm" :rules="rules" class="forgot-code">
          <div>用户名：{{ username }}</div><p></p>
              <a-form-model-item label="验证码:" prop="code">
                  <a-input id="codecode" v-model.number="ruleForm.code" placeholder="6位数字">
                    <a id="verifySmgBtn" @click="SendCode()" :disabled=sendCodeDisable slot="suffix">{{ sendCodeMsg }}</a>
                  </a-input>
              </a-form-model-item>

              <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }"></a-form-model-item>

              <a-button type="primary" @click="CodeSubmit('ruleForm')" :disabled=nextSendCodeDisable>下一步,验证</a-button>

        </a-form-model>

    </div>

    <div id="resetPwd" v-show="forgotInput3">
        <a-form-model ref="ruleResetForm" :model="ruleResetForm" :rules="rulesReset" v-bind="layout">
          <a-form-model-item label="新密码" prop="pass">
            <a-input v-model="ruleResetForm.pass" type="password" autocomplete="off" />
          </a-form-model-item>
          <a-form-model-item label="确认新密码" prop="checkNewPass">
            <a-input v-model="ruleResetForm.checkNewPass" type="password" autocomplete="off" />
          </a-form-model-item>

          <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
            <a-button type="primary" @click="resetSubmitForm('ruleResetForm')">
              重置新密码
            </a-button>

          </a-form-model-item>
        </a-form-model>
    </div>

    <div id="resetSuccess" v-show="resetSuccess">
      <a-result status="success" title="密码重置成功！" sub-title="请牢记新密码, 点击重新登录">
        <template #extra>
          <a-button key="console" type="primary" @click="goLogin">登录</a-button>
        </template>
      </a-result>
    </div>
  </div>
</template>

<script>
import {resetPwd, forgotPwd, sendCode, checkCode} from '@/api/user';
import { FormModel } from 'ant-design-vue';
import Vue from 'vue';
Vue.use(FormModel);

export default {
  data() {
    var checkPending;
    const checkCode = (rule, value, callback) => {
      clearTimeout(checkPending);
      if (!value) {
        return callback(new Error('请输入验证码'));
      }
      checkPending = setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('验证码只能是数字'));
        } else {
          if (String(value).length < 6 || String(value).length >6) {
            callback(new Error('请输入6位验证码'));
          } else {
            callback();
          }
        }
      }, 1000);
    };
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
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      current: 0,
      status: 'process',
      forgotInput1: true,
      forgotInput2: false,
      forgotInput3: false,
      resetSuccess: false,
      username: null,
      sendcode: '',
      sendCodeMsg: '发送验证码',
      sendCodeDisable: false,
      nextSendCodeDisable: true,

      ruleForm: {
        code: '',

      },
      ruleResetForm: {
        pass: '',
        checkNewPass: '',
      },
      rules: {
        code: [{validator: checkCode, trigger: 'change'}],

      },
      rulesReset: {
        pass: [{ validator: validatePass, trigger: 'change'},
          {pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{6,25}$/, message: '密码必须为6-25个字母且包含数字及特殊符号'}],
        checkNewPass: [{ validator: validatePass2, trigger: 'change' }],
      },
      layout: {
        labelCol: {span: 4},
        wrapperCol: {span: 14},
      },

    }
  },
  beforeCreate() {
     this.form = this.$form.createForm(this, {name: 'normal_login'});
  },
  methods: {
    emailSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async (err, values) => {
        if (!err) {
          const resp = forgotPwd(values).then((_data) => {
            if (_data.data.is_email_exits === "true") {
              this.current = 1
              this.forgotInput1 = false
              this.forgotInput2 = true
              this.username = values.email
              this.status = 'process'
            } else {
              this.$msgerror(_data.msg)
              this.status = 'error'
            }
          })
        }
      });
    },
    SendCode(){
    sendCode({'email': this.username}).then((resp) => {
      if (resp.errcode === 0){
        this.$msgsuccess(resp.msg)
        //获取验证码按钮倒计时功能的实现
        const _this = this;//！！坑！setInterval中的this指向问题
        _this.flag = true; //！按钮不可重复点击
        var time = 60;//定义时间变量 60s
        var timer = null;//定义定时器
        timer = setInterval(function(){
          if (time == 0){
            _this.sendCodeMsg = "重新获取验证码";
            _this.flag = false;
            clearInterval(timer);//清除定时器
            _this.nextSendCodeDisable = true
            _this.sendCodeDisable = false
          } else {
            _this.sendCodeMsg = time + "s";
            time --;
            _this.sendCodeDisable = true;
            _this.nextSendCodeDisable = false;
          }
        },1000)
      } else {
        this.$msgerror(resp.msg)
        }
    });
    },
    CodeSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          checkCode({'code': this.ruleForm.code, 'email': this.username}).then((resp) => {
            if (resp.errcode === 0){
              this.current = 2
              this.forgotInput2 = false
              this.forgotInput3 = true
              this.status = 'process'
              sessionStorage.setItem('code', this.ruleForm.code)
            } else {
              this.$msgerror(resp.msg)
              this.status = 'error'
            }
          })
        } else {
          return false;
        }
      });
    },
    resetSubmitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          resetPwd({'username': this.username, 'password': this.ruleResetForm.pass, 'code': sessionStorage.getItem('code')}).then((resp) => {
            if (resp.errcode === 0){
              this.current = 3
              this.forgotInput3 = false
              this.resetSuccess = true
              this.status = 'process'
              sessionStorage.removeItem('code')
            } else {
              this.$msgerror(resp.msg)
              this.status = 'error'
            }
          })
        } else {
          return false;
        }
      });
    },
    goLogin(){
      this.$router.push({name: 'Login'})
    }
  }
        };
</script>

<style scoped>

.forgetPwd{
  margin-top: 100px;
  margin-left: 300px;
  margin-right: 300px;
}

.forgot-email {
  width: 270px;
  height: 60px;
}
.forgot-code {
  width: 300px;
  height: 60px;

 }

#codecode {
  width: 260px;
}

#resetPwd {
  width: 500px;
  height: 60px;
}

</style>
<template>
  <div class="tips">
    <p>Tips: 账号申请成功后, 请妥善保管您的密码, 请勿将密码泄露给他人！</p>
    <a-divider />

    <a-select style="width: 20%" @change="onChange" placeholder="请选择你要申请的帐号类型">账号类型
      <a-select-option v-for="account in accountType" :key="account.id" v-mode="accountType">{{ account.account_type }}</a-select-option>
    </a-select>
    <p></p>
    <a-textarea style="width: 20%" placeholder="请在这里输入申请原因, 申请原因描述不清晰可能会被拒绝哦！如果需要其它帐号请选择工单方式提交。" :rows="4" v-model="accountDesc"/>
    <p></p>
    <a-button type="primary" @click="accountSubmit">提交申请</a-button>
  </div>
</template>


<script>
import {account, submitAccount} from '@/api/user'
export default {
name: "Account",
  data() {
    return {
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },
      email: '',
      accountDesc: '',
      accountType: null,
      accountTypeNumber: null
    };
  },
  methods: {
    onChange(e,value) {
      this.accountTypeNumber = e
    },
    getAccountList(){
      account({}).then((resp) => {
        this.accountType = resp.results
        this.email = this.$cookies.get('email')
      })

    },
    accountSubmit(){
      if (this.accountTypeNumber == null){
        this.$msgerror("请选择你要申请的账号")
      }else if (this.accountDesc == '') {
        this.$msgerror("申请原因不能为空！")
      }else if (this.accountDesc.length < 10){
        this.$msgerror("申请原因不能少于10个中文汉字或者字母、数字")
      }else {
        submitAccount({'accountType': this.accountTypeNumber, 'accountDesc': this.accountDesc}).then((resp) => {
          if (resp.errcode === 0){
            this.$msgsuccess(resp.msg)
          }else if (resp.errcode === 1000){
            this.$msgwarning(resp.msg)
          }else {
            this.$msgerror(resp.msg)
          }
        })
      }
    }
  },
  mounted() {
    this.getAccountList()
  },

}

</script>

<style scoped>

.tips p{
  font-size: 14px;
  color: #f10f32;
}
</style>
<template>
  <div>
    <a-form :layout="formLayout">
    <a-form-item :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">

    <a-form-item label="容器：">
      <a-input :value=podName :disabled="true" style="width: 280px"/>
    </a-form-item>
    <a-form-item label="名称空间：" >
      <a-input :value=namespace :disabled="true"/>
    </a-form-item>
    <a-form-item label="显示行数：">
      <a-select style="width: 160px"
        v-decorator="[
          'gender',
          { rules: [{ required: true, message: '请选择日志条数' }] },
        ]"
        placeholder="选择日志显示条数"
        @change="handleSelectLogsNumber"
      >
        <a-select-option value="100">
          100
        </a-select-option>
        <a-select-option value="200">
          200
        </a-select-option>
        <a-select-option value="500">
          500
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-button type="primary" @click="openLogs()">刷新</a-button>
   </a-form-item>
  </a-form>
    <br><br><br>
    <div id="filelog-container" style="height: 500px; overflow-y: scroll; background: #404040; color: #dedede; padding: 10px;">
    <div id="viewLog">
      <p v-for="i in LogMsg">{{i}}</p>
    </div>
    </div>
  </div>
</template>

<script>
import {podLogs} from '@/api/k8s'

export default {
name: "PodLogs",
  data(){
    return {
      formLayout: 'inline',
      podName: '',
      namespace: '',
      logsNumber: '',
      LogMsg: null,
  }
  },
  mounted() {
    this.podName = this.$route.query.pod_name
    this.namespace = this.$route.query.namespace
  },
  methods: {
    handleSelectLogsNumber(event){
      // console.log(event)
      this.logsNumber = event
      this.openLogs()
    },
    openLogs(){
      if (this.logsNumber === '' || this.logsNumber === null){
        this.$msgwarning('请选择日志条数')
      }else {
        console.log(this.logsNumber)
        podLogs({pod: this.podName, namespace: this.namespace, tail_line: this.logsNumber}).then(res => {
          if (res.errcode === 0){
            this.LogMsg = res.data
            const div1 = document.getElementById('filelog-container')
            div1.scrollTop = div1.scrollHeight
          }else {
            this.LogMsg = res.data
            this.$msgerror(res.msg)
          }
        });
      }
    },
  },
  computed: {
    formItemLayout() {
      const {formLayout} = this;
      return formLayout === 'horizontal'
          ? {
            labelCol: {span: 4},
            wrapperCol: {span: 8},
          }
          : {};
    },
  },
}
</script>

<style scoped>

</style>
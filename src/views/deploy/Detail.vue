<template>
<a-skeleton :loading="loading" rows=50 active>
  <div>
    <a-page-header style="border: 1px solid rgb(235, 237, 240)" :title="deployData.project_title" @back="() => $router.go(-1)">
      <a-modal title="拒绝原因" :visible="visible" @ok="refuseOk" @cancel="refuseCancel" cancelText="取消" okText="确定" width="260px">
        <a-form-model ref="refuseForm" :model="refuseForm" :rules="rules">
          <a-form-model-item ref="refuseMsg"  prop="refuseMsg">
            <a-textarea style="margin-top: -18px;" v-model="refuseForm.refuseMsg" placeholder="请输入拒绝原因" :auto-size="{ minRows: 3, maxRows: 5 }" @blur="() => {$refs.refuseMsg.onFieldBlur();}"/>
          </a-form-model-item>
        </a-form-model>
      </a-modal>

      <template slot="tags">
        <a-tag color="blue">{{deployData.status_cn}}</a-tag>
        <a-tag color="orange">{{deployData.deploy_env}}</a-tag>
        <a-tag color="red">{{deployData.deploy_type}}</a-tag>
      </template>


      <template slot="extra">
        <a-button v-show="deployData.status===1" key="1" type="primary" icon="audit" @click="agree">同意</a-button>
        <a-button v-show="deployData.status===1" key="2" type="danger" icon="issues-close" @click="refuse">拒绝</a-button>
        <a-button v-show="deployData.status===2 || deployData.status ===3" key="3" type="primary" icon="aliyun" :loading="deployLoading" @click="deployBtn">部署
        </a-button>
      </template>

      <template slot="footer">
        <a-tabs default-active-key="1" @change="Logs">
          <a-tab-pane key="1" tab="详情"><br><br>
            <a-timeline>
              <a-timeline-item v-for="({id, message, audit_time}) in auditRes.data" :key="id" color="green">
                 {{message}}  {{audit_time | fmtTime}}
              </a-timeline-item>
            </a-timeline>
          </a-tab-pane>

          <a-tab-pane key="2" tab="日志"><br><br>
              <a-button type="primary" @click="openLogs()" :disabled="openLogs1">开启日志</a-button>&nbsp;&nbsp;
              <a-button type="danger" @click="closeLogs()" :disabled="closeLogs1">关闭日志</a-button>&nbsp;<br><br>
              <div id="filelog-container" style="height: 400px; overflow-y: scroll; background: #404040; color: #dedede; padding: 10px;">
              <div id="viewLog">疯狂的输出日志...</div>
              </div>
              <br><br>
          </a-tab-pane>

        </a-tabs>
      </template>

        <div class="content">
          <div class="spin-content">
            <a-descriptions size="small" :column="2">
              <a-descriptions-item label="任务编号">{{ deployData.task_id }}</a-descriptions-item>
              <a-descriptions-item label="测试报告">
                  <a @click="openTestReport(testreporturl + deployData.test_report)"  :title="deployData.original_file_name">预览</a>
              </a-descriptions-item>
              <a-descriptions-item label="申请标题">{{ deployData.title }}</a-descriptions-item>
              <a-descriptions-item label="期待时间">{{ deployData.online_time | fmtTime }}</a-descriptions-item>
              <a-descriptions-item label="上线说明">{{ deployData.before_comment }}</a-descriptions-item>
              <a-descriptions-item label="版本信息"><a-icon type="branches" /> {{ deployData.version }}</a-descriptions-item>
              <a-descriptions-item label="拒绝原因">{{ deployData.refuse_msg || '无'}}</a-descriptions-item>
            </a-descriptions>
          </div>

          <a-divider />
          <div class="extra">
              <div id="approval" :style="{display: 'flex',width: 'max-content',justifyContent: 'flex-end'}">
                  <a-statistic title="申请人" :value="deployData.submit_people" :style="{marginRight: '32px', }"/>
                  <a-statistic title="审批人" :value="deployData.approval_user" :style="{marginRight: '32px',}"/>
                  <a-statistic title="研发人" :value="deployData.develop_user" :style="{marginRight: '32px',}"/>
              </div><br><br>
          </div>
            <!--判断部署中，显示进度条-->
          <a-progress v-show="deployData.status===3" :percent="10" status="active" />
        </div>
      </a-page-header>
    </div>
  </a-skeleton>
</template>

<script>
// import ACol from "ant-design-vue/es/grid/Col";
import {deployDetail, deployAuditLogs, approvalDeployStatus, deployCode} from "@/api/project/project";

export default {
    name: "Detail",
    // components: {ACol},
    // 删除数据, 页面重新reload
    inject: ['reload'],
    data() {
      return {
        testreporturl: '',
        // 日志按钮开关
        openLogs1: false,
        closeLogs1: true,
        wsurl: '',
        loading: true,
        deployLoading: false,
        deployData: [],
        auditRes: [],
        visible: false,
        websocket: null,
        labelCol: { span: 4 },
        wrapperCol: { span: 14 },
        refuseForm: {
          refuseMsg: '',
        },
        // 动态显示日志
        LogMsg: null,
        sendTaskId: null,
        rules: {
          refuseMsg: [{required: true, message: '拒绝原因不能为空', trigger: 'blur'},],
        },
      }
    },
    async created() {
      this.loading = true
      // 部署单详情
      const deploy = await deployDetail({"queryId": this.$route.query.id,}).then((res) => {
        if (res.results){
          this.deployData = res['results'][0];
          this.testreporturl = this.ENV.testReportURL
          this.loading = false
          if (res.results[0].status === 3){
            this.deployLoading = true;
          }
        }
      });
      // 请求审计操作接口
      const audit = deployAuditLogs({"taskId": this.deployData.task_id,}).then((result) => {
        if (result.errcode===0){
          this.auditRes = result
        }
      });
    },
    methods: {
      // 点击部署
      async deployBtn() {
        const res = await deployCode({"taskId": this.deployData.task_id})
        if (res.errcode !== 0){
          this.$msgerror(res.msg)
        }else {
          this.$msgsuccess(res.msg)
          this.deployLoading = true;
          this.reload()
        }
      },
      // 同意
      async agree() {
        // 加载骨架框
        // this.loading = true
        const _this = this
        const res = await approvalDeployStatus({status: "agree", taskId: this.deployData.task_id});
        if (res.errcode ===0){
          _this.$msgsuccess(res.msg)
          this.reload()
        }else{
          _this.$msgerror(res.msg)
        }
      },
      refuse() {
        this.visible = true;
      },
      refuseOk(value) {
        this.$refs.refuseForm.validate(valid => {
          if (valid) {
            const _this = this
            const res = approvalDeployStatus({
                status: "refuse",
                refuseMsg: this.refuseForm.refuseMsg,
                taskId: this.deployData.task_id,}).then((resp =>{
                if (resp.errcode === 0) {
                  _this.$msgsuccess(resp.msg)
                  this.reload()
                } else {
                  _this.$msgerror(resp.msg)
                }
            }));
          }
        })
       },
      refuseCancel(e) {
        this.visible = false
      },
       // websocket
      initWebSocket(){ //初始化weosocket
        const protocol_str = document.location.protocol;
        if (protocol_str == "http:"){
            this.wsurl = 'ws://' + window.location.host + '/ws';
            //console.log("当前是http协议");
        }else if (protocol_str == "https:"){
            this.wsurl = 'wss://' + window.location.host + '/ws';

        }

        const wsuri = this.wsurl;//ws地址
        this.websocket = new WebSocket(wsuri);
        this.websocket.onopen = this.websocketonopen;
        this.websocket.onerror = this.websocketonerror;
        this.websocket.onmessage = this.websocketonmessage;
        this.websocket.onclose = this.websocketclose;
      },
      websocketonopen() {
        //console.log("WebSocket连接成功");
        this.websocketsend(JSON.stringify(this.sendTaskId))
       },
      websocketonerror(e) { //错误
        this.$msgerror("WebSocket连接发生错误")
        //console.log("WebSocket连接发生错误");
      },
      websocketonmessage(e){ //数据接收
        const redata = JSON.parse(e.data);
        if (redata.errcode !== 0) {
          const LogTemp = redata.msg
          this.LogMsg = LogTemp + '<br>' + this.LogMsg
          const tail = document.getElementById('viewLog')
          const p = document.createElement('p')
          p.style.wordWrap = 'break-word'
          p.style.fontSize = 16 + 'px'
          p.appendChild(document.createTextNode(LogTemp))
          tail.appendChild(p)
        } else {
          const LogTemp = redata.data
          this.LogMsg = LogTemp + '<br>' + this.LogMsg
          const tail = document.getElementById('viewLog')
          const p = document.createElement('p')
          p.style.wordWrap = 'break-word'
          p.style.fontSize = 16 + 'px'
          p.appendChild(document.createTextNode(LogTemp))
          tail.appendChild(p)
          const div1 = document.getElementById('filelog-container')
          div1.scrollTop = div1.scrollHeight
        }
      },
      websocketsend(sendTaskId){//数据发送
        this.websocket.send(sendTaskId);
      },
      websocketclose(e){ //关闭
        console.log("connection closed (" + e.code + ")");
      },
     // 点击tables查看部署日志
      Logs(key){
        if (key==='1'){
          // 请求审计操作接口
          const audit = deployAuditLogs({"taskId": this.deployData.task_id,}).then((result) => {
            if (result.errcode===0){
                this.auditRes = result
            }
          });
        }else{
          console.log(113155)
        }
     },
      openLogs() {
        this.openLogs1 = true
        this.closeLogs1 = false
        // 清空日志信息
        const tail=document.getElementById("viewLog");
        const childs = tail.childNodes;
        for(let i = childs.length - 1; i >= 0; i --) {
        tail.removeChild(childs[i]);
        }
        // 初始化websocket连接
        this.initWebSocket();
        // 发送任务编号
        this.sendTaskId = {"task_id": this.deployData.task_id}
      },
      closeLogs() {
        this.openLogs1 = false
        this.closeLogs1 = true
        this.websocket.close()
      },
      openTestReport(previewUrl){
        //previewUrl 要预览文件的访问地址
        window.open(this.ENV.previewServerURL + '/onlinePreview?url=' + encodeURIComponent(previewUrl));
      }
    }
}
</script>

<style>
.ant-progress-circle-wrap,
.ant-progress-line-wrap {
  margin-right: 8px;
  margin-bottom: 5px;
}
#approval .ant-statistic-content{
    font-size: 16px;
}
.spin-content {
  border: 1px solid #91d5ff;
  background-color: #e6f7ff;
  padding: 30px;
}
</style>
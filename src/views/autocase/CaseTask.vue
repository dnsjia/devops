<template>
  <div>
  <a-table :columns="caseLogsColumns" :data-source="caseLogsData" :pagination="false" @showSizeChange="onShowSizeChange" >
  <span slot="action" slot-scope="action, id">
    <a-divider type="vertical"/>
    <a @click="showTaskLogs({task_id: id.task_id})">详情</a>
    <a-divider type="vertical"/>
  </span>
  <span slot="task_run_time" slot-scope="task_run_time">{{task_run_time | fmtTime}}</span>
  <span slot="task_run_done_time" slot-scope="task_run_done_time">{{task_run_done_time | fmtTime}}</span>
  </a-table>
    <div class="float-right" style="padding: 10px 0;">
      <a-pagination size="md"
                    :show-total="total => `共 ${total} 条数据`"
                    v-model="queryInfo.page"
                    :page-size-options="pageSizeOptions"
                    :total="total"
                    show-size-changer
                    :page-size="queryInfo.pageSize"
                    show-less-items align="right"
                    @showSizeChange="onShowSizeChange"
                    @change="onChange">
        <template slot="buildOptionText" slot-scope="props">
          <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
          <span v-if="props.value === '50'">全部</span>
        </template>
      </a-pagination>
    </div>
    <a-drawer title="用例执行日志" width="720" :closable="false" :visible="visible" @close="onClose">
      <div >
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card title="成功" :bordered="false">
              <p><span style="color: rgb(63, 134, 0);font-size: 30px">{{ caseSuccess }}</span></p>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card title="失败" :bordered="false">
              <p><span style="color: rgb(207, 19, 34);font-size: 30px">{{ caseFailed }}</span></p>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card title="跳过" :bordered="false">
              <p><span style="font-size: 30px">{{ caseSkip }}</span></p>
            </a-card>
          </a-col>
        </a-row>
      </div>
      <div v-for="logs in taskLogsData">
        <div id="appMain">
        　　<div v-html="$options.filters.logFilter(logs.logs)"></div>
        </div>
      </div>
      <div
        :style="{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e8e8e8',
          padding: '10px 16px',
          textAlign: 'right',
          left: 0,
          background: '#fff',
          borderRadius: '0 0 4px 4px',
        }"
      >
      </div>
    </a-drawer>
  </div>
</template>

<script>
import {getCaseTask, caseTaskLogs} from "@/api/testcase";
const caseLogsColumns = [
  {
    title: '任务ID',
    dataIndex: 'task_id',
    key: 'task_id',
    scopedSlots: {
      customRender: 'task_id',
    },
  },
  {
    title: '用例ID',
    dataIndex: 'case_id',
    key: 'case_id',
    scopedSlots: { customRender: 'case_id' },
  },
  {
    title: '任务启动时间',
    dataIndex: 'task_run_time',
    key: 'task_run_time',
    scopedSlots: {customRender: "task_run_time"},
  },
  {
    title: '任务完成时间',
    dataIndex: 'task_run_done_time',
    key: 'task_run_done_time',
    scopedSlots: {customRender: "task_run_done_time"},
  },
  {
    title: '任务耗时',
    dataIndex: 'total_time',
    key: 'total_time',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  },
]
export default {
name: "CaseLogs",
      data() {
      return {
        queryInfo: {
          page: 1,
          pageSize: 10,
          caseId: this.caseId
        },
        total: 0,
        pageSizeOptions: ['10', '20', '30', '40'],
        caseLogsData: [],
        caseLogsColumns,
        caseId: '',
        visible: false,
        // 任务日志
        taskLogsData: '',
        // 用例执行状态
        caseSuccess: '',
        caseFailed: '',
        caseSkip: ''

      }
    },
  methods: {
    // 显示条数
    async onShowSizeChange(current, pageSize) {
      this.queryInfo.pageSize = pageSize;
      this.queryInfo.page = 1
      const res = await getCaseTask(this.queryInfo);
      this.caseLogsData = res.results;
      this.total = res.count;
    },
    // 翻页
    async onChange(pageNumber) {
      this.queryInfo.page = pageNumber
      const res = await getCaseTask(this.queryInfo);
      this.caseLogsData = res.results;
      this.total = res.count;
    },
    // 用例执行任务
    getCaseTaskList(caseId){
      getCaseTask(caseId).then(res => {
          this.caseLogsData = res.results;
          this.total = res.count;
      });
    },
    // 查看任务日志
    showTaskLogs(task_id){
      caseTaskLogs(task_id).then(res => {
        if (res.errcode === 0){
          this.taskLogsData = res.data
          this.caseSuccess = res.case_success
          this.caseFailed = res.case_failed
          this.caseSkip = res.case_skip
        }
      })
      this.visible = true;
    },
    onClose() {
      this.visible = false;
    },
  },
  mounted() {
    this.queryInfo.caseId = this.$route.query.caseId
    this.getCaseTaskList(this.queryInfo)
  },
  filters: {
    logFilter: function (logs) {
      logs = logs.toString()
      // let reg = new RegExp(/([E].*\\)([0-9].*.png$)/) //g全部
      let reg = new RegExp(/(.*\\)([0-9].*.png$)/) //g全部
      let re_result = logs.match(reg)

      if (re_result){
        let url = this.ENV.testImgURL
        let case_img_a = '<a target="_blank" href=' + url + re_result[2] + '>' + url + re_result[2] + '</a>'
        let newMsg = logs.replace(reg, case_img_a);
        return newMsg
      }else {
        // let success = '<span style="color: #87d068">执行成功</span>'
        // let newMsg = logs.replace('执行成功', success);
        let failed = '<span style="color: #ff0026">失败</span>'
        const newMsg = logs.replace('失败', failed);
        return newMsg
      }
    },

  }
}

</script>

<style scoped>

</style>
<template>
  <div id="ticket">
<!--  <div style="background-color: #F5F5F5; padding: 24px;">-->
    <a-page-header :ghost="false" title="返回" sub-title="工单详情" @back="() => $router.go(-1)">
      <a-skeleton active :loading="ticketLoading">
      <a-descriptions size="small" :column="3">
        <a-descriptions-item label="工单标题">{{data.name}}</a-descriptions-item>
        <a-descriptions-item label="工单编号">{{data.ticket_number}}</a-descriptions-item>

        <a-descriptions-item label="状态">
          <a-tag color="gray" v-if="data.state.state_type===0">{{data.state.state_type | fmtIsTicketRecord}}</a-tag>
          <a-tag color="green" v-else-if="data.state.state_type===1">{{data.state.state_type | fmtIsTicketRecord}}</a-tag>
          <a-tag color="blue" v-if="data.state.state_type===2">{{data.state.state_type | fmtIsTicketRecord}}</a-tag>
          <a-tag color="blue" v-else-if="data.state.state_type===3">{{data.state.state_type | fmtIsTicketRecord}}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="提交帐号">{{data.submit_account}}</a-descriptions-item>
        <a-descriptions-item label="提交时间">{{data.created_time | fmtTime}}</a-descriptions-item>
        <a-descriptions-item label="工单处理人">{{data.assign_to}}</a-descriptions-item>
      </a-descriptions>
      </a-skeleton>
    </a-page-header>

    <a-divider orientation="left">提交人</a-divider>
    <template>
       <a-skeleton active v-if="ticketDetail"/>
      <a-row type="flex" justify="start">
        <a-col :span="10">{{data.problem_content}}</a-col>
      </a-row>
      <br><br>
      <a v-if="ticket_files" :href="ticket_files.url" target="_blank">点击查看工单附件</a>
    </template>

    <a-divider orientation="right">处理人</a-divider>
      <a-row type="flex" justify="end">
        <a-col :span="10">{{data.result_desc}}</a-col>
      </a-row>
<!--  </div>-->
  </div>
</template>

<script>
import {ticketDetail} from '@/api/ticket'
export default {
  name: "Detail",
  data (){
    return {
      data: {
        state: {state_type: ''}
      },
      ticket_files: '',
      ticketLoading: true,
      ticketDetail: true,
    }
  },

  created() {
    this.getTicketQuery()
  },
  methods: {
    getTicketQuery(){
      ticketDetail({'ticketId': this.$route.query.ticketId}).then((resp) => {
        this.data = resp.results[0]
        this.ticket_files = JSON.parse(this.data.ticket_files)
        this.ticketLoading = false
        this.ticketDetail = false
      })
    }
  }
}
</script>

<style scoped>

</style>
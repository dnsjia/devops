<template>
  <div>
    <div style="padding: 10px 0; margin-top: -15px; margin-right: 10px">
      <a-radio-group :value="approvalStatus" @change="filterApprovalStatus">
         <col span="16">
        <a-radio-button value="large">全部 ({{this.all || 0}})</a-radio-button>
        <a-radio-button value="1">待审核 ({{this.one || 0}})</a-radio-button>
        <a-radio-button value="2">待发布 ({{this.two || 0}})</a-radio-button>
        <a-radio-button value="4">发布成功 ({{this.four || 0}})</a-radio-button>
        <a-radio-button value="5">发布异常 ({{this.five || 0}})</a-radio-button>
      </a-radio-group>
      <br><br>

      <div class="certain-category-search-wrapper" style="width: 220px; margin-top: -55px; float:right">
          <!--搜索-->
          <a-input-search placeholder="搜索" style="width: 200px" @search="onSearch"/>
      </div>
      <a-table :pagination="false" @showSizeChange="onShowSizeChange" :columns="columns" :dataSource="data" rowKey="id">

        <div class="float-right" style="padding: 10px 0;">
          <a-pagination size="md" :show-total="total => `共 ${total} 条数据`" v-model="current"
                        :page-size-options="pageSizeOptions"
                        :total=total
                        show-size-changer
                        :page-size="pageSize"
                        show-less-items align="right"
                        @showSizeChange="onShowSizeChange"
                        @change="onChange"
          >
            <template slot="buildOptionText" slot-scope="props">
              <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
              <span v-if="props.value === '50'">全部</span>
            </template>
          </a-pagination>
        </div>

        <span slot="action" slot-scope="id">
            <router-link :to="'deploy/detail?id=' + id.id"><span>查看</span></router-link>
            <a-divider type="vertical"/>
            <!--<router-link :to="'deploy/logs?id=' + id.id"><span>日志</span></router-link>-->
        </span>

        <span slot="status" slot-scope="status">
           <a-tag color="orange" v-if="status=== 1">{{status | fmtDeployStatus}}</a-tag>
           <a-tag color="cyan" v-else-if="status === 2">{{status | fmtDeployStatus}}</a-tag>
           <a-tag color="blue" v-else-if="status === 3">{{status | fmtDeployStatus}}</a-tag>
           <a-tag color="green" v-else-if="status === 4">{{status | fmtDeployStatus}}</a-tag>
           <a-tag color="red" v-else-if="status === 5">{{status | fmtDeployStatus}}</a-tag>
           <a-tag color="pink" v-else-if="status === 6">{{status | fmtDeployStatus}}</a-tag>
        </span>
        <span slot="created_time" slot-scope="created_time">{{created_time | fmtTime}}</span>
      </a-table>
    </div>

    <div class="float-right" style="padding: 10px 0;">
      <a-pagination size="md" :show-total="total => `共 ${total} 条数据`" v-model="current"
                    :page-size-options="pageSizeOptions"
                    :total=total
                    show-size-changer
                    :page-size="pageSize"
                    show-less-items align="right"
                    @showSizeChange="onShowSizeChange"
                    @change="onChange"
      >
        <template slot="buildOptionText" slot-scope="props">
          <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
          <span v-if="props.value === '50'">全部</span>
        </template>
      </a-pagination>
    </div>
   </div>
</template>

<script>
import {getApprovalList, searchApproval, countApprovalStatus} from "@/api/project/project";
const columns = [
  {
    title: '申请标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
      title: '审批人',
      dataIndex: 'approval_user',
      key: 'approval_user',
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: {customRender: "status"},
    key: 'status',
    filterMultiple: false,
    filters: [
      {
        text: '已拒绝',
        value: 6,
      },
      {
        text: '待审批',
        value: 1,
      },
      {
        text: '发布中',
        value: 3,
      },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: '申请人',
    dataIndex: 'submit_people',
    key: 'submit_people',
  },
  {
    title: '申请时间',
    dataIndex: 'created_time',
    scopedSlots: {customRender: "created_time"},
    key: 'created_time',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  },
];

export default {
  name: "Approval",

  data() {
    return {
      data: [],
      total: 0,
      // 定义审批状态字段, all(所有), one(待审核), two(已通过), four(部署成功), five(部署失败)
      all: 0,
      one: 0,
      two: 0,
      four: 0,
      five: 0,
      current: 1,
      pageSize: 10,
      columns,
      pageSizeOptions: ['10', '20', '30', '40'],
      // TODO large表示all
      approvalStatus: 'large',
      searchValue: '',
    }
  },
  created() {
    this.getApprovalList()
    this.countApprovalStatus()
  },
  methods: {
    // 根据升级包搜索部署单
    async onSearch(value) {
      const res = await getApprovalList({"keywords": value,});
      this.searchValue = value;
      this.data = res.results;
      this.total = res.count;
      this.current = 1
    },
    // 获取项目列表
    async getApprovalList() {
      //console.log('过滤审批单状态',)
      const res = await getApprovalList({
        // 审批单状态
        page: this.current,
        pageSize: this.pageSize
      });
      this.data = res.results;
      this.all = res.count
      this.total = res.count;
    },
    // 翻页
    async onChange(pageNumber) {
      if (this.searchValue) {
        const res = await getApprovalList({
          keywords: this.searchValue,
          page: pageNumber,
          pageSize: this.pageSize
        });
        this.data = res.results;
        this.total = res.count;
      }else {
        const res = await getApprovalList({
          page: pageNumber,
          pageSize: this.pageSize
        });
        this.data = res.results;
        this.total = res.count;
      }
    },
    // 显示条数
    async onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      if (this.searchValue) {
        const res = await getApprovalList({
          keywords: this.searchValue,
          // page: this.current,
          pageSize: this.pageSize,
        });
        this.data = res.results;
        this.total = res.count;
        this.current = 1
      } else {
        const res = await getApprovalList({
          keywords: this.searchValue,
          // page: this.current,
          pageSize: this.pageSize,

        });
        this.data = res.results;
        this.total = res.count;
        this.current = 1
      }
    },
    async filterApprovalStatus(e) {
      this.approvalStatus = e.target.value;
      const res = await getApprovalList({
        status: this.approvalStatus,
        page: this.current,
        pageSize: this.pageSize
      });
      this.data = res.results;
      this.total = res.count;

      if (this.approvalStatus === '1'){
        this.one = res.count;
      } if (this.approvalStatus === '2'){
        this.two = res.count
      } if (this.approvalStatus === '4'){
        this.four = res.count
      } if (this.approvalStatus === '5'){
        this.five = res.count
      }else {
        this.other = res.results
      }
   },
  //  统计部署单状态
    async countApprovalStatus() {
      const res = await countApprovalStatus()
      if (res.errcode===0){
        this.one = res.data.pending
        this.two = res.data.to_be_released
        this.four = res.data.deploy_successful
        this.five = res.data.deploy_failure
      }
    }
  }
}
</script>

<style scoped>

</style>
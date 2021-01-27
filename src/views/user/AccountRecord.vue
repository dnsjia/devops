<template>
  <div>
    <a-button type="primary" @click="DB">DB申请记录</a-button>
    <p></p>
    <a-table :pagination="false" @showSizeChange="onShowSizeChange" :columns="columns" :dataSource="data" rowKey="id">

      <span slot="status" slot-scope="status">
        <a-tag color="green" v-if="status===0">{{status | fmtIsAccountRecord}}</a-tag>
        <a-tag color="red" v-else-if="status===1">{{status | fmtIsAccountRecord}}</a-tag>
        <a-tag color="blue" v-else-if="status===2">{{status | fmtIsAccountRecord}}</a-tag>
      </span>

      <span slot="action" slot-scope="{id, status}">
        <a-divider type="vertical"/>
            <a-button type="primary" @click="Agree(id)" v-if="status==2">同意</a-button>

        <a-divider type="vertical"/>
          <a-button type="danger" @click="Refuse(id)" v-if="status==2">拒绝</a-button>
      </span>
        <!--solt插槽-->
      <span slot="created_time" slot-scope="created_time">{{created_time | fmtTime}}</span>
    </a-table>

    <div class="float-right" style="padding: 10px 0;">
        <a-pagination size="md" :show-total="total => `共 ${total} 条数据`" v-model="current"
                      :page-size-options="pageSizeOptions"
                      :total="total"
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

    <a-modal v-model="dbVisible" :footer="null" title="DB申请记录" :destroyOnClose="true" :keyboard="false" :maskClosable="false" width="940px">
        <a-skeleton :loading="dbLoding" active>
          <a-table style="padding: 10px 0; margin-top: -32px; margin-left: -16px; margin-right: -16px" :columns="dbColumns"  :loading="false" :showHeader="true" :pagination="false" :data-source="dbData"  rowKey="id">

          <span slot="status_db" slot-scope="status_db">
            <a-tag color="green" v-if="status_db===0">{{ status_db | fmtDbStatus }}</a-tag>
            <a-tag color="red" v-else-if="status_db===1">{{ status_db | fmtDbStatus }}</a-tag>
            <a-tag color="blue" v-else-if="status_db===2">{{ status_db | fmtDbStatus }}</a-tag>
          </span>

          <span slot="db_create_time" slot-scope="db_create_time">{{db_create_time | fmtTime}}</span>

          <span slot="dbAction" slot-scope="{id, status}">
                <a-button type="primary" @click="dbAgree(id)" v-if="status==2">同意</a-button>

            <a-divider type="vertical"/>
              <a-button type="danger" @click="dbRefuse(id)" v-if="status==2">拒绝</a-button>
          </span>
          </a-table>
        </a-skeleton>

    </a-modal>

  </div>

</template>


<script>
import {accountRecord, accountRefuse, accountAgree} from '@/api/user'
import {dbRecord, dbRecordAgree, dbRecordRefuse} from '@/api/database'

const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '账号类型',
    dataIndex: 'account_zh_desc',
    key: 'account_zh_desc',
  },
  {
    title: '账号名称',
    dataIndex: 'account_name',
    key: 'account_name',
  },
  {
    title: '申请人',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '申请时间',
    dataIndex: 'created_time',
    scopedSlots: {customRender: "created_time"},
    key: 'created_time',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    scopedSlots: {customRender: 'status'},
    filterMultiple: false,
    filters: [
      {
        text: '已同意',
        value: 0,
      },
      {
        text: '审核中',
        value: 2,
      },
      {
        text: '已拒绝',
        value: 1,
      },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: '申请原因',
    dataIndex: 'reasons',
    key: 'reasons',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  },
];
const dbColumns = [
  {
    title: '环境',
    dataIndex: 'env_name',
    key: 'env_name',
  },
  {
    title: 'DB名称',
    dataIndex: 'database_name',
    key: 'database_name',
  },
  {
    title: '权限',
    dataIndex: 'permissions',
    key: 'permissions',
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: {customRender: "status_db"},
    key: 'status',
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
    key: 'applicant',
  },
  {
    title: '申请时间',
    dataIndex: 'create_time',
    scopedSlots: {customRender: "db_create_time"},
    key: 'create_time',
  },
  {
    title: '操作',
    key: 'dbAction',
    scopedSlots: {customRender: 'dbAction'},
  },
];
export default {
  beforeCreate() {
    // this.form = this.$form.createForm(this, {name: 'addNginx'});
  },
  data() {
    return {
      data: [],
      columns,
      // formItemLayout,
      total: 0,
      current: 1,
      pageSize: 10,
      pageSizeOptions: ['10', '20', '30', '40'],
      // db 相关
      dbVisible: false,
      dbLoding: false,
      dbColumns,
      dbData: [],
      dbTotal: 0,
      dbCurrent: 1,
      // status: '',
    };
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取用户账号申请记录列表
    async getList() {
      const res = await accountRecord({});
      this.data = res.results;
      this.total = res.count;
    },
    // 翻页
    async onChange(pageNumber) {
      const res = await accountRecord({
        page: pageNumber,
        pageSize: this.pageSize
      });
      this.data = res.results;
      this.total = res.count;
    },
    // 显示条数
    async onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      const res = await accountRecord({
        // page: this.current,
        pageSize: this.pageSize,

      });
      this.data = res.results;
      this.total = res.count;
      this.current = 1
    },
    Refuse(id) {
      accountRefuse({'id':id}).then((resp) => {
        if (resp.errcode === 0){
          this.$msgsuccess(resp.msg)
          this.getList()
        }else{
          this.$msgerror(resp.msg)
        }
      })
    },
    Agree(id){
      accountAgree({'id': id}).then((resp) => {
        if (resp.errcode === 0){
          this.$msgsuccess(resp.msg)
          this.getList()
        }else{
          this.$msgerror(resp.msg)
        }
      })
    },
    DB(){
      this.getDbList()
      this.dbVisible = true
    },
    getDbList() {
      dbRecord().then((resp) => {
        this.dbData = resp.results;
        this.dbTotal = resp.count;
      })
    },
    dbRefuse(id) {
      dbRecordRefuse({'id':id, 'status':'refuse'}).then((resp) => {
        if (resp.errcode === 0){
          this.$msgsuccess(resp.msg)
          this.getDbList()
        }else{
          this.$msgerror(resp.msg)
        }
      })
    },
    dbAgree(id){
      dbRecordAgree({'id': id, 'status': 'agree'}).then((resp) => {
        if (resp.errcode === 0){
          this.$msgsuccess(resp.msg)
          this.getDbList()
        }else{
          this.$msgerror(resp.msg)
        }
      })
    },

  }
};

</script>


<style scoped lang="scss">
#inputNumberPort {
  width: 100px;
}

</style>
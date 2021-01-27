<template>
  <div>
    <a-button type="primary" @click="submitTicketModel">提交工单</a-button>
    <br>
      <a-modal title="提交工单" :visible="visible" :confirm-loading="submitTicketConfirmLoading"
               okText="提交"
                cancelText="取消"
                @ok="submitTicketHandleOk"
                @cancel="submitTicketHandleCancel"
      >
        <a-form-model ref="ruleForm" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-model-item ref="name" label="工单标题" prop="name" style="width: 130%">
            <a-input v-model="form.name"
              @blur="
                () => {
                  $refs.name.onFieldBlur();
                }
              "
            />
          </a-form-model-item>

          <a-form-model-item label="工单类型" prop="region" style="width: 130%">
            <a-select v-model="form.region" placeholder="请选择工单类型">
              <a-select-option v-for="tickettype in ticketTypes"
                               :key="tickettype.ticket_type"
                               :value="tickettype.ticket_type">{{ tickettype.ticket_type }}
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item label="问题描述" prop="desc" style="width: 130%">
            <a-input v-model="form.desc" type="textarea" style="height: 150px"/>
          </a-form-model-item>

          <a-upload-dragger name="file" :multiple="false"
                            action="/api/v1/Upload"
                            @change="TicketUploadFileChange"
          >
            <p class="ant-upload-drag-icon">
              <a-icon type="inbox" />
            </p>
            <p class="ant-upload-text">点击或拖动文件到此区域上传附件</p>
            <p class="ant-upload-hint">温馨提示：最多只支持上传一个附件, 如果有多个则取第一个附件</p>
          </a-upload-dragger>

        </a-form-model>
      </a-modal>
    <br>
    <a-table :pagination="false" :columns="columns" :dataSource="data" rowKey="id">

      <span slot="state" slot-scope="state">
        <a-tag color="gray" v-if="state.state_type==0">{{state.state_type | fmtIsTicketRecord}}</a-tag>
        <a-tag color="#1890ff" v-else-if="state.state_type===1">{{state.state_type | fmtIsTicketRecord}}</a-tag>
        <a-tag color="blue" v-else-if="state.state_type===2">{{state.state_type | fmtIsTicketRecord}}</a-tag>
        <a-tag color="green" v-else-if="state.state_type===3">{{state.state_type | fmtIsTicketRecord}}</a-tag>

      </span>

      <span slot="action" slot-scope="id">
        <a-divider type="vertical"/>
        <router-link id="ticketDetail" :to="{path: '/ticket/detail', query:{ticketId: id.ticket_number}}">查看</router-link>
      </span>

      <span slot="created_time" slot-scope="created_time">{{ created_time | fmtTime }}</span>
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
  </div>

</template>


<script>
import {ticketList, ticketType, ticket} from '@/api/ticket'

const columns = [
  {
    title: '工单编号',
    dataIndex: 'ticket_number',
    key: 'ticket_number',
  },
  {
    title: '工单标题',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '工单类型',
    dataIndex: 'ticket_type.ticket_type',
    key: 'ticket_type.ticket_type',
  },
  {
    title: '提交人',
    dataIndex: 'submit_account',
    key: 'submit_account',
  },
  {
    title: '提交时间',
    dataIndex: 'created_time',
    key: 'created_time',
    scopedSlots: {customRender: "created_time"},
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'state',
    scopedSlots: {customRender: "state"},
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  },
];

export default {
  beforeCreate() {
    // this.form = this.$form.createForm(this, {name: 'addNginx'});
  },
  data() {
    return {
      data: [],
      total: 0,
      current: 1,
      pageSize: 10,
      columns,
      pageSizeOptions: ['10', '20', '30', '40'],
      // 工单附件
      ticketFile: [],
      // 工单提交时异步加载
      submitTicketConfirmLoading: false,
      // ticket type
      ticketTypes: null,
      // submit ticket model
      visible: false,
      confirmLoading: false,
      // from model
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      other: '',
      form: {
        name: '',
        region: undefined,
        delivery: false,
        desc: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入工单标题', trigger: 'blur' },
          { min: 5, max: 112, message: '标题长度范围5-112', trigger: 'blur' },
        ],
        region: [{ required: true, message: '请选择工单类型', trigger: 'change' }],

        desc: [{ required: true, message: '请输入问题描述', trigger: 'blur' }],
      },

    };
  },

  created() {
    this.ticketList()

  },
  mounted() {
    this.getTicketTypeList()
  },
  methods: {
    // 获取工单列表
    async ticketList() {
      const res = await ticketList({
        page: this.current,
        pageSize: this.pageSize
      });
      this.data = res.results;
      this.total = res.count;
    },
    // // 翻页
    // onShowSizeChange(current, pageSize) {
    //   this.pageSize = pageSize;
    // },
    // 翻页
    async onChange(pageNumber) {
      const res = await ticketList({
        page: pageNumber,
        pageSize: this.pageSize
      });
      this.data = res.results;
      this.total = res.count;
    },
    // 显示条数
    async onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      const res = await ticketList({
        // page: this.current,
        pageSize: this.pageSize,
      });
      this.data = res.results;
      this.total = res.count;
      this.current = 1
    },
    submitTicketModel() {
      this.visible = true;
    },
    // 工单附件上传
    TicketUploadFileChange(info) {
      const status = info.file.status;
      if (status !== 'uploading') {
        this.ticketFile = info.fileList[0]['response']
      }
      if (status === 'done') {
        this.$msgsuccess(`${info.file.name} 文件上传成功`);

      } else if (status === 'error') {
        this.$msgerror(`${info.file.name} 文件上传失败！`);
      }
    },
    // 工单问题分类
    getTicketTypeList() {
      ticketType({}).then((resp) => {
        this.ticketTypes = resp.results
      })
    },
    // 提交工单
    submitTicketHandleOk(){
     this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.confirmLoading = true;
          ticket({'ticketTitle': this.form.name, 'ticketDesc': this.form.desc,
            'ticketType': this.form.region, 'ticketFile': this.ticketFile}).then((resp) => {
             if (resp.errcode === 0){
               this.$msgsuccess(resp.msg)
               this.submitTicketHandleCancel()
               this.ticketList()
             }else {
               this.$msgerror(resp.msg)
             }
          })
        } else {
          // 校验未通过
          return false;
        }
      });

    },
    // 关闭Model 框
    submitTicketHandleCancel(){
      this.$refs.ruleForm.resetFields();
      this.visible = false;
    }

  },
};

</script>




<style scoped>

</style>
<template>
  <div>
    <div style="padding: 10px 0; margin-top: -10px">
      <a-button type="primary" icon="plus" @click="visible=true">添加规则</a-button>

      <a-modal v-model="visible" cancelText="取消" okText="保存" title="新增灰度规则" :afterClose="form.resetFields" @ok="addGrayOk" @cancel="edithandleCancel">

        <a-form-model ref="ruleForm" :model="form" :rules="rules" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">

          <a-form-item v-bind="formItemLayout" label="灰度域名" has-feedback>
            <a-select style="width: 100%" @change="grayDomainHandleChange" placeholder="请选择灰度域名">
              <a-select-option v-for="i in getGrayDomailData" :key="i.domain_name" v-mode="chanGeGrayDomain">{{i.domain_name}} </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item v-bind="formItemLayout" has-feedback>
            <span slot="label">灰度策略&nbsp;</span>
            <a-select style="width: 100%" @change="grayRuleHandleChange" placeholder="请选择灰度策略">
              <a-select-option v-for="grayType in grayRuleList" :key="grayType.name" v-mode="chanGeGrayRule">{{ grayType.name }}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-model-item label="灰度规则：" prop="grayRule"><a-input v-model="form.grayRule" :placeholder="grayRuleTips" type="text"/></a-form-model-item>

        </a-form-model>
      </a-modal>

    </div>


    <a-table :pagination="false" :columns="columns" :dataSource="data" rowKey="id">

    <span slot="customTitle"><a-ion type="smile-o"/> 外网端口</span>

        <span slot="action" slot-scope="id">

          <a-divider type="vertical"/>
          <a-button type="danger" @click="delGrayRule(id)">删除</a-button>
        </span>

        <span slot="created_time" slot-scope="created_time">{{ created_time | fmtTime }}</span>
    </a-table>

    <div class="float-right" style="padding: 10px 0;">

    </div>
  </div>

</template>


<script>
import {getList, getGrayDomainList, addGrayRule, delGrayRule} from '@/api/gray'

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
    title: '灰度域名',
    dataIndex: 'gray_domain.domain_name',
    key: 'gray_domain.domain_name',
  },
  {
    title: '灰度类型',
    dataIndex: 'gray_type',
    key: 'gray_type',
    filterMultiple: false,
    filters: [
      {
        text: 'IP',
        value: 'IP',
      },
      {
        text: 'Cookie',
        value: 'Cookie',
      },
      {
        text: 'UserAgent',
        value: 'UserAgent',
      },
    ],
    onFilter: (value, record) => record.gray_type.indexOf(value) === 0,
  },
  {
    title: '匹配KEY',
    dataIndex: 'match_key',
    key: 'match_key',
  },
  {
    title: '匹配VALUE',
    dataIndex: 'match_value',
    key: 'match_value',
  },
  {
    title: '创建人',
    dataIndex: 'creator_name',
    key: 'creator_name',
  },
  {
    title: '创建时间',
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
  beforeCreate() {
    // this.form = this.$form.createForm(this, {name: 'addNginx'});
  },
  data() {
    return {
      visible: false,
      data: [],
      columns,
      formItemLayout,
      getGrayDomailData: [{'domanin_name': ''}],
      form: {
        grayRule: '',
      },
      rules: {
        grayRule: [{ required: true, message: '规则不能为空', trigger: 'blur' }],
      },
      // 灰度规则库
      grayRuleList: [
        {id: 1, name: 'IP'},
        {id: 2, name: 'Cookie'},
        {id: 3, name: 'UserAgent'},
      ],
      chanGeGrayDomain: null,
      chanGeGrayRule: null,
      grayRuleTips: '请输入灰度规则',
    };
  },

  created() {
    this.getList()
    this.grayDomainList()
  },

  methods: {
    // 获取灰度规则列表
    async getList() {
      const res = await getList({});
      this.data = res.results;
      this.total = res.count;

    },
    grayDomainList(){
    getGrayDomainList({}).then((resp) => {
       this.getGrayDomailData = resp.results
    })
      },
    grayRuleHandleChange(value){
      this.$refs.ruleForm.resetFields();
      this.chanGeGrayRule = value
      if (value == "IP"){
        this.grayRuleTips = "示例：223.5.5.5"
      }else if (value == "Cookie"){
        this.grayRuleTips = "示例：Code=pigs"
      }else if (value == "UserAgent"){
        this.grayRuleTips = "示例：pigs"
      }
    },
    grayDomainHandleChange(value){
      this.$refs.ruleForm.resetFields();
      this.chanGeGrayDomain = value
    },

    addGrayOk() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.chanGeGrayDomain == null){
            this.$msgerror("请选择灰度域名",this.chanGeGrayDomain)
          }else if (this.chanGeGrayRule == null){
            this.$msgerror("请选择灰度策略",this.chanGeGrayRule)
          } else {
            addGrayRule({domain: this.chanGeGrayDomain, rulesType:this.chanGeGrayRule, grayContent:this.form.grayRule}).then(resp => {
              if (resp.errcode === 0){
                this.visible = false
                this.$msgsuccess(resp.msg)
                this.$refs.ruleForm.resetFields();
                this.getList()
              } else {
                this.$msgerror(resp.msg)
              }
            })
          }
        } else {
          return false;
        }
      });
    },
    edithandleCancel(){
      this.$refs.ruleForm.resetFields();
    },
    delGrayRule(id){
      const _this = this;
      this.$confirm({
        title: '确定要删除该条灰度规则吗?',
        content: '注意：删除后灰度流量将不再进入！',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
          delGrayRule({"id": id.id, "gray_domain": id.gray_domain.domain_name, "gray_type": id.gray_type, "match_key": id.match_key}).then(resp => {
            if (resp.errcode === 0){
              _this.$msgsuccess(resp.msg)
              _this.getList()
            }else {
              _this.$msgerror(resp.msg)
            }
            })
        },
        onCancel() {
          console.log('Cancel');
        },
      });

    }

  }
};

</script>


<style scoped lang="scss">
#inputNumberPort {
  width: 100px;
}

</style>
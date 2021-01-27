<template>
  <div>
      <div style="padding: 10px 0; margin-top: -10px">
          <a-button type="primary" icon="plus" @click="visible=true">添加主机</a-button>
          <div class="certain-category-search-wrapper" style="width: 220px; margin-top: -6px; float:right">
              <a-input-search placeholder="搜索" style="width: 200px" @search="onSearch"/>
          </div>

          <a-modal v-model="visible" cancelText="取消" okText="保存" title="新增主机"
                   :afterClose="form.resetFields"
                   @ok="addVirtualHost">
              <a-form :form="form"
                      :label-col="formItemLayout.labelCol"
                      :wrapper-col="formItemLayout.wrapperCol"
              >

                  <a-form-item v-bind="formItemLayout" label="外网端口" has-feedback>
                      <a-input placeholder="1000~1200" style="width: 100%" v-decorator="[
                      'internet_port',
                        {
                          rules: [{ required: true, message: '请输入外网端口', whitespace: true },{pattern: /^([0-9]+){4}$/, message: '请输入正确的端口号'}],
                        },
                      ]"/>
                  </a-form-item>

                  <a-form-item v-bind="formItemLayout" has-feedback>
                    <span slot="label">名称&nbsp;
                      <a-tooltip title="应用名称, 不能含有中文" validate-status="success">
                        <a-icon type="question-circle-o"/>
                      </a-tooltip>
                    </span>
                      <a-input placeholder="flyby-hotel" v-decorator="[
                     'upstream_name',
                        {
                          rules: [{ required: true, message: '请输入应用名称', whitespace: true }],
                        },
                      ]"
                      />
                  </a-form-item>

                  <a-form-item v-bind="formItemLayout" label="转发地址" has-feedback>
                      <a-input placeholder="127.0.0.1" v-decorator="[
                     'forward_address',
                        {
                          rules: [{ required: true, message: '请输入转发地址', whitespace: true } ,{pattern:  /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/, message: '请输入正确的转发地址'}],
                        },
                      ]"/>
                  </a-form-item>

                  <a-form-item label="端口" has-feedback>
                      <a-input placeholder="80" v-decorator="[
                     'port',
                        {
                          rules: [{ required: true, message: '端口号不能为空', whitespace: true },{pattern: /^(([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5]))$/, message: '请输入正确的端口号'}],
                        },
                      ]"/>
                  </a-form-item>

                  <a-form-item label="备注" has-feedback>
                      <a-input placeholder="酒店接口转发" v-decorator="[
                     'remarks',
                        {
                          rules: [{ required: true, message: '备注不能为空', whitespace: true }],
                        },
                      ]"/>
                  </a-form-item>
              </a-form>
          </a-modal>
      </div>
      <a-table :pagination="false" @showSizeChange="onShowSizeChange" :columns="columns" :dataSource="data" rowKey="id">

  <span slot="customTitle">
      <a-ion type="smile-o"/> 外网端口</span>
          <span slot="action" slot-scope="id">
              <a-button type="primary" icon="edit" @click="editVirtualHostModel(id)">编辑</a-button>

          <a-divider type="vertical"/>
              <a-button type="danger" icon="delete" @click="delVirtualHost(id)">删除</a-button>
          </span>

          <span slot="create_time" slot-scope="create_time">{{create_time | fmtTime}}</span>
      </a-table>

      <a-modal :visible="editVisible2" cancelText="取消" okText="保存" title="更新主机"
               :confirm-loading="editConfirmLoading"
               @ok="edithandleOk('editRuleFormData')"
               @cancel="edithandleCancel">

          <a-form-model ref="editRuleFormData" :model="editRuleFormData" :rules="editRules" v-bind="layout">
              <a-form-model-item label="后端IP" prop="ip">
                  <a-input v-model="editRuleFormData.ip"/>
              </a-form-model-item>

              <a-form-model-item label="端口" prop="port">
                  <a-input v-model.number="editRuleFormData.port" :min="80" :max="65535" type="number"/>
              </a-form-model-item>

              <a-form-model-item label="备注" prop="remarks">
                  <a-input v-model="editRuleFormData.remarks"/>
              </a-form-model-item>

          </a-form-model>

      </a-modal>

      <div class="float-right" style="padding: 10px 0;">
          <a-pagination size="md"
                        :show-total="total => `共 ${total} 条数据`"
                        v-model="current"
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
import {getList, addVirtualHost, delVirtualHost, searchVirtualHost, editVirtualHost} from '@/api/nginx'
const formItemLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 20},
};

const columns = [
    {
        title: '名称',
        dataIndex: 'upstream_name',
        key: 'upstream_name',
    },
    {
        title: '外网端口',
        dataIndex: 'internet_port',
        key: 'internet_port',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.internet_port - b.internet_port,
    },
    {
        title: '转发地址',
        dataIndex: 'forward_address',
        key: 'forward_address',
    },
    {
        title: '端口',
        dataIndex: 'port',
        key: 'port',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.port - b.port,
    },
    {
        title: '备注',
        dataIndex: 'remarks',
        key: 'remarks',
    },

    {
        title: '创建人',
        dataIndex: 'creator_name',
        key: 'creator_name',
    },
    {
        title: '创建时间',
        dataIndex: 'create_time',
        scopedSlots: {customRender: "create_time"},
        key: 'create_time',
    },
    {
        title: '操作',
        key: 'action',
        scopedSlots: {customRender: 'action'},
    },
];

export default {
  beforeCreate() {
    this.form = this.$form.createForm(this, {name: 'addNginx'});
  },
  // 删除数据, 页面重新reload
  inject: ['reload'],
  data() {
    var checkPending;
    const port = (rule, value, callback) => {
      clearTimeout(checkPending);
      if (!value) {
        return callback(new Error('请输入端口号'));
      }
      checkPending = setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('端口只能是数字'));
        }else {
          if (String(value) < 80 || String(value) > 65535) {
            callback(new Error('端口范围80-65535'));
          } else {
            callback();
          }
        }
      }, 1000);
    };
    const remarks = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('备注不能为空'));
      } else {
        callback();
      }
    };
    const ip = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('后端IP不能为空'));
      } else {
        callback();
      }
    };
    return {
      visible: false,
      editVisible2: false,
      editConfirmLoading: false,
      modalTitle: '新增主机',
      data: [],
      total: 0,
      current: 1,
      pageSize: 10,
      columns,
      formItemLayout,
      pageSizeOptions: ['10', '20', '30', '40'],
      modal1Visible: false,
      searchValue: '',
      editRules: {
        port: [{validator: port, trigger: 'change'}],
        ip: [{validator: ip, trigger: 'change'}],
        remarks: [{validator: remarks, trigger: 'change'}],
      },
      layout: {
        labelCol: {span: 4},
        wrapperCol: {span: 20},
      },
      editRuleFormData: {
        port: '',
        ip: '',
        remarks: '',
      },
    };
  },
  created() {
    this.getList()
  },
  methods: {
    editVirtualHostModel(id) {
      this.editVisible2 = true;
      this.editRuleFormData.ip = id.forward_address
      this.editRuleFormData.port = id.port
      this.editRuleFormData.remarks = id.remarks
      this.editRuleFormData.vhostId = id.id
      this.editRuleFormData.upstream_name = id.upstream_name
      this.editRuleFormData.internet_port = id.internet_port
    },
    // 编辑主机
    edithandleOk(editRuleFormData) {
      this.$refs.editRuleFormData.validate(valid => {
        if (valid) {
          const upstream_name = this.editRuleFormData.upstream_name
          const internet_port = this.editRuleFormData.internet_port
          const id = this.editRuleFormData.vhostId;
          const forward_address = this.editRuleFormData.ip;
          const remarks = this.editRuleFormData.remarks
          const port = this.editRuleFormData.port
          editVirtualHost({
            'id': id, 'forward_address': forward_address,
            'remarks': remarks, 'internet_port': internet_port,
            'upstream_name': upstream_name, 'port': port}).then((resp) => {
            if (resp.errcode === 0) {
              this.$msgsuccess(resp.msg)
              this.editVisible2 = false
              this.getList();
            } else {
              this.$msgerror(resp.msg)
            }
          })
        }else {
          console.log('error submit!!');
        }
      });
    },
    edithandleCancel(e) {
      // 重置form 校验提示信息
      this.$refs.editRuleFormData.resetFields();
      this.editVisible2 = false;
    },
    // 主机搜索
    async onSearch(value) {
      const res = await searchVirtualHost({"keywords": value,});
      this.searchValue = value;
      this.data = res.results;
      this.total = res.count;
      this.current = 1
    },
    // 获取虚拟主机列表
    async getList() {
      const res = await getList({
          page: this.current,
          pageSize: this.pageSize
      });
      this.data = res.results;
      this.total = res.count;
    },
    // 翻页
    async onChange(pageNumber) {
      if (this.searchValue) {
        const res = await getList({
            keywords: this.searchValue,
            page: pageNumber,
            pageSize: this.pageSize
        });
        this.data = res.results;
        this.total = res.count;
      }else {
        const res = await getList({
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
        const res = await getList({
          keywords: this.searchValue,
          // page: this.current,
          pageSize: this.pageSize,
        });
        this.data = res.results;
        this.total = res.count;
        this.current = 1
      } else {
        const res = await getList({
            keywords: this.searchValue,
            // page: this.current,
            pageSize: this.pageSize,
        });
        this.data = res.results;
        this.total = res.count;
        this.current = 1
      }
    },
    // 添加主机
    addVirtualHost() {
      this.form.validateFieldsAndScroll(async (err, values) => {
        if (!err) {
          const success = await addVirtualHost(values);
          if (success.errcode === 0) {
            this.$msgsuccess(success.msg);
            // 关闭模态框
            this.visible = false;
            this.getList();
          } else {
            this.$msgerror(success.msg)
          }
        }
      });
    },
    // 删除虚拟主机
    delVirtualHost(id) {
      this.$msgconfirm("删除后将无法恢复, 确定删除?", async () => {
        const success = await delVirtualHost({'id': id.id});
        // data={"msg": , "code":, "data": }
        if (success) {
          this.$msgsuccess(success.msg);
          // 删除成功，重新刷新页面
          // this.getList();
          this.reload()
        } else {
          this.$msgerror(success.msg)
        }
      });
    },
  }
};

</script>


<style scoped lang="scss">
#inputNumberPort {
  width: 100px;
}

</style>
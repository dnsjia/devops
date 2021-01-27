<template>

  <div>
    <a-button type="primary" @click="showModal">添加用例</a-button>
    <br>
    <a-modal v-model="visible" title="添加用例" @ok="handleOk" @cancel="resetForm" cancelText="取消" okText="保存">
      <a-form-model
          ref="ruleForm"
          :model="form"
          :rules="rules"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
      >
        <a-form-model-item ref="name" label="用例名称" prop="name">
          <a-input
              v-model="form.name"
              @blur="
              () => {
                $refs.name.onFieldBlur();
              }
            "
              placeholder="请输入用例名称"
              style="left: 24px;width:90%"/>
        </a-form-model-item>
        <a-form-model-item label="浏览器" prop="browser">
          <a-tooltip title="仅支持谷歌、火狐浏览器">
            <a-icon type="question-circle-o" style="color: rgba(0,0,0,.45)"/>
          </a-tooltip>
          <a-select v-model="form.browser" placeholder="请选择浏览器" style="left: 10px;width:90%">
            <a-select-option value="Google Chrome">
              Google Chrome
            </a-select-option>
            <a-select-option value="FireFox">
              FireFox
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item ref="url" label="测试URL" prop="url">
          <a-tooltip title="以http://或者https://开头">
            <a-icon type="question-circle-o" style="color: rgba(0,0,0,.45)"/>
          </a-tooltip>
          <a-input
              v-model="form.url"
              @blur="
              () => {
                $refs.url.onFieldBlur();
              }
            "
              placeholder="请输入测试域名"
              style="left: 10px;width:90%">

          </a-input>
        </a-form-model-item>
        <a-form-model-item ref="loop" label="循环次数" prop="loop">

          <a-tooltip title="用例执行的次数">
            <a-icon type="question-circle-o" style="color: rgba(0,0,0,.45)"/>
          </a-tooltip>
          <a-input-number id="inputNumber" v-model="form.loop" :min="1" :max="5" :defaultValue="1"
                          style="left: 10px;width:90%"/>
        </a-form-model-item>

        <a-form-model-item ref="url" label="运行模块" prop="run_models">
          <a-tooltip title="用例的模块名称,如不确定请填写：全部">
            <a-icon type="question-circle-o" style="color: rgba(0,0,0,.45)"/>
          </a-tooltip>
          <a-input
              v-model="form.run_models"
              @blur="
              () => {
                $refs.url.onFieldBlur();
              }
            "
              placeholder="请输入用例运行模块名称"
              style="left: 10px;width:90%"/>
        </a-form-model-item>

        <a-form-model-item label="测试用例">
          <a-upload
              action="/api/v1/caseUpload"
              :multiple="false"
              :file-list="fileList"
              @change="handleChange"
          >
            <a-button>
              <a-icon type="upload"/>
              上传用例
            </a-button>
          </a-upload>
        </a-form-model-item>

        <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">

        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-table :columns="testCaseColumns" :data-source="testCaseData" :pagination="false"
             @showSizeChange="onShowSizeChange" :scroll="{ x: 1500, y: 600 }">
      <template slot="ip" slot-scope="ip">
        <a :href="ip" target="_blank">{{ ip }}</a>
      </template>

      <span slot="create_time" slot-scope="create_time">{{ create_time | fmtTime }}</span>
      <span slot="action" slot-scope="action, id">
      <a @click="runTestCase(id)">执行</a><a-divider type="vertical"/><a @click="caseTask(id)">日志</a>
  </span>

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
  </div>

</template>

<script>
import {addCase, caseAll, runCase} from '@/api/testcase'

const testCaseColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'case_id',
    scopedSlots: {customRender: 'id',},
    fixed: 'left',
    width: 80,
  },
  {
    title: '用例名称',
    dataIndex: 'test_name',
    key: 'test_name',
    scopedSlots: {customRender: 'test_name'},
    fixed: 'left',
    width: 180,
  },
  {
    title: '测试地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 200,
    scopedSlots: {customRender: 'ip'},
  },
  {
    title: '浏览器',
    dataIndex: 'browser',
    key: 'browser',
    width: 100
  },
  {
    title: '循环次数',
    dataIndex: 'loop',
    key: 'loop',
    width: 100
  },
  {
    title: '运行模块',
    dataIndex: 'run_models',
    key: 'run_models',
    width: 100
  },
  {
    title: '用例表',
    dataIndex: 'import_address',
    key: 'import_address',
    width: 350
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    scopedSlots: {customRender: "create_time"},
    width: 190
  },
  {
    title: '创建人',
    dataIndex: 'create_name',
    key: 'create_name',
    //width: 150
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
    fixed: 'right',
    width: 120,
  },
]
export default {
  name: "Case",
  data() {
    let isTrueUrl = (rule, value, callback) => {
      let reg = /(https?|http):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/
      if (!reg.test(value)) {
        callback(new Error('请输入正确的URL链接'))
      } else {
        callback()
      }
    }
    return {
      fileList: [],
      visible: false,
      labelCol: {span: 4},
      wrapperCol: {span: 14},
      // 测试用例文件
      caseFile: '',
      queryInfo: {
        page: 1,
        pageSize: 10,
      },
      total: 0,
      pageSizeOptions: ['10', '20', '30', '40'],
      testCaseData: [],
      testCaseColumns,

      form: {
        name: '',
        browser: undefined,
        delivery: false,
        url: '',
        loop: 1,
        run_models: '',
      },
      rules: {
        name: [
          {required: true, message: '请输入用例名称', trigger: 'blur'},
          {min: 3, max: 20, message: '用例名称长度范围3~20', trigger: 'blur'},
        ],
        browser: [{required: true, message: '请选择浏览器', trigger: 'change'}],
        url: [
          {required: true, message: '请输入测试URL', trigger: 'blur'},
          {min: 3, max: 50, message: 'url长度范围3~50', trigger: 'blur'},
          { validator: isTrueUrl, trigger: 'blur' }
        ],
        run_models: [
          {required: true, message: '请输入用例模块,如不确定请输入：全部', trigger: 'blur'},
          {min: 2, max: 10, message: '用例模块范围2~10', trigger: 'blur'},
        ],
      },
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      const _this = this
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.caseFile === '' || this.caseFile === null) {
            this.$msgerror('请上传测试用例')
            return
          }
          addCase({
            'case_name': _this.form.name,
            'case_url': _this.form.url,
            'case_browser': _this.form.browser,
            'case_loop': _this.form.loop,
            'case_module': _this.form.run_models,
            'case_file': _this.caseFile
          }).then((resp) => {
            if (resp.errcode === 0) {
              this.$msgsuccess(resp.msg)
              this.$refs.ruleForm.resetFields();
              this.visible = false
              this.getCaseList();
            } else {
              this.$msgerror(resp.msg)
            }
          });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
      //console.log(e);
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },

    handleChange(info) {
      const status = info.file.status;
      if (status !== 'uploading') {
      }
      if (status === 'done') {
        if (info.file.response.errcode !== 0) {
          this.$msgerror(info.file.response.msg)
          return
        } else if (info.file.response.errcode === 0) {
          this.caseFile = info.file.response.data.case_file
          this.$msgsuccess(`${info.file.name} 文件上传成功`);
        }
      } else if (status === 'error') {
        this.$msgerror(`${info.file.name} 文件上传失败`);
      }
      let fileList = [...info.fileList];
      fileList = fileList.slice(-1);
      fileList = fileList.map(file => {
        if (file.response) {
          file.url = file.response.url;
        }
        return file;
      });
      this.fileList = fileList;
    },
    // 显示条数
    async onShowSizeChange(current, pageSize) {
      this.queryInfo.pageSize = pageSize;
      this.queryInfo.page = 1
      const res = await caseAll(this.queryInfo);
      this.testCaseData = res.results;
      this.total = res.count;
    },
    // 翻页
    async onChange(pageNumber) {
      this.queryInfo.page = pageNumber
      const res = await caseAll(this.queryInfo);
      this.testCaseData = res.results;
      this.total = res.count;
    },
    getCaseList() {
      this.queryInfo.page = 1
      caseAll(this.queryInfo).then(res => {
        this.testCaseData = res.results;
        this.total = res.count;
      });
    },
    runTestCase(id) {
      runCase({
        'case_id': id.case_id,
        'browser': id.browser,
        'import_address': id.import_address,
        'url': id.ip,
        'loop': id.loop,
        'run_models': id.run_models,
      }).then(res => {
        if (res.errcode === 0){
          this.$msgsuccess(res.msg)
        }else {
          this.$msgerror(res.msg)
        }
      });
    },
    caseTask(id){
      this.$router.push({name: 'CaseTask', query: {caseId: id.case_id}})
    }
  },
  created() {
    this.getCaseList()
  }
}
</script>

<style scoped>

</style>
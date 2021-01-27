<template>
  <div style="max-width: 890px">
    <a-form-model ref="ruleForm" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
     <a-row type="flex" justify="end" style="width: 888px;height: 8px;">
        <a-col :span="4">
          <a-steps v-model="current" size="small" direction="vertical">
            <a-step title="Step 1" description="填写部署单" />
            <a-step title="Step 2" description="选择研发人" />
            <a-step title="Step 3" description="上传报告" />
          </a-steps>
        </a-col>
      </a-row>
    <a-form-model-item ref="title" label="发布项目:">
      <a-input  v-model:value="appName" disabled="true" style="color: #f10f32"/>
    </a-form-model-item>

     <a-form-model-item ref="deployType" label="发布类型" prop="deployType">
        <a-select v-model="form.deployType" placeholder="请选择发布类型">

          <a-select-option value="FULL" v-if="isContainer!=='0'">全量发布</a-select-option>
          <a-select-option value="INC" v-if="isContainer!=='0'">增量发布</a-select-option>
          <a-select-option value="CONTAINER" v-if="isContainer==='0'">微服务</a-select-option>
        </a-select>
     </a-form-model-item>

    <a-form-model-item ref="title" label="申请标题:" prop="title">
      <a-input v-model="form.title"  placeholder="【类型-问题原因】  示例: BUG修复-修复控件无法选择" @blur="() => {$refs.title.onFieldBlur();}"/>
    </a-form-model-item>

    <a-form-model-item ref="version" label="版本号:" prop="version" v-if="form.deployType!=='FULL'">
      <a-input v-model="form.version" @blur="() => {$refs.version.onFieldBlur();}" placeholder="示例：web-20200202.zip"/>
    <!--示例: 【增量INC-微服务V】, 如V_100、INC_web-20200525.zip-->
    </a-form-model-item>

    <a-form-model-item label="上线说明:" prop="desc">
      <a-input style="height: 60px" ref="desc" v-model="form.desc"  placeholder="请详细说明应用更新功能点、修复问题及上线注意事项. 全量更新请说明发布的分支名称" type="textarea" />
    </a-form-model-item>

    <a-form-model-item ref="approvalUser" label="审批人" prop="approvalUser">
      <a-select v-model="form.approvalUser" placeholder="请选择审批人">
        <a-select-option  v-for="(item) in ApproveUser" :value="item.approval_name" :key="item.approval_name">{{item.approval_name}}</a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item label="研发人:" prop="developUser">
      <a-mentions  placeholder="@功能研发人" :loading="loading" v-model="form.developUser" @search="onSearchDevelopUsers">
        <a-mentions-option v-for="({ username,name,position, avatar: avatar }) in developUsers" :key="username" :value="username">
              <img :src="avatar" :alt="name" style="width: 20px; margin-right: 8px;">
              <span>{{ name }}-{{ position}}</span>
        </a-mentions-option>
      </a-mentions>
    </a-form-model-item>

    <a-form-model-item label="上线时间" required prop="onlineTime">
      <a-date-picker v-model="form.onlineTime" show-time type="date" placeholder="期待应用发布时间" style="width: 100%;"/>
    </a-form-model-item>

    <a-form-model-item label="钉钉通知" prop="delivery">
      <a-switch default-checked v-model="form.dingTalk" >
        <a-icon slot="checkedChildren" type="check" />
        <a-icon slot="unCheckedChildren" type="close" />
      </a-switch>
    </a-form-model-item>

    <a-form-model-item ref="testRepo" v-model="form.testRepo" label="测试报告" prop="testRepo">
      <a-upload
        action="/api/v1/Upload"
        :multiple="false"
        :file-list="fileList"
        :before-upload="beforeUpload"
        @change="testReport"
      >
      <a-button><a-icon type="upload" />上传文件</a-button>
      </a-upload>
    </a-form-model-item>

    <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click="onSubmit">提交</a-button>
      <a-button style="margin-left: 10px;" @click="resetForm">重填</a-button>
    </a-form-model-item>
  </a-form-model>
</div>


</template>
<script>
import debounce from 'lodash/debounce';
import {getApprovalUser, createDeploy} from '@/api/project/project'
import AFormItem from "ant-design-vue/es/form/FormItem";
export default {
    components: {AFormItem},
    data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      other: '',
      form: {
        title: '',
        version: '',
        desc: '',
        developUser: '',
        onlineTime: undefined,
        dingTalk: true,
        resource: '',
      },
      appName: '',
      isContainer: '',
      loading: false,
      developUsers: [],
      current: 0,
      ApproveUser: [],
      fileList: [],
      rules: {
        title: [
          { required: true, message: '上线单标题不能为空', trigger: 'blur' },
          { min: 5, max: 35, message: 'Length should be 5 to 35', trigger: 'blur' },
        ],
        version: [
          { required: true, message: '版本号不能为空', trigger: 'blur' },
          { min: 1, max: 40, message: 'Length should be 3 to 40', trigger: 'blur' },
        ],
        approvalUser: [{ required: true, message: '请选择审批人', trigger: 'change' }],
        deployType: [{ required: true, message: '请选择发布类型', trigger: 'change' }],
        developUser: [{ required: true, message: '请选择研发人', trigger: 'change' }],
        onlineTime: [{ required: true, message: '请选择上线时间', trigger: 'change' }],
        // test_repo: [{ required: true, message: '请上传测试报告', trigger: 'blur' }],
        desc: [
            { required: true, message: '上线说明不能为空', trigger: 'blur' },
            { min: 10, max: 200, message: '不要偷懒哦，你填写的说明太少了!', trigger: 'blur' }
            ],
      },
    };
  },
  mounted() {
    this.loadGithubUsers = debounce(this.loadGithubUsers, 300);
  },
  created() {
    this.ApprovedUser()
    this.isContainer = this.$route.query.container
  },
  methods: {
    onSubmit() {
      const _this = this;
      this.$refs.ruleForm.validate(valid =>{
        if (valid) {
          const res = createDeploy({
            projectId: this.$route.query.id,
            deploy: this.form,
            file: this.fileList,}).then((result) => {
              if (result.errcode === 0){
                _this.$msgsuccess(result.msg)
                // 跳转至审批单列表
                this.$router.push("/approval")
              }else{
                _this.$msgerror(result.msg + result.data.fileName);
              }
            });
        }else {
          return false;
        }
      });
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },
    //  文件上传处理
    testReport(file) {
      let fileList = [...file.fileList];
      fileList = fileList.slice(-1);
      fileList = fileList.map(file => {
        const status = file.status
        if (status ==='uploading') {
        }
        if (status === 'done'){
          file.url = file.response.data.url;
            if (file.response.errcode === 0) {
              this.current = 3;
              return file;
          }
        }else if (status === 'error') {
          this.$msgerror(`${file.file.name} file upload failed.`)
        }
        return file;
      });
      this.fileList = fileList;
    },
    // 文件上传前校验文件格式及大小
    beforeUpload(file) {
     // console.log(file.type, '文件类型')
      const isAllowFileType = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword' ||file.type === 'application/x-zip-compressed' || file.type === 'application/wps-office.doc';
      if (!isAllowFileType) {
        this.$message.error('上传文件格式不在允许范围内(*.doc, *.zip)!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('文件必须小于2MB!');
      }
      return isAllowFileType && isLt2M;
    },
    //  获取审批人
    async ApprovedUser() {
        this.appName = this.$route.query.app_name
        const resApproveUser = await getApprovalUser({
        });
        this.ApproveUser = resApproveUser
    },
    // 搜索研发人
    onSearchDevelopUsers(search) {
      this.search = search;
      this.loading = !!search;
      this.developUsers = [];
      this.loadGithubUsers(search);
    },
    loadGithubUsers(key) {
      if (!key) {
        this.developUsers = [];
        return;
      }
      const token = localStorage.getItem('token');
      // TODO 未判断token过期
      fetch(`/api/v1/user/getUserInfo?search=${key}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authorization': 'jwt ' + token
          }
      }).then(res => res.json()).then(({ UserInfo = [] }) => {
          const { search } = this;
          if (search !== key) return;
            this.current = 2;
            this.developUsers = UserInfo.slice(0, 10);
            this.loading = false;
        });
      },
  },
};
</script>

<template>
  <div>
<!--    <p>Tips: 权限管控，开发人员只能拥有测试环境select权限，同理测试人员只能拥有开发环境的select权限。</p>-->
    <a-divider />
    <a-form-model ref="ruleForm" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="环境：" >
        <a-select v-model:value="province">
          <a-select-option v-for="envInfo in envInfo" :key="envInfo">{{ envInfo }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="库名：" >
        <a-select v-model:value="second">
          <a-select-option v-for="envDb in cities" :key="envDb">{{ envDb }}</a-select-option>
        </a-select>
      </a-form-item>

      <p></p>
      <a-form-model-item label="权限：" prop="permissions">
      <a-checkbox-group v-model:value="form.permissions"  style="width: 35%">

        <a-col :span="40">
          <a-checkbox value="select">Select</a-checkbox>
        </a-col>

        <a-col :span="40">
          <a-checkbox value="insert">Insert</a-checkbox>
        </a-col>

        <a-col :span="40">
          <a-checkbox value="update">Update</a-checkbox>
        </a-col>

        <a-col :span="40">
          <a-checkbox value="delete">Delete</a-checkbox>
        </a-col>

      </a-checkbox-group>
      </a-form-model-item>
      <p></p>
      <a-form-model-item label="原因：" prop="desc" :wrapper-col="{ span: 19, offset: 0 }">
      <a-textarea style="width: 21%" v-model:value="form.desc" placeholder="请输入申请原因以及背景, 以减少审批流程中的沟通成本" :rows="4" />
      </a-form-model-item>
      <p></p>

      <a-button type="primary" @click="dbSubmit">提交申请</a-button>

    </a-form-model>
  </div>
</template>

<script>
import {database} from '@/api/database'
const envInfo = ['开发环境', '测试环境'];
const dbTable = {
  开发环境: ['flybycloud', ],
  测试环境: ['rel', ],
};
export default {
name: "UserDatabase",
    data() {
    const province = envInfo[0];
    return {
      province,
      envInfo,
      dbTable,
      second: dbTable[province][0],

      labelCol: { span: 1 },
      wrapperCol: { span: 4 },
      form: {
        desc: '',
        permissions: [],
      },
      rules: {
        permissions: [
          {
            type: 'array',
            required: true,
            message: '权限类型必填',
            trigger: 'change',
          },
        ],
        desc: [
          { required: true, message: '申请原因不能为空', trigger: 'change' },
        ],
      },
    };
  },
  computed: {
    cities() {
      return dbTable[this.province];
    },
  },
  watch: {
    province(val) {
      this.second = this.dbTable[val][0];
    },
  },
  methods: {
    dbSubmit(){
     this.$refs.ruleForm.validate(valid => {
        if (valid) {
          database({'env': this.province, 'databaseName': this.second,
            'desc': this.form.desc, 'permissions': this.form.permissions}).then((res => {
            if (res.errcode === 0){
              this.$msgsuccess(res.msg)
            }else {
              this.$msgerror(res.msg)
            }
          }))

        } else {
          // 效验失败
          //console.log('error submit!!');
          return false;
        }
      });

    }
  }
}
</script>

<style scoped>

</style>
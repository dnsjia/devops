<template>
<div>

    <a-form :layout="formLayout">
    <a-form-item :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">

    <a-form-model :model="form" ref="EsForm" :rules="rules">
    <a-form-model-item label="请求方法:" prop="EsMethods">
      <a-select v-model="form.EsMethods" placeholder="选择请求方法" style="width: 140px;">
        <a-select-option value="get">GET</a-select-option>
        <a-select-option value="post">POST</a-select-option>
      </a-select>
    </a-form-model-item>

    <a-form-model-item label="索引名称:" prop="EsIndex">
      <a-select v-model="form.EsIndex" placeholder="选择索引名称" show-search :filter-option="filterOption" style="width: 180px;">

              <a-select-option v-for="indexs in esIndesList"
                               :key="indexs.value"
                               :value="indexs.index_name">{{ indexs.index_name }}
              </a-select-option>

      </a-select>
    </a-form-model-item>
    </a-form-model>

    </a-form-item>
    <a-form-item label="文档ID:" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
      <a-input style="width: 400px" placeholder="请输入文档ID" v-model="documentID"/>
    </a-form-item>
  </a-form>
    <br>
    <a-button type="primary" @click="handleSubmit" :loading="loading">提交请求</a-button>
    <a-divider type="vertical" />
    <a-button type="primary" @click="handleFormat">格式化</a-button>
    <a-divider type="vertical" />
    <a-button type="primary" @click="handleJson">验证JSON</a-button>
      <a-divider type="vertical" />
    <a-button type="danger" @click="downToJson"><a-icon type="cloud-download" /> 下载查询结果</a-button>
<!--      <a-divider type="vertical" />-->
<!--    <a-button type="danger" @click="downToExcel">导出结果Excel</a-button>-->
  <br><br>
    <a-tabs default-active-key="1">
<!--    <a-tabs default-active-key="1" @change="callback">-->
      <a-tab-pane key="1" tab="查询">

       <a-form-model :model="form" ref="ruleForm" :rules="rules" :label-width="130">
          <a-form-model-item label="" prop="tempSource">
          <a-row :gutter="20">
            <a-col span="12">
              <a-tag color="#108ee9">请求内容</a-tag>
              <b-ace-editor v-model="form.tempSource" height="400" lang="json" snippets></b-ace-editor>
            </a-col>
            <a-col span="12">
              <a-tag color="#87d068">响应结果</a-tag>
              <b-ace-editor v-model="form.esSearchResult" height="400" lang="json" snippets></b-ace-editor>
            </a-col>
          </a-row>
          </a-form-model-item>
        </a-form-model>
        <p style="color: #f10f32">温馨提示：查询时请合理控制返回条数，条数过大可能会影响线上集群不稳定。</p>
      </a-tab-pane>


    </a-tabs>
  </div>
</template>

<script>
import {search, getEsIndex} from '@/api/elasticsearch'
  export default {
  beforeCreate() {
    //this.form = this.$form.createForm(this, {name: 'ElasticSearch'});
  },
    data() {
      const checkObj=(rule, value, callback)=>{
        try {
         if(JSON.parse(value.trim())){
          callback()
         }
        }catch (e) {
          callback('不是标准json')
        }
      }
      return {
        rules: {
          tempSource: [
             // { required: true, message: '必填项', trigger: 'blur' },
             //  { min: 5, max: 112, message: '标题长度范围5-112', trigger: 'blur' },
              { validator:checkObj, trigger: 'blur' }
            ],
          EsMethods: [{ required: true, message: '请选择请求方法', trigger: 'blur' }],
          EsIndex: [{ required: true, message: '请选择索引名称', trigger: 'blur' }],
        },
        form:{
          tempSource:'',
          EsMethods: undefined,
          EsIndex: undefined,
          esSearchResult: null,
        },
        formLayout: 'inline',
        documentID: '',
        esIndesList: null,
        loading: false,
        jsonFile: null,
      }
    },
    methods: {
      handleSubmit() {
          this.$refs.EsForm.validate((valid) => {
            if (valid) {
              if (this.form.EsMethods === 'get' && this.documentID == ''){
                this.$msgerror('选择GET方法时请输入文档ID')
                return ''
              }
              this.loading = true
              search({'es_index': this.form.EsIndex, 'request_methods': this.form.EsMethods,
                'request_body': this.form.tempSource, 'es_document_id': this.documentID
              }).then((resp) => {
                if (resp.errcode !== 0){
                  this.$msgerror(resp.msg)
                  this.loading = false
                  return ''
                }
                this.loading = false
                this.form.esSearchResult = JSON.stringify(resp.data, null, 2)
                this.jsonFile = resp.file
              })
            }else{
              console.log('校验失败')
             // this.$msgerror({type:'danger',content:'校验失败'})
            }
          })
      },
      handleFormat() {
        this.form.tempSource = JSON.stringify(JSON.parse(this.form.tempSource), null, 2)
      },
      handleJson() {
          this.$refs.ruleForm.validate((valid) => {
            if (valid) {
              this.$msgsuccess({type:'success',content:'校验成功'})
            }else{
              this.$msgerror({type:'danger',content:'校验失败'})
            }
          })
      },
      downToJson(){
        if (this.form.esSearchResult == '' || this.form.esSearchResult == null){
          this.$msgerror('查询结果为空,暂不能导出！')
          return ''
        }else{
          window.open(this.jsonFile)
        }

      },
      downToExcel(){
        if (this.form.esSearchResult == '' || this.form.esSearchResult == null){
          this.$msgerror('查询结果为空,暂不能导出！')
          return ''
        }
      },
      getEsIndexs(){
        getEsIndex().then((resp => {
          if (resp.errcode === 0){
            this.esIndesList = resp.data
          }
        }))
      },
    // 索引搜索过滤
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    },
  computed: {
    formItemLayout() {
      const {formLayout} = this;
      return formLayout === 'horizontal'
          ? {
            labelCol: {span: 6},
            wrapperCol: {span: 4},
          }
          : {};
    },
  },
  mounted() {
   this.getEsIndexs()
  }
  }




</script>

<style scoped>

</style>




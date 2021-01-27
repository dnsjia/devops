<template>
  <div>
  <a-form :inline="true">
        <a-form-item prop="namespace">
          <a-select v-model="queryInfo.namespace" placeholder="请选择命名空间" style="width: 15%" show-search >

            <a-select-option
              v-for="(item, index) in namespaceList"
              :key="index"
              :label="item.name"
              :value="item.name">
              {{item.name}}
            </a-select-option>
          </a-select>

          <a-button type="primary" @click="filterByNamespaceOnDeployment" style="margin-left: 1%" :loading="filterNamespaceOnDeploymentLoading">筛选</a-button>

        </a-form-item>
      </a-form>
    <a-table :columns="deploymentColumns" :data-source="deploymentList" :pagination="false" @showSizeChange="onShowSizeChangeDeployment" >
      <a slot="name" slot-scope="text">{{ text }}</a>

      <span slot="labels" slot-scope="text, labels" >
        <a-tag color="#87d068" v-for="(item,key,index) in labels.labels" :key="index">{{key}}:{{item}}</a-tag>
      </span>

      <span slot="replicas" slot-scope="replicas, replicas2">
        <span v-if="replicas2.available_replicas == null ? replicas2.available_replicas=0 : replicas2.available_replicas ||
        replicas2.replicas !== null ? replicas2.replicas : replicas2.replicas=0">
          {{replicas2.available_replicas}}/{{replicas2.replicas}}
        </span>
      </span>

      <span slot="create_time" slot-scope="create_time">{{create_time | fmtTime}}</span>


    </a-table>
      <div class="float-right" style="padding: 10px 0;">
          <a-pagination size="md"
                        :show-total="total => `共 ${total} 条数据`"
                        v-model="queryInfo.page"
                        :page-size-options="pageSizeOptions"
                        :total="total"
                        show-size-changer
                        :page-size="queryInfo.page_size"
                        show-less-items align="right"
                        @showSizeChange="onShowSizeChangeDeployment"
                        @change="onChangeDeployment">
              <template slot="buildOptionText" slot-scope="props">
                  <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
                  <span v-if="props.value === '50'">全部</span>
              </template>
          </a-pagination>
      </div>
    </div>
</template>

<script>
import {deployments, namespaces} from "@/api/k8s";

const deploymentColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: '标签',
    dataIndex: 'labels',
    key: 'labels',
    scopedSlots: { customRender: 'labels' },
  },
  {
    title: '容器组',
    dataIndex: 'replicas',
    key: 'replicas',
    scopedSlots: {customRender: "replicas"},
  },
  {
    title: '镜像',
    dataIndex: 'image',
    key: 'image',
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    scopedSlots: {customRender: "create_time"},
  }
]

export default {
name: "Deployment",
  data() {
      return {
        queryInfo: {
          page: 1,
          page_size: 10,
          //命名空间
          // 使用select时, 如果绑定了model数据, placeholder将不会被显示，github有相关的issues因此需要将值设置为undefined或者[]
          // 设置为null 或者为 '' 空时placeholder也不会显示
          // https://github.com/vueComponent/ant-design-vue/issues/986
          namespace: undefined,
        },
        total: 0,
        pageSizeOptions: ['10', '20', '30', '40'],
        namespaceList: '',
        //Deployment
        deploymentList: [],
        deploymentColumns,
        filterNamespaceOnDeploymentLoading: false,
      }
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
  methods: {
    //获取Deployment列表
    getDeploymentList() {
      this.queryInfo.page = 1
      deployments(this.queryInfo).then(res => {
          this.deploymentList = res.results;
          this.total = res.count;
          this.filterNamespaceOnDeploymentLoading = false
      })
    },
    //获取命名空间列表
    getNamespaceList() {
      namespaces(this.queryInfo).then(res => {
        if (res.errcode === 0) {
          this.namespaceList = res.data;
        } else {
          this.$msgerror(res.msg)
        }
      })
    },
    //筛选命名空间
    filterByNamespaceOnDeployment() {
      this.filterNamespaceOnDeploymentLoading = true
      this.getDeploymentList(this.queryInfo);
    },
    // 显示条数
    async onShowSizeChangeDeployment(current, pageSize) {
      this.queryInfo.page_size = pageSize;
      this.queryInfo.page = 1
      const res = await deployments(this.queryInfo);
      this.deploymentList = res.results;
      this.total = res.count;
    },
    // 翻页
    async onChangeDeployment(pageNumber) {
      this.queryInfo.page = pageNumber
      const res = await deployments(this.queryInfo);
      this.deploymentList = res.results;
      this.total = res.count;
    },
  },
  created() {
    this.getDeploymentList(this.queryInfo);
    this.getNamespaceList();
  },
}
</script>

<style scoped>

</style>
<template>
  <div>
      <div style="padding: 10px 0; margin-top: -10px">

          <div class="certain-category-search-wrapper" style="width: 220px; margin-top: -8px; float:right">
              <!--搜索-->
            <a-input-search placeholder="搜索" style="width: 200px" @search="onSearch"/>
          </div>
                <a-modal v-model="rollBackVisible" :footer="null" title="回滚列表" :destroyOnClose="true" :keyboard="false" :maskClosable="false" width="700px">
                    <a-skeleton :loading="rollbackLoding" active>
                      <a-table style="padding: 10px 0; margin-top: -32px; margin-left: -16px; margin-right: -16px" :columns="rollBackColumns"  :loading="false" :showHeader="true" :pagination="false" :data-source="rollBackData"  rowKey="id">

                      <!--solt插槽-->
                          <a-button slot="actionRollback" slot-scope="id" type="danger" size="small" @click="RollBackupConfirm(id)">回到此版本</a-button>
                          <a-tag v-if="backup_type ==='增量更新'" slot="backup_type" slot-scope="backup_type" color="green">增量备份</a-tag>
                          <a-tag v-else-if="backup_type ==='全量更新'" slot="backup_type" slot-scope="backup_type" color="orange">全量备份</a-tag>
                          <a-tag v-else-if="backup_type ==='CONTAINER'" slot="backup_type" slot-scope="backup_type" color="cyan">{{ backup_type}}</a-tag>
                        <span slot="backup_time" slot-scope="backup_time">{{backup_time | fmtTime}}</span>
                      </a-table>
                        </a-skeleton>
                </a-modal>

      </div>

      <a-table :pagination="false" @showSizeChange="onShowSizeChange" :columns="columns" :dataSource="data" rowKey="id">

        <span slot="project_env" slot-scope="project_env">
          <a-tag color="green">{{project_env}}</a-tag>
        </span>

        <span slot="action" slot-scope="id">

            <router-link :to="{path: 'deploy/create?id=' + id.id, query:{app_name: id.title, container: id.is_container}}"><a-button type="primary" >发布</a-button></router-link>

            <a-divider type="vertical"/>
            <a-button type="danger" @click="deployRollback(id)">回滚</a-button>
        </span>

        <span slot="is_container" slot-scope="is_container">{{is_container | fmtIsContainer}}</span>
        <span slot="created_time" slot-scope="created_time">{{created_time | fmtTime}}</span>
      </a-table>

      <div class="float-right" style="padding: 10px 0;">
        <a-pagination size="md" :show-total="total => `共 ${total} 条数据`" v-model="current"
              :page-size-options="pageSizeOptions"
              :total=total
              show-size-changer
              :page-size="pageSize"
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
import {getList, addProject, delProject, searchProject, rollBackHistoryVeserion, toRollback} from '@/api/project/project'

const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};

const columns = [
  {
    title: '项目名称',
    dataIndex: 'title',
    key: 'title',
  },

  {
    title: '容器化部署',
    dataIndex: 'is_container',
    key: 'is_container',
    scopedSlots: {customRender: 'is_container'},
    filterMultiple: false,
    filters: [
      {
        text: '是',
        value: 0,
      },
      {
        text: '否',
        value: 1,
      },
    ],
    onFilter: (value, record) => record.is_container === value,
  },
  {
    title: '环境',
    dataIndex: 'project_env',
    key: 'project_env',
    scopedSlots: {customRender: 'project_env'},
  },
  {
    title: '备注',
    dataIndex: 'description',
    key: 'description',
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

const rollBackColumns = [
  {
    title: '项目名称',
    dataIndex: 'project_name',
    key: 'project_name',
  },
  {
    title: '备份名称',
    dataIndex: 'package_name',
    key: 'package_name',
  },
  {
    title: '备份时间',
    dataIndex: 'backup_time',
    scopedSlots: {customRender: "backup_time"},
    key: 'backup_time',
  },
  {
    title: '类型',
    dataIndex: 'backup_type',
    scopedSlots: {customRender: "backup_type"},
    key: 'backup_type',
  },
  {
    title: '操作',
    key: 'actionRollback',
    scopedSlots: {customRender: 'actionRollback'},
  },
];

export default {
  beforeCreate() {
    //this.form = this.$form.createForm(this, {name: 'addNginx'});
  },
  data() {
    return {
      rollBackVisible: false,
      rollBackData: [],
      rollBackColumns,
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
      rollbackLoding: true,
    };
  },
  created() {
    this.getList()
  },
  methods: {
    // 项目搜索
    async onSearch(value) {
      const res = await searchProject({"keywords": value,});
      this.searchValue = value;
      this.data = res.results;
      this.total = res.count;
      this.current = 1
    },
    // 获取项目列表
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

    // 版本回滚
    deployRollback(id) {
        rollBackHistoryVeserion(id).then((res => {
            console.log(res)
            if (res.errcode ===0){
                this.rollBackData = res.data
                this.rollbackLoding = false

            }else {
                this.rollBackData = []
                this.$msgerror(res.msg)
                this.rollbackLoding = false
            }
        }));
        this.rollBackVisible = true;
    },
   // 回退版本
    RollBackupConfirm(id) {
      const _this = this
      this.$confirm({
        title: '确定回退版本吗?',
        content: '回退大约需要5~10分钟，回退后请及时检查业务！',
        cancelText: '取消',
        okText: '确定',
        confirmLoading: false,
        async onOk() {
            const res = await toRollback({
                "id": id.id,
                "project_name": id.project_name,
                "backup_type": id.backup_type,
                "package_name": id.package_name,
                "namespace": id.namespace,
                "registry": id.registry
            });
            if (res.errcode !== 0){
                _this.$msgerror(res.msg)
            }else {
                _this.$msgsuccess(res.msg)
            }
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    },
  }
};

</script>


<style scoped lang="scss">

</style>
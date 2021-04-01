<template>
  <div>
    <a-form :inline="true">
      <a-form-item prop="namespace">
        <a-select v-model="queryInfo.namespace" clearable placeholder="请选择命名空间" style="width: 15%" show-search >
          <a-select-option
            v-for="(item, index) in namespaceList"
            :key="index"
            :label="item.name"
            :value="item.name">
            {{item.name}}
          </a-select-option>
        </a-select>
        <a-button type="primary" @click="filterByNamespace" style="margin-left: 1%" :loading="filterNamespaceLoading">筛选</a-button>
      </a-form-item>
    </a-form>
    <a-table :columns="containerGroupColumns" :data-source="containerGroupList" :pagination="false" @showSizeChange="onShowSizeChange" >
    <div
      slot="filterDropdown"
      slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
      style="padding: 8px"
    >
      <a-input
        v-ant-ref="c => (searchInput = c)"
        :placeholder="`Search ${column.dataIndex}`"
        :value="selectedKeys[0]"
        style="width: 188px; margin-bottom: 8px; display: block;"
        @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
        @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
      />
      <a-button
        type="primary"
        icon="search"
        size="small"
        style="width: 90px; margin-right: 8px"
        @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
      >
        搜索
      </a-button>
      <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">
        重置
      </a-button>
    </div>
    <a-icon
      slot="filterIcon"
      slot-scope="filtered"
      type="search"
      :style="{ color: filtered ? '#108ee9' : undefined }"
    />
    <template slot="name" slot-scope="text, record, index, containerGroupColumns">
      <span v-if="searchText && searchedColumn === column.dataIndex">
        <template
          v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
        >
          <mark
            v-if="fragment.toLowerCase() === searchText.toLowerCase()"
            :key="i"
            class="highlight"
            >{{ fragment }}</mark
          >
          <template v-else>{{ fragment }}</template>
        </template>
      </span>
      <template v-else>
        {{ text }}
      </template>
    </template>





  <a slot="name" slot-scope="text">{{ text }}</a>
  <a-tag color="#87d068" slot="status" slot-scope="status" v-if="status=='Running'">{{status}}</a-tag>
  <a-tag color="#108ee9" slot="status" slot-scope="status" v-else-if="status=='Pending'">{{status}}</a-tag>
  <a-tag color="#f50" slot="status" slot-scope="status" v-else>{{status}}</a-tag>

  <span slot="create_time" slot-scope="create_time">{{create_time | fmtTime}}</span>

  <span slot="action" slot-scope="action, id">
    <a-divider type="vertical"/>
    <a-button type="danger" @click="podDeleteConfirm({name: id.name, namespace: id.namespace})">重启</a-button>
    <a-divider type="vertical"/>
    <a-button type="primary" @click="podLogs({name: id.name, namespace: id.namespace})">日志</a-button>
      <a-divider type="vertical"/>
  </span>

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
import {namespaces, container, podDelete} from '@/api/k8s'

const containerGroupColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    scopedSlots: {
      customRender: 'name',
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
    },
    onFilter: (value, record) =>
      record.name
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus();
        }, 0);
      }
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '重启次数',
    dataIndex: 'restart_count',
    key: 'restart_count',
  },
  {
    title: 'Pod IP',
    dataIndex: 'pod_ip',
    key: 'pod_ip',
  },
  {
    title: '节点',
    dataIndex: 'host_ip',
    key: 'host_ip',
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    scopedSlots: {customRender: "create_time"},
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  },
]
export default {
name: "Pod",
    data() {
      return {
        queryInfo: {
          page: 1,
          page_size: 10,
          //命名空间
          namespace: undefined,
        },
        total: 0,
        pageSizeOptions: ['10', '20', '30', '40'],
        //筛选
        //selectedNamespace: '',
        namespaceList: '',
        //ContainerGroup 容器组
        containerGroupList: [],
        containerGroupColumns,
        filterNamespaceLoading: false,
        // 搜索
        searchText: '',
        searchInput: null,
        searchedColumn: '',

      }
    },
  methods: {
    //获取Container列表
    getContainerList() {
      this.queryInfo.page = 1
      container(this.queryInfo).then(res => {
          this.containerGroupList = res.results;
          this.total = res.count;
          this.filterNamespaceLoading= false
      })
    },
    //筛选命名空间
    filterByNamespace() {
      this.filterNamespaceLoading = true
      this.getContainerList(this.queryInfo);
    },
    // 显示条数
    async onShowSizeChange(current, pageSize) {
      this.queryInfo.page_size = pageSize;
      this.queryInfo.page = 1
      const res = await container(this.queryInfo);
      this.containerGroupList = res.results;
      this.total = res.count;
    },
    // 翻页
    async onChange(pageNumber) {
      this.queryInfo.page = pageNumber
      const res = await container(this.queryInfo);
      this.containerGroupList = res.results;
      this.total = res.count;
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
    // 搜索
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },
    // 搜索重置
    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },
    // 重启pod
    podDeleteConfirm(params){
      const _this = this
      this.$confirm({
        title: '确认重启服务?',
        content: '注意：重启时会删除原服务并重新创建,请谨慎操作!',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          podDelete(params).then(res => {
            if (res.errcode === 0){
              _this.$msgsuccess(res.msg)
              _this.getContainerList(_this.queryInfo)
            }else {
              _this.$msgerror(res.msg)
            }
          });
        },
        onCancel() {
          console.log('Cancel');
        },
        class: 'test',
      });
    },
    // 查看pod日志
    podLogs(params){
      let routeData = this.$router.resolve({name: 'PodLogs', query: {pod_name: params.name, namespace: params.namespace}})
      window.open(routeData.href, '_blank')
    }
  },
  created() {
    this.getContainerList();
    this.getNamespaceList();
  }
}
</script>

<style scoped>

</style>
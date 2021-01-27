<template>
  <div>
    <a-table :pagination="false" @showSizeChange="onShowSizeChange" :columns="columns" :dataSource="data" rowKey="user_id">
      <template slot="is_active" slot-scope="is_active">
      <span>
        <span class="ant-badge ant-badge-status ant-badge-not-a-wrapper" v-if="is_active">
          <span class="ant-badge-status-dot ant-badge-status-success"></span>
          <span class="ant-badge-status-text">正常</span>
        </span>
        <span class="ant-badge ant-badge-status ant-badge-not-a-wrapper" v-else-if="is_active==false">
          <span class="ant-badge-status-dot ant-badge-status-error"></span>
          <span class="ant-badge-status-text">禁用</span>
        </span>
      </span>
      </template>

      <span slot="action" slot-scope="action, is_active">
          <a @click="showMenuModal(is_active)">分配角色</a>
          <a-divider type="vertical"/>
          <a-popconfirm placement="topRight" ok-text="确认" cancel-text="取消" @confirm="removeUser(is_active.user_id)">
            <template slot="title">
              <p>删除该用户后将无法登录</p>
            </template>
            <a :disabled="is_active.is_staff">删除</a>
    <!--        <a @click="removeUser(is_active.user_id)" :disabled="is_active.is_staff">删除</a>-->
          </a-popconfirm>
          <a-divider type="vertical"/>
          <a v-if="is_active.is_active" @click="disableUser(is_active.user_id, false)" :disabled="is_active.is_staff">禁用</a>
          <a v-else @click="disableUser(is_active.user_id, true)" :disabled="is_active.is_staff">启用</a>
      </span>

      <!--solt插槽-->
      <span slot="last_login" slot-scope="last_login">{{last_login | fmtTime}}</span>
      <a-tag v-if="role" slot="role" slot-scope="role" color="cyan">{{ role }}</a-tag>

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


  <a-modal title="分配角色" :visible="menuVisible"
           :confirm-loading="menuConfirmLoading"
           @ok="handleMenuOk()"
           ok-text="确认"
           cancel-text="取消"
           @cancel="handleMenuCancel">

    <p>当前用户：{{user}}</p>
    <p>当前角色：{{role}}</p>
    <p>分配角色：
      <a-select v-model="selectRoleId" placeholder="请选择" style="width: 140px">
        <a-select-option
          v-for="item in rolesList"
          :key="item.id"
          :value="item.id">
          {{item.name}}
        </a-select-option>
        {{rolesList}}
      </a-select>
    </p>
  </a-modal>
  </div>
</template>

<script>
import {userInfo,accountInfo, deleteUser, updateUser, UserRole} from "@/api/user";
import {rolesGet} from '@/api/premission'
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '职位',
    dataIndex: 'position',
    key: 'position',
  },
  {
    title: '手机号码',
    dataIndex: 'mobile',
    key: 'mobile',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '角色',
    dataIndex: 'roles[0].name',
    key: 'roles[0].name',
    scopedSlots: {customRender: 'role'},
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    key: 'is_active',
    scopedSlots: {customRender: "is_active"},
  },
  {
    title: '最近登录',
    dataIndex: 'last_login',
    scopedSlots: {customRender: "last_login"},
    key: 'last_login',
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: {customRender: "action"},
    key: 'user_id',
  },
];

export default {
    data() {
    return {
      data: [],
      columns,
      total: 0,
      current: 1,
      pageSize: 10,
      pageSizeOptions: ['10', '20', '30', '40'],

      menuVisible: false,
      menuConfirmLoading: false,
      user: null,
      role: null,
      //已选中的角色
      selectRoleId: [],
      //所有角色
      rolesList: [],
      //分配角色的用户信息
      //userInfo: {},
    };
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取用户账号列表
    async getList() {
      const res = await accountInfo({});
      this.data = res.results;
      this.total = res.count;
    },
    // 翻页
    async onChange(pageNumber) {
      const res = await accountInfo({
        page: pageNumber,
        pageSize: this.pageSize
      });
      this.data = res.results;
      this.total = res.count;
    },
    // 显示条数
    async onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      const res = await accountInfo({
        // page: this.current,
        pageSize: this.pageSize,
      });
      this.data = res.results;
      this.total = res.count;
      this.current = 1
    },
    disableUser(userId, isActive){
      // 禁用用户
      updateUser({user_id: userId, is_active: isActive}).then((res) =>{
        if (res.errcode !== 0){
          this.$msgerror(res.msg)
        }
        this.getList()
      })
    },
    // 删除用户
    removeUser(userId){
      deleteUser({user_id: userId}).then((res) =>{
        if (res.errcode !== 0){
          this.$msgerror(res.msg)
        }else {
          this.$msgsuccess(res.msg)
        }
        this.getList()
      })
    },
    showMenuModal(data) {
      this.showSetRole(data)
      this.menuVisible = true;
      this.user = data.username
      this.role = data.roles[0].name
    },
    // 分配角色
    handleMenuOk(role_id) {
        if (!this.selectRoleId) {
          this.menuConfirmLoading = false
          return this.$msgerror('请选择要分配的角色')
        }
        if (this.selectRoleId == '' || this.selectRoleId == null){
          this.menuConfirmLoading = false
          return this.$msgerror('请选择要分配的角色')
        }
      UserRole({user_id: this.userInfo.user_id, roles: [this.selectRoleId]}).then((res) =>{
        if (res.errcode !== 0){
          this.$msgerror(res.msg)
        }else {
          this.$msgsuccess(res.msg)
          this.menuVisible = false
        }
        this.getList()
      })

    },
    handleMenuCancel(e) {
      this.menuVisible = false;
    },
      //展示分配角色
    showSetRole(role) {
      this.userInfo = role;
      // 展示对话框之前，获取所有角色列表
      rolesGet().then((res => {
        //console.log(res, 111111);
        this.rolesList = res;
      }))
    }
  }
};

</script>

<style scoped>

</style>
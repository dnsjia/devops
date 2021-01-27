<template>
  <div>
    <!-- 卡片视图 -->
    <a-card>
      <!-- 添加角色按钮 -->
      <a-row>
        <a-col>
          <a-button type="primary" @click="showAddRoleModel">添加角色</a-button>
        </a-col>
      </a-row>
      <!--角色列表-->
      <a-table :columns="columns" :data-source="rolesList" :rowKey="rolesList.id">

      <p slot="expandedRowRender" slot-scope="action" style="margin: 0">
          <a-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in action.permissions" :key="item1.id" >
            <!-- 一级权限 -->
            <a-col :span="5" style="height: 40px">
              <a-tag color="#108ee9">{{ item1.name}}</a-tag>
              <a-icon type="caret-right" v-if="item1.children"/>
            </a-col>

            <!-- 二级和三级 -->
            <a-col :span="19">
              <a-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                <a-col :span="6 " style="height: 40px">
                  <a-tag color="#87d068">{{ item2.name }}</a-tag>
                  <a-icon type="caret-right" v-if="item2.children"/>
                </a-col>
                <a-col :span="18" style="height: 40px">
                  <a-tag v-for="item3 in item2.children" :key="item3.id" color="#2db7f5">{{ item3.name}}</a-tag>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
      </p>

      <span slot="action" slot-scope="action, id" style="height: 30px">
          <a-button type="primary" icon="edit" @click="showEditRoleModal(id)">编辑</a-button>
          <a-divider type="vertical"/>
            <a-button type="danger" icon="delete" @click="removeUserRole(id.id)">删除</a-button>

      </span>
      </a-table>
    </a-card>
    <!--添加角色区域-->
    <a-modal title="添加角色" :visible="addRoleDialogVisible" :confirm-loading="addRoleConfirmLoading"
             @ok="addRoleOk" @cancel="addRoleCancel" ok-text="确认" cancel-text="取消">
      <a-form-model ref="addRoleForm" :model="addRoleForm" :rules="addRoleRules" v-bind="layout">
        <a-form-model-item label="角色名称" prop="roleName">
          <a-input v-model="addRoleForm.roleName" placeholder="请输入角色名称"/>
        </a-form-model-item>
        <a-form-model-item label="角色描述" prop="roleDesc">
          <a-input v-model="addRoleForm.roleDesc" placeholder="请输入角色描述" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <!--编辑角色区域-->
    <a-modal title="修改角色信息" :visible="ModifyRoleDialogVisible" :confirm-loading="ModifyRoleConfirmLoading"
             @ok="ModifyRoleOk" @cancel="ModifyRoleCancel" ok-text="确认" cancel-text="取消">
      <a-form-model ref="addRoleForm" :model="addRoleForm" :rules="addRoleRules" v-bind="layout">
        <a-form-model-item label="角色名称" prop="roleName">
          <a-input v-model="addRoleForm.roleName" placeholder="请输入角色名称"/>
        </a-form-model-item>
        <a-form-model-item label="角色描述" prop="roleDesc">
          <a-input v-model="addRoleForm.roleDesc" placeholder="请输入角色描述" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <!--分配权限-->
    <a-modal title="分配权限" :visible="rightsDialogVisible" width="50%">

  <a-tree
    :checkable="true"
    :tree-data="rightsTree"
    :replace-fields="replaceFields"
    :selected-keys="defaultRights"
    :default-selected-keys="[119]"
    :default-checked-keys="[119]"
    @expand="onExpand"
    @select="onSelect"
  />

      <span slot="footer" class="dialog-footer">
        <a-button @click="rightsDialogVisible = false">取 消</a-button>
        <a-button type="primary" @click="saveRoleRights">确 定</a-button>
      </span>
    </a-modal>


  </div>
</template>

<script>
//import { DownOutlined } from '@ant-design/icons-vue';
import {MenuTree, rolesGet, rolesPot, rolesPut, rolesDelete, rightTreeGet} from '@/api/premission'
const columns = [
  {
    title: '序号',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name',

  },
  {
    title: '角色描述',
    dataIndex: 'desc',
    key: 'desc',
    //width: '12%',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '38%',
    key: 'menus',
    scopedSlots: {customRender: "action"},
  },
];
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  onSelect: (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
};

export default {
name: "Roles",
  data(){
    const roleName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入角色名称'));
      } else {
        if (this.addRoleForm.roleName !== '') {
          this.$refs.addRoleForm.validateField('roleName');
        }
        callback();
      }
    };
    const roleDesc = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入角色描述'));
      } else {
        if (this.addRoleForm.roleDesc !== '') {
          this.$refs.addRoleForm.validateField('roleDesc');
        }
        callback();
      }
    };
    return {
      //分配权限会话框
      rightsDialogVisible: false,
      //显示权限规则详情
      rightsProps: {
        children: 'children',
        label: 'name'
      },
      //选中的权限ID
      selectRightsId: [],
      defaultRights: [],
      //权限分配树形列表
      rightsTree: [],

      // 替换 title 为name , 因为etree 默认取的是title
      // [{"id":118,"name":"应用管理","path":"","method":"GET","pid":null,
      // "children":[{"id":119,"name":"查看应用","path":"/v1/(?P<version>[v1|v2]+)/project/query","method":"GET","pid":118}]}]
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id'
      },

      columns,
      rowSelection,
      //角色列表
      rolesList: [],
      //添加角色对话框
      addRoleDialogVisible: false,
      addRoleConfirmLoading: false,
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      addRoleRules: {
        roleName: [{ validator: roleName, trigger: 'change' }],
        roleDesc: [{ validator: roleDesc, trigger: 'change' }],
      },
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 14 },
      },
      //修改角色对话框
      ModifyRoleDialogVisible: false,
      ModifyRoleConfirmLoading: false
    }
  },


  watch: {
    checkedKeys(val) {
      console.log('onCheck', val);
    },
  },

  methods: {
    onExpand(expandedKeys) {
      console.log('onExpand', expandedKeys);
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onCheck(checkedKeys) {
      console.log('onCheck', checkedKeys);
      this.checkedKeys = checkedKeys;
    },
    onSelect(selectedKeys, info) {
      console.log('onSelect', info);
      this.selectedKeys = selectedKeys;
    },
    //显示分配权限对话框
    showRolePermissionsModal(role) {
      this.currentRole = role;
      rightTreeGet().then(res => {
        this.rightsTree = res;
      })
      //获取默认的权限
      this.defaultRights = [];
      role.permissions.forEach(value => this.getLeafkeys(value, this.defaultRights));
      this.rightsDialogVisible = true;
    },
    //保持修改的权限
    saveRoleRights() {
      const permissionsKeys = [
        ...this.$refs.rightsRef.getCheckedKeys(),
        ...this.$refs.rightsRef.getHalfCheckedKeys()
      ];
      rolesPut(this.currentRole.id, {
        permissions: permissionsKeys,
        name: this.currentRole.name
      }).then(res => {
        this.$msgsuccess("分配成功");
        this.getRolesList()
      }).catch(err => {
        return this.$msgerror(err.response.data.detail)
      });
      this.rightsDialogVisible = false;
    },

    //获取角色列表
    getRolesList(){
        rolesGet().then((res) =>{
          this.rolesList = res
        });
    },
    //显示添加角色对话框
    showAddRoleModel(){
      this.addRoleDialogVisible = true
      this.addRoleForm.roleDesc = ''
      this.addRoleForm.roleName = ''
    },
    addRoleOk(){
      this.$refs['addRoleForm'].validate(valid => {
        if (valid) {
          this.addRoleConfirmLoading = true;
          rolesPot({'name': this.addRoleForm.roleName, 'desc': this.addRoleForm.roleDesc}).then((res) => {
            if (res.data.errcode === 400){
              this.$msgerror('角色已存在!')
              this.addRoleConfirmLoading = false
              return ''
            }else if (res.data.errcode !== 0){
              this.$msgerror('新增角色失败!')
              this.addRoleConfirmLoading = false
              return ''
            }else {
              this.$msgsuccess(res.data.msg)
              this.addRoleDialogVisible = false
              this.getRolesList()
            }
          })
        } else {
          return false;
        }
      });
    },
    addRoleCancel(){
      this.addRoleDialogVisible = false
      this.$refs['addRoleForm'].resetFields();
    },
    //修改角色
    showEditRoleModal(id){
      this.ModifyRoleDialogVisible = true
      this.addRoleForm.roleName = id.name
      this.addRoleForm.roleDesc = id.desc
      this.addRoleForm.id = id.id
    },
    ModifyRoleOk(){
      this.$refs['addRoleForm'].validate(valid => {
        if (valid) {
          this.ModifyRoleConfirmLoading = true;
          rolesPut(this.addRoleForm.id, {'name': this.addRoleForm.roleName, 'desc': this.addRoleForm.roleDesc}).then((res) => {
            if (res.data.errcode !== 0){
              this.$msgerror('修改角色失败!!')
              this.ModifyRoleConfirmLoading = false
              return ''
            }else {
              this.$msgsuccess(res.data.msg)
              this.ModifyRoleDialogVisible = false
              this.getRolesList()
            }
          })
        } else {
          return false;
        }
      });
    },
    ModifyRoleCancel(){
      this.ModifyRoleDialogVisible = false
      this.$refs['addRoleForm'].resetFields();
    },
    //删除角色
    async removeUserRole(id){
      const self = this;
        this.$confirm({
          content: '此操作将永久删除该角色, 是否继续?',
          onOk() {
            return new Promise((resolve, reject) => {
              rolesDelete(id).then((res) => {
                if (res.data.errcode !== 0){
                  self.$msgerror('删除失败!')
                  self.destroyAll();
                }else {
                  self.$msgsuccess('删除成功!')
                  self.destroyAll();
                }
              });
            });
          },
          cancelText: '取消',
          okText: '确认',
          onCancel() {
            self.destroyAll();
          },
        });
    },
    destroyAll() {
      this.$destroyAll();
    },
    getLeafkeys(node, arr) {
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafkeys(item, arr))
      },
  },
  created() {
    this.getRolesList()
  },
  components: {
  //  DownOutlined,
  },
}
</script>

<style>
  .ant-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>



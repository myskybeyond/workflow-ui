<template>
  <div class="message_of_user_task panel-tab__content">
    <h4><b>选择抄送人</b></h4>
    <el-row v-loading="loading">
      <el-row>
        <el-checkbox-group v-model="dataType" @change="multipleValChange">
          <el-checkbox v-for="item in checkBoxGroupData" :key="item.label" :label="item.label">{{ item.value }} </el-checkbox>
        </el-checkbox-group>
      </el-row>
      <el-row>
        <el-table v-if="showSelectedTable.length > 0" ref="showSelectedTableRef" :data="showSelectedTable">
          <el-table-column label="类型" prop="dataTypeLabel" show-overflow-tooltip width="90" />
          <el-table-column label="类型内容" prop="dataValueLabel" show-overflow-tooltip width="220">
            <template #default="scope">
              <div v-if="scope.row.dataType==='USERS'">
                <el-tooltip placement="top" :content="scope.row.dataValueLabel">
                  <el-input autosize readonly v-model="scope.row.dataValueLabel" style="width: 140px;" />
                </el-tooltip>
                <el-button style="float: right;" size="small" type="primary" @click="addUser">添加</el-button>
              </div>
              <el-select
                v-else-if="scope.row.dataType==='POSTS'"
                v-model="scope.row.dataValue"
                multiple
                size="small"
                placeholder="请选择 岗位"
                @change="postsChange"
                clearable
                filterable
              >
                <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="item.postId"></el-option>
              </el-select>
              <el-select
                v-else-if="scope.row.dataType==='ROLES'"
                v-model="scope.row.dataValue"
                multiple
                size="small"
                placeholder="请选择 角色"
                @change="rolesChange"
                clearable
                filterable
              >
                <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId"></el-option>
              </el-select>
              <el-tree-select
                v-else-if="scope.row.dataType==='DEPTS'"
                v-model="scope.row.dataValue"
                :width="320"
                :height="400"
                size="small"
                :data="deptTreeData"
                value-key="deptId"
                placeholder="选择部门"
                check-strictly
                multiple
                nodeKey="id"
                @change="deptsChange"
              />
              <el-input v-else-if="scope.row.dataType==='INITIATOR'" readonly v-model="scope.row.dataValue" style="width: 170px;"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-row>
    <h4><b>抄送通知消息模板</b></h4>
    <el-select v-model="copyNoticeIds" size="small" placeholder="请选择" clearable filterable style="width: 240px;" @change="copyNoticeChange">
      <el-option v-for="item in msgTemplateOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
    </el-select>
  </div>
  <select-dept-user ref="showSelectedTableRef" :show-user-panel="userOpen" @selectedUserIds="selectedUserIds" @openOrClose="openOrClose" />
</template>
<script>
import { listSmsTemplateInfo } from "@/api/business/smsTemplateInfo";
import { listPost } from "@/api/system/post";
import { listRole } from "@/api/system/role";
import { deptTreeSelect, selectUser } from "@/api/system/user";
import SelectDeptUser from "@/views/workflow/components/selectDeptUser.vue";

const userTaskForm = {
  completeNoticeIds: "",
  copyNoticeIds: "",
  completeCandidateUsers: [],
  completeCandidateUsersTypes: [],
  completeText: ""
};
export default {
  name: "MessageOfUserTaskVue2",
  components: { SelectDeptUser },
  props: {
    id: String,
    type: String
  },
  data() {
    return {
      msgTemplateOptions: [],
      completeNoticeIds: [],
      copyNoticeIds: [],
      dataType: [],
      userOpen: false,
      postOptions: [],
      roleOptions: [],
      deptOptions: [],
      checkBoxGroupData: [
        { label: "USERS", value: "指定用户" },
        { label: "ROLES", value: "角色" },
        { label: "DEPTS", value: "部门" },
        { label: "INITIATOR", value: "发起人" },
        { label: "POSTS", value: "岗位" }
      ],
      showSelectedTable: [],
      deptTreeData: [],
      userList: [],
      loading: true
    };
  },
  methods: {
    async getMsgTemplate() {
      const res = await listSmsTemplateInfo();
      this.msgTemplateOptions = res.rows;
    },
    multipleValChange(select) {
      select.forEach(s => {
        const _select = this.showSelectedTable?.find((_row) => _row.dataType === s);
        if (!_select) {
          const _check = this.checkBoxGroupData.find((_c) => _c.label === s);
          const _ele = {
            dataType: s.toString(),
            dataTypeLabel: _check.value,
            dataValue: "",
            dataValueLabel: ""
          };
          if (_check.label === "INITIATOR") {
            _ele.dataValue = "${INITIATOR}";
            // _ele.dataTypeLabel = '${INITIATOR}';
          }
          this.showSelectedTable?.push(_ele);
        }
      });
      // 处理数据表格多余的类别
      this.showSelectedTable = this.showSelectedTable.filter(_table => select.includes(_table.dataType));
      this.constructData();
      this.updateElementMessage();
    },
    constructData() {
      userTaskForm.completeCandidateUsersTypes = this.showSelectedTable.map(item => item.dataType).join("&");
      userTaskForm.completeCandidateUsers = this.showSelectedTable.map(item => item.dataValue).join("&");
    },
    async getPostOptions() {
      const res = await listPost();
      this.postOptions = res.rows;
    },
    async getRoleOptions() {
      const res = await listRole();
      this.roleOptions = res.rows;
    },
    async getDeptTreeData() {
      function refactorTree(data) {
        return data.map(node => {
          let treeData = { id: String(node.id), label: node.label, parentId: node.parentId, weight: node.weight };
          if (node.children && node.children.length > 0) {
            treeData.children = refactorTree(node.children);
          }
          return treeData;
        });
      }

      return new Promise((resolve, reject) => {
        if (!this.deptTreeData || this.deptTreeData.length <= 0) {
          this.getDeptOptions().then(() => {
            this.deptTreeData = refactorTree(this.deptOptions);
            resolve();
          }).catch(() => {
            reject();
          });
        } else {
          resolve();
        }
      });
    },
    addUser() {
      this.userOpen = true;
    },
    selectedUserIds(selectedUserObj) {
      this.userOpen = false;
      // 表格赋值
      const userUserRow = this.showSelectedTable.find(_row => _row.dataType === selectedUserObj.dataType);
      if (userUserRow) {
        userUserRow.dataValue = selectedUserObj.candidateUsers || selectedUserObj.assignee;
        userUserRow.dataValueLabel = selectedUserObj.text;
      }
      this.constructData();
      this.updateElementMessage();
    },
    openOrClose(val) {
      this.userOpen = val;
    },
    copyNoticeChange(val) {
      if (val && val.length > 0) {
        userTaskForm.copyNoticeIds = val;
      }
      this.updateElementMessage();
    },
    completeNoticeChange(val) {
      if (val && val.length > 0) {
        userTaskForm.completeNoticeIds = val;
      }
      this.updateElementMessage();
    },
    postsChange() {
      this.constructData();
      this.updateElementMessage();
    },
    rolesChange(val) {
      this.constructData();
      this.updateElementMessage();
    },
    deptsChange() {
      this.constructData();
      this.updateElementMessage();
    },
    updateElementMessage() {
      const taskAttr = Object.create(null);
      for (let key in userTaskForm) {
        taskAttr[key] = userTaskForm[key];
      }
      console.log(taskAttr)
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr);
    },
    /**
     * 查询部门下拉树结构
     */
    getDeptOptions() {
      return new Promise((resolve, reject) => {
        if (!this.deptOptions || this.deptOptions.length <= 0) {
          deptTreeSelect().then(response => {
            this.deptTempOptions = response.data;
            this.deptOptions = response.data;
            resolve();
          });
        } else {
          reject();
        }
      });
    },
    async resetTaskForm() {
      const bpmnElementObj = this.bpmnElement?.businessObject;
      if (!bpmnElementObj) {
        return;
      }
      this.clearOptionsData();
      await this.queryUserList();
      // 开始赋值
      this.copyNoticeIds = bpmnElementObj["copyNoticeIds"];
      userTaskForm.copyNoticeIds = this.copyNoticeIds;
      this.completeNoticeIds = bpmnElementObj["completeNoticeIds"];
      userTaskForm.completeNoticeIds = this.completeNoticeIds;
      const returnDataType = bpmnElementObj["completeCandidateUsersTypes"];
      userTaskForm.completeCandidateUsersTypes = returnDataType;
      if (returnDataType) {
        this.dataType = returnDataType.split("&");
        this.dataType.forEach(_category => {
          const _category_obj = this.checkBoxGroupData.find(_c => _c.label === _category);
          const _table_data_row = {
            dataType: _category,
            dataTypeLabel: _category_obj.value,
            dataValue: "",
            dataValueLabel: ""
          };
          this.showSelectedTable.push(_table_data_row);
        });
      }
      const returnDataValues = bpmnElementObj["completeCandidateUsers"];
      userTaskForm.completeCandidateUsers = returnDataValues;
      if (returnDataValues) {
        const _data_array = returnDataValues.split("&");
        for (let i = 0; i < _data_array.length; i++) {
          const catetory = this.showSelectedTable[i].dataType;
          const _attr_str_v = _data_array[i].split(",");
          if (catetory === "USERS") {
            this.showSelectedTable[i].dataValueLabel = this.getUserNameStr(_attr_str_v);
            this.showSelectedTable[i].dataValue = _attr_str_v;
          } else if (catetory === "ROLES" || catetory === "DEPTS" || catetory === "POSTS") {
            this.showSelectedTable[i].dataValue = this.parseStrToNumberArray(_attr_str_v);
          } else if (catetory === "INITIATOR") {
            this.showSelectedTable[i].dataValue = _attr_str_v;
          }
        }
      }
    },
    parseStrToNumberArray(_attr_str_v) {
      let _attrV = [];
      _attr_str_v.forEach(_s => {
        // fix: 避免Long长度太大前端丢失精度的问题，前端统一使用字符串比较
        // _attrV.push(parseInt(_s));
        _attrV.push(_s);
      });
      return _attrV;
    },
    getUserNameStr(userIdStr) {
      const user_names = [];
      userIdStr.forEach(_id => {
        const findUser = this.userList.find(_user => _user.userId.toString() === _id);
        if (findUser) {
          user_names.push(findUser.nickName);
        }
      });
      return user_names.join(",");
    },
    /**
     * 清空选项数据
     */
    clearOptionsData() {
      this.copyNoticeIds = [];
      this.completeNoticeIds = [];
      this.dataType = [];
      this.showSelectedTable = [];
    },
    async queryUserList() {
      if(this.userList.length === 0) {
        const res = await selectUser();
        this.userList = res.rows;
      }
      this.loading = false;
    }
  },
  created() {
    this.getMsgTemplate();
    this.getPostOptions();
    this.getRoleOptions();
    this.getDeptTreeData();
    // this.queryUserList();
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.bpmnElement = window.bpmnInstances.bpmnElement;
        this.$nextTick(() => this.resetTaskForm());
      }
    }
  },
  beforeUnmount() {
    this.bpmnElement = null;
  }
};
</script>
<style scoped lang="scss"></style>

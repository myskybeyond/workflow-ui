<template>
  <div>
    <el-row>
      <h4><b>审批人设置</b></h4>
      <el-radio-group v-model="dataType" @change="changeDataType">
        <el-radio label="USERS">指定用户</el-radio>
        <el-radio label="ROLES">角色</el-radio>
        <el-radio label="DEPTS">部门</el-radio>
        <el-radio label="INITIATOR">发起人</el-radio>
        <el-radio label="POSTS">岗位</el-radio>
        <el-radio label="TASKASSIGN">动态指定</el-radio>
      </el-radio-group>
    </el-row>
    <el-row>
      <div v-if="dataType === 'USERS'">
        <el-tag v-for="(userText, index) in selectedUser.text" :key="userText" effect="plain" closable @close="removeAuditUser(userText, index)">
          {{ userText }}
        </el-tag>
        <div class="element-drawer__button">
          <el-button size="small" type="primary" icon="Plus" @click="onSelectUsers()">添加用户</el-button>
        </div>
      </div>
      <div v-if="dataType === 'ROLES'">
        <el-select v-model="roleIds" multiple size="small" placeholder="请选择 角色" @change="changeSelectRoles" filterable clearable>
          <el-option
            v-for="item in roleOptions"
            :key="item.roleId"
            :label="item.roleName"
            :value="`ROLE${item.roleId}`"
            :disabled="item.status === 1"
          >
          </el-option>
        </el-select>
      </div>
      <div v-if="dataType === 'DEPTS'">
        <el-tree-select
          :width="320"
          :height="400"
          size="small"
          :data="deptTreeData"
          multiple
          clearable
          checkStrictly
          nodeKey="id"
          v-model="deptIds"
          @change="checkedDeptChange"
        >
        </el-tree-select>
      </div>
      <div v-if="dataType === 'POSTS'">
        <el-select v-model="postIds" multiple size="small" placeholder="请选择 岗位" @change="changeSelectPosts" filterable clearable>
          <el-option
            v-for="item in postOptions"
            :key="item.postId"
            :label="item.postName"
            :value="`POST${item.postId}`"
            :disabled="item.status === 1"
          >
          </el-option>
        </el-select>
      </div>
    </el-row>
    <el-row>
      <div v-show="showMultiFlog">
        <el-divider />
        <h4><b>多实例审批方式</b></h4>
        <el-row>
          <el-radio-group v-model="multiLoopType" @change="changeMultiLoopType()" style="flex-direction: column; align-items: flex-start;">
            <el-row>
              <el-radio label="Null">无</el-radio>
            </el-row>
            <el-row>
              <el-radio label="SequentialMultiInstance">会签（需所有审批人同意）</el-radio>
            </el-row>
            <el-row>
              <el-radio label="ParallelMultiInstance">或签（默认一名审批人同意即可，支持自定义）</el-radio>
            </el-row>
          </el-radio-group>
        </el-row>
        <el-row v-if="multiLoopType !== 'Null'">
          <el-tooltip content="开启后，实例需按顺序轮流审批" placement="top-start" @click.stop.prevent>
            <i>
              <InfoFilled class="panel-tab-icon__title" />
            </i>
          </el-tooltip>
          <span class="custom-label">顺序审批：</span>
          <el-switch v-model="isSequential" @change="changeMultiLoopType()" />
        </el-row>
        <el-row v-if="multiLoopType !== 'Null'">
          <el-tooltip content="此处可设置或签时多少人同意为审批通过，默认为1" placement="top-start" @click.stop.prevent>
            <i>
              <InfoFilled class="panel-tab-icon__title" />
            </i>
          </el-tooltip>
          <span class="custom-label">自定义或签规则：</span>
          <el-input-number v-model="customAgreeNum" :step="1" step-strictly :min="1" size="small" @change="changeMultiLoopType()" />
        </el-row>
      </div>
    </el-row>
    <el-row>
      <div>
        <el-divider />
        <h4><b>消息模板</b></h4>
        <el-select v-model="receiveNoticeIds" size="small" placeholder="请选择 模板" clearable filterable @change="changeMsgTemplates">
          <el-option v-for="item in msgTemplateOptions" :key="item.id" :label="item.name" :value="item.id" :disabled="item.status === 1"></el-option>
        </el-select>
      </div>
    </el-row>
    <!-- 候选用户弹窗 -->
    <select-dept-user
      ref="showSelectedTableRef"
      title="候选用户"
      :show-user-panel="userOpen"
      @selectedUserIds="selectedUserIds"
      @openOrClose="openOrClose"
    />
  </div>
</template>

<script>
import { listUser, deptTreeSelect } from "@/api/system/user";
import { listRole } from "@/api/system/role";
import { listPost } from "@/api/system/post";
import { InfoFilled } from "@element-plus/icons-vue";
import { listSmsTemplateInfo } from "@/api/business/smsTemplateInfo";
import SelectDeptUser from "@/views/workflow/components/selectDeptUser.vue";
const userTaskForm = {
  dataType: "",
  assignee: "",
  candidateUsers: "",
  candidateGroups: "",
  text: "",
  completeNoticeIds: "",
  copyNoticeIds: "",
  receiveNoticeIds: "",
  completeCandidateUsers: "",
  completeText: ""
  // dueDate: '',
  // followUpDate: '',
  // priority: ''
};

export default {
  name: "UserTask",
  components: { SelectDeptUser, InfoFilled },
  props: {
    id: String,
    type: String
  },
  data() {
    return {
      loading: false,
      loadingTreeData: false,
      dataType: "USERS",
      selectedUser: {
        ids: [],
        text: []
      },
      userOpen: false,
      deptName: undefined,
      deptOptions: [],
      deptProps: {
        children: "children",
        label: "label"
      },
      deptTempOptions: [],
      userTableList: [],
      userTotal: 0,
      selectedUserData: [],
      roleOptions: [],
      roleIds: [],
      deptTreeData: [],
      deptIds: [],
      postIds: [],
      // 查询参数
      queryParams: {
        deptId: undefined,
        userName: undefined
      },
      showMultiFlog: false,
      isSequential: false,
      multiLoopType: "Null",
      postOptions: [],
      customAgreeNum: 1,
      receiveNoticeIds: [],
      msgTemplateOptions: []
    };
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.bpmnElement = window.bpmnInstances.bpmnElement;
        this.$nextTick(() => this.resetTaskForm());
      }
    },
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    }
  },
  beforeUnmount() {
    this.bpmnElement = null;
  },
  mounted() {
    this.getMsgTemplate();
  },
  methods: {
    resetTaskForm() {
      this.showMultiFlog = false;
      const bpmnElementObj = this.bpmnElement?.businessObject;
      if (!bpmnElementObj) {
        return;
      }
      this.clearOptionsData();
      this.dataType = bpmnElementObj["dataType"];
      if (this.dataType === "USERS") {
        let userIdData = bpmnElementObj["candidateUsers"] || bpmnElementObj["assignee"];
        let userText = bpmnElementObj["text"] || [];
        if (userIdData && userIdData.toString().length > 0 && userText && userText.length > 0) {
          this.selectedUser.ids = userIdData?.toString().split(",");
          this.selectedUser.text = userText?.split(",");
        }
        if (this.selectedUser.ids.length > 1) {
          this.showMultiFlog = true;
        }
      } else if (this.dataType === "ROLES") {
        this.getRoleOptions();
        let roleIdData = bpmnElementObj["candidateGroups"] || [];
        if (roleIdData && roleIdData.length > 0) {
          this.roleIds = roleIdData.split(",");
        }
        this.showMultiFlog = true;
      } else if (this.dataType === "DEPTS") {
        this.getDeptTreeData();
        let deptIdData = bpmnElementObj["candidateGroups"] || [];
        if (deptIdData && deptIdData.length > 0) {
          this.deptIds = deptIdData.split(",");
        }
        this.showMultiFlog = true;
      } else if (this.dataType === "POSTS") {
        this.getPostOptions();
        let postIdData = bpmnElementObj["candidateGroups"] || [];
        if (postIdData && postIdData.length > 0) {
          this.postIds = postIdData.split(",");
        }
        this.showMultiFlog = true;
      }
      this.getElementLoop(bpmnElementObj);
      if (bpmnElementObj["receiveNoticeIds"]) {
        this.receiveNoticeIds = bpmnElementObj["receiveNoticeIds"];
      }
    },
    /**
     * 清空选项数据
     */
    clearOptionsData() {
      this.selectedUser.ids = [];
      this.selectedUser.text = [];
      this.roleIds = [];
      this.deptIds = [];
      this.postIds = [];
      this.receiveNoticeIds = [];
    },
    /**
     * 跟新节点数据
     */
    updateElementTask() {
      const taskAttr = Object.create(null);
      for (let key in userTaskForm) {
        taskAttr[key] = userTaskForm[key];
      }
      //  && this.dataType === 'USERS'
      if(!taskAttr['assignee'] && this.multiLoopType !== 'Null') {
        taskAttr['assignee'] = '${assignee}';
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr);
    },
    /**
     * 查询部门下拉树结构
     */
    getDeptOptions() {
      return new Promise((resolve, reject) => {
        if (!this.deptOptions || this.deptOptions.length <= 0) {
          this.loadingTreeData = true;
          deptTreeSelect().then(response => {
            this.deptTempOptions = response.data;
            this.deptOptions = response.data;
            this.loadingTreeData = false;
            resolve();
          });
        } else {
          reject();
        }
      });
    },
    /**
     * 查询部门下拉树结构（含部门前缀）
     */
    getDeptTreeData() {
      function refactorTree(data) {
        return data.map(node => {
          let treeData = { id: `DEPT${node.id}`, label: node.label, parentId: node.parentId, weight: node.weight };
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
    /**
     * 查询部门下拉树结构
     */
    getRoleOptions() {
      if (!this.roleOptions || this.roleOptions.length <= 0) {
        listRole().then(response => this.roleOptions = response.rows);
      }
    },
    /**
     * 查询岗位下拉数结构
     */
    getPostOptions() {
      if (!this.postOptions || this.postOptions.length <= 0) {
        listPost().then(response => this.postOptions = response.rows);
      }
    },
    /**
     * 查询通知消息模板
     */
    getMsgTemplate() {
      if (!this.msgTemplateOptions || this.msgTemplateOptions.length <= 0) {
        listSmsTemplateInfo().then(response => this.msgTemplateOptions = response.rows);
      }
    },
    /** 查询用户列表 */
    getUserList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.loading = false;
        this.userTableList = response.rows;
        this.userTotal = response.total;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getUserList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectedUserData = selection;
    },
    onSelectUsers() {
      this.selectedUserData = [];
      this.$refs.multipleTable?.clearSelection();
      this.getDeptOptions();
      this.getUserList();
      this.userOpen = true;
    },
    changeSelectRoles(val) {
      let groups = null;
      let text = null;
      if (val && val.length > 0) {
        userTaskForm.dataType = "ROLES";
        groups = val.join() || null;
        let textArr = this.roleOptions.filter(k => val.indexOf(`ROLE${k.roleId}`) >= 0);
        text = textArr?.map(k => k.roleName).join() || null;
      } else {
        userTaskForm.dataType = null;
        this.multiLoopType = "Null";
      }
      userTaskForm.candidateGroups = groups;
      userTaskForm.text = text;
      this.updateElementTask();
      this.changeMultiLoopType();
    },
    changeSelectPosts(val) {
      let groups = null;
      let text = null;
      if (val && val.length > 0) {
        userTaskForm.dataType = "POSTS";
        groups = val.join() || null;
        let textArr = this.postOptions.filter(k => val.indexOf(`POST${k.postId}`) >= 0);
        text = textArr?.map(k => k.postName).join() || null;
      } else {
        userTaskForm.dataType = null;
        this.multiLoopType = "Null";
      }
      userTaskForm.candidateGroups = groups;
      userTaskForm.text = text;
      this.updateElementTask();
      this.changeMultiLoopType();
    },
    checkedDeptChange(checkedIds) {
      let groups = null;
      let text = null;
      this.deptIds = checkedIds;
      if (checkedIds && checkedIds.length > 0) {
        userTaskForm.dataType = "DEPTS";
        groups = checkedIds.join() || null;
        let textArr = [];
        let treeStarkData = JSON.parse(JSON.stringify(this.deptTreeData));
        checkedIds.forEach(id => {
          let stark = [];
          stark = stark.concat(treeStarkData);
          while (stark.length) {
            let temp = stark.shift();
            if (temp.children) {
              stark = temp.children.concat(stark);
            }
            if (id === temp.id) {
              textArr.push(temp);
            }
          }
        });
        text = textArr?.map(k => k.label).join() || null;
      } else {
        userTaskForm.dataType = null;
        this.multiLoopType = "Null";
      }
      userTaskForm.candidateGroups = groups;
      userTaskForm.text = text;
      this.updateElementTask();
      this.changeMultiLoopType();
    },
    changeDataType(val) {
      this.showMultiFlog = val === "ROLES" || val === "DEPTS" || (val === "USERS" && this.selectedUser.ids.length > 1) || val === "POSTS";
      this.multiLoopType = "Null";
      this.changeMultiLoopType();
      this.constructUserTaskFrom();
      this.updateElementTask();
    },
    getElementLoop(businessObject) {
      if (!businessObject.loopCharacteristics) {
        this.multiLoopType = "Null";
        return;
      }
      this.isSequential = businessObject.loopCharacteristics.isSequential;
      if (businessObject.loopCharacteristics.completionCondition) {
        if (businessObject.loopCharacteristics.completionCondition.body === "${nrOfCompletedInstances >= nrOfInstances}") {
          this.multiLoopType = "SequentialMultiInstance";
        } else {
          this.multiLoopType = "ParallelMultiInstance";
          /**
           * 解析或签自定义条件
           * 暂按固定字符串格式解析 pattern: ${nrOfCompletedInstances >= 12}
           */
          this.customAgreeNum = parseInt(this.extractNumberFromString(businessObject.loopCharacteristics.completionCondition.body));
        }
      }
    },
    changeMultiLoopType() {
      // 取消多实例配置
      if (this.multiLoopType === "Null") {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, { loopCharacteristics: null, assignee: null });
        return;
      }
      this.multiLoopInstance = window.bpmnInstances.moddle.create("bpmn:MultiInstanceLoopCharacteristics", { isSequential: this.isSequential });
      // 更新多实例配置
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        loopCharacteristics: this.multiLoopInstance,
        assignee: "${assignee}"
      });
      // 完成条件
      let completionCondition = null;
      // 会签
      if (this.multiLoopType === "SequentialMultiInstance") {
        completionCondition = window.bpmnInstances.moddle.create("bpmn:FormalExpression", { body: "${nrOfCompletedInstances >= nrOfInstances}" });
      }
      // 或签
      if (this.multiLoopType === "ParallelMultiInstance") {
        completionCondition = window.bpmnInstances.moddle.create("bpmn:FormalExpression", { body: "${nrOfCompletedInstances >= " + this.customAgreeNum + "}" });
      }
      // 更新模块属性信息
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, {
        collection: "${multiInstanceHandler.getUserIds(execution)}",
        elementVariable: "assignee",
        completionCondition
      });
    },
    extractNumberFromString(str) {
      const start_index = str.indexOf(">=");
      const end_index = str.indexOf("}");
      return str.substring(start_index + 2, end_index).trim();
    },
    changeMsgTemplates(val) {
      this.constructUserTaskFrom();
      this.updateElementTask();
    },
    constructUserTaskFrom() {
      // 清空 userTaskForm 所有属性值
      Object.keys(userTaskForm).forEach(key => userTaskForm[key] = null);
      userTaskForm.dataType = this.dataType;
      userTaskForm.receiveNoticeIds = this.receiveNoticeIds;
      if (this.dataType === "USERS") {
        if (this.selectedUser && this.selectedUser.ids && this.selectedUser.ids.length > 0) {
          if (this.selectedUser.ids.length === 1) {
            userTaskForm.assignee = this.selectedUser.ids[0];
          } else {
            userTaskForm.candidateUsers = this.selectedUser.ids.join();
          }
          userTaskForm.text = this.selectedUser.text?.join() || null;
        }
      } else if (this.dataType === "ROLES") {
        this.getRoleOptions();
        if (this.roleIds && this.roleIds.length > 0) {
          userTaskForm.candidateGroups = this.roleIds.join() || null;
          let textArr = this.roleOptions.filter(k => this.roleIds.indexOf(`ROLE${k.roleId}`) >= 0);
          userTaskForm.text = textArr?.map(k => k.roleName).join() || null;
        }
      } else if (this.dataType === "DEPTS") {
        this.getDeptTreeData();
        if (this.deptIds && this.deptIds.length > 0) {
          userTaskForm.candidateGroups = this.deptIds.join() || null;
          let textArr = [];
          let treeStarkData = JSON.parse(JSON.stringify(this.deptTreeData));
          this.deptIds.forEach(id => {
            let stark = [];
            stark = stark.concat(treeStarkData);
            while (stark.length) {
              let temp = stark.shift();
              if (temp.children) {
                stark = temp.children.concat(stark);
              }
              if (id === temp.id) {
                textArr.push(temp);
              }
            }
          });
          userTaskForm.text = textArr?.map(k => k.label).join() || null;
        }
      } else if (this.dataType === "INITIATOR") {
        userTaskForm.assignee = "${initiator}";
        userTaskForm.text = "流程发起人";
      } else if (this.dataType === "POSTS") {
        this.getPostOptions();
        if (this.postIds && this.postIds.length > 0) {
          userTaskForm.candidateGroups = this.postIds.join() || null;
          let textArr = this.postOptions.filter(k => this.postIds.indexOf(`POST${k.postId}`) >= 0);
          userTaskForm.text = textArr?.map(k => k.postName).join() || null;
        }
      } else if (this.dataType === "TASKASSIGN") {
        userTaskForm.assignee = "${userId}";
        userTaskForm.text = "动态指定";
      }
    },
    removeAuditUser(removeUser, index) {
      userTaskForm.dataType = "USERS";
      userTaskForm.receiveNoticeIds = this.receiveNoticeIds;
      this.selectedUser.ids.splice(index, 1);
      this.selectedUser.text.splice(index, 1);
      // 候选用户大于1个时展示多实例任务设置
      if (this.selectedUser.ids.length <= 1) {
        this.showMultiFlog = false;
        this.multiLoopType = "Null";
      } else {
        this.showMultiFlog = true;
      }
      // 更新数据
      if (this.selectedUser.ids.length === 1) {
        userTaskForm.assignee = this.selectedUser.ids[0];
        userTaskForm.text = this.selectedUser.text[0];
        userTaskForm.candidateUsers = null;
      } else {
        userTaskForm.candidateUsers = this.selectedUser.ids.join() || null;
        userTaskForm.text = this.selectedUser.text.join() || null;
        userTaskForm.assignee = null;
      }
      this.changeMultiLoopType();
      this.updateElementTask();
    },
    openOrClose(val) {
      this.userOpen = val;
    },
    selectedUserIds(val1, val2) {
      if (!val2 || val2.length <= 0) {
        this.$modal.msgError("请选择用户");
        return;
      }
      // 去重
      val2 = val2.filter(userObj =>
        !this.selectedUser.ids.includes(String(userObj.userId))
      );
      userTaskForm.dataType = "USERS";
      userTaskForm.receiveNoticeIds = this.receiveNoticeIds;
      this.selectedUser.text = [ ...this.selectedUser.text, ...val2.map(k => k.nickName) || []];
      this.selectedUser.ids = [ ...this.selectedUser.ids, ...val2.map(k => k.userId) || []];
      if (this.selectedUser.ids.length === 1) {
        userTaskForm.assignee = this.selectedUser.ids[0];
        userTaskForm.text = this.selectedUser.text[0];
        userTaskForm.candidateUsers = null;
        this.showMultiFlog = false;
        this.multiLoopType = "Null";
      } else {
        userTaskForm.candidateUsers = this.selectedUser.ids.join() || null;
        userTaskForm.text = this.selectedUser.text.join() || null;
        userTaskForm.assignee = null;
        this.showMultiFlog = true;
      }
      this.changeMultiLoopType();
      this.updateElementTask();
      this.userOpen = false;
    }
  }
};
</script>

<style scoped lang="scss">
.el-row .el-radio-group {
  margin-bottom: 15px;

  .el-radio {
    line-height: 28px;
  }
}

.el-tag {
  margin-bottom: 10px;

  + .el-tag {
    margin-left: 10px;
  }
}

.custom-label {
  padding-left: 5px;
  font-weight: 500;
  font-size: 12px;
  color: #606266;
  padding-top: 3px;
}

.panel-tab-icon__title {
  width: 1em;
  height: 1em;
  margin: -3px;

  &_svg {
    margin: -1.8px -2px;
  }
}
</style>

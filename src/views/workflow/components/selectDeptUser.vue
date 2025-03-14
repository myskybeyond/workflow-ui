<template>
  <div>
    <!-- 候选用户弹窗 -->
    <el-dialog :title="title" width="60%" v-model="userOpen" append-to-body @close="cancel">
      <el-row type="flex" :gutter="20">
        <!--部门数据-->
        <el-col :span="7">
          <el-card shadow="never" style="height: 100%">
            <template v-slot:header>
              <span>部门列表</span>
            </template>
            <div class="head-container">
              <el-input v-model="deptName" placeholder="请输入部门名称" clearable prefix-icon="Search" style="margin-bottom: 20px" />
              <el-tree
                v-loading="loadingTreeData"
                :data="deptOptions"
                :props="deptProps"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                node-key="id"
                :default-expanded-keys="deptDefaultExpandedKeys"
                ref="tree"
                @node-click="handleNodeClick"
              />
            </div>
          </el-card>
        </el-col>
        <el-col :span="17">
          <div style="width: 260px; margin: 0 5px 5px 0; display: flex;">
            <el-input prefix-icon="Search" v-model="queryParams.userName" placeholder="用户账号" clearable />
            <el-button style="margin-left: 5px;" type="primary" icon="Search" @click="getUserList()">搜索</el-button>
          </div>
          <el-table
            v-loading="loading"
            ref="multipleTable"
            height="600"
            :data="userTableList"
            highlight-current-row
            border
            @current-change="changeCurrentUser"
            @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="userDataType === 'copy' || userDataType === 'next'" type="selection" width="50" align="center" />
            <el-table-column v-else width="30">
              <template #default="scope">
                <el-radio :label="scope.row.userId" v-model="currentUserId">{{ "" }}</el-radio>
              </template>
            </el-table-column>
            <el-table-column label="用户账号" align="center" prop="userName" />
            <el-table-column label="用户姓名" align="center" prop="nickName" />
            <el-table-column label="部门" align="center" prop="deptName" />
          </el-table>
          <pagination :total="userTotal" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getUserList" />
        </el-col>
      </el-row>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleTaskUserComplete">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { selectUser, deptTreeSelect } from "@/api/system/user";

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
  name: "SelectDeptUser",
  props: {
    showUserPanel: Boolean,
    title: {
      type: String,
      required: false,
      default: "候选用户"
    },
    userDataType: {
      type: String,
      required: false,
      default: "copy" //默认多选框
    },
    checkedUsers: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
      loading: false,
      loadingTreeData: false,
      userOpen: false,
      deptName: undefined,
      deptOptions: [],
      deptProps: {
        children: "children",
        label: "label"
      },
      userTableList: [],
      userTotal: 0,
      selectedUserData: [],
      // 查询参数
      queryParams: {
        deptId: undefined,
        userName: undefined
      },
      selectedUser: {
        ids: [],
        text: []
      },
      currentUserId: null,
      deptDefaultExpandedKeys: []
    };
  },
  watch: {
    showUserPanel: {
      immediate: true,
      handler(val) {
        if (val) {
          this.onSelectUsers();
        }
      }
    },
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
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
    /** 查询用户列表 */
    async getUserList() {
      this.loading = true;
      selectUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.userTableList = response.rows;
        this.userTotal = response.total;
        this.toggleSelection(this.checkedUsers);
        this.loading = false;
      });
    },
    handleTaskUserComplete() {
      userTaskForm.dataType = "USERS";
      // 复选用户
      if (this.userDataType === "copy" || this.userDataType === "next") {
        if (!this.selectedUserData || this.selectedUserData.length <= 0) {
          this.$modal.msgError("请选择用户");
          return false;
        }
        this.selectedUser.text = this.selectedUserData.map(k => k.nickName) || [];
        if (this.selectedUserData.length === 1) {
          let data = this.selectedUserData[0];
          userTaskForm.assignee = data.userId;
          userTaskForm.text = data.nickName;
          userTaskForm.candidateUsers = null;
        } else {
          userTaskForm.candidateUsers = this.selectedUserData.map(k => k.userId).join() || null;
          userTaskForm.text = this.selectedUserData.map(k => k.nickName).join() || null;
          userTaskForm.assignee = null;
          this.showMultiFlog = true;
        }
        this.$emit("selectedUserIds", userTaskForm, this.selectedUserData);
      } else {
        // 单选用户
        if (!this.currentUserId) {
          this.$modal.msgError("请选择用户");
          return false;
        }
        this.$emit("selectedUserId", this.currentUserId);
      }
      this.userOpen = false;
    },
    cancel() {
      this.userOpen = false;
      this.$emit("openOrClose", this.userOpen);
    },
    onSelectUsers() {
      this.selectedUserData = [];
      this.$refs.multipleTable?.clearSelection();
      this.getDeptOptions();
      this.getUserList();
      this.userOpen = true;
    },
    /**
     * 查询部门下拉树结构
     */
    async getDeptOptions() {
      if (!this.deptOptions || this.deptOptions.length <= 0) {
        this.loadingTreeData = true;
        await deptTreeSelect().then(response => {
          this.deptOptions = response.data;
          // 默认展开第一层级和第一个层级下的第一个
          this.getLevelOneFirstAndLevelTwoFirstIds(this.deptOptions);
          this.loadingTreeData = false;
        });
      }
    },
    changeCurrentUser(val) {
      if(val) {
        this.currentUserId = val.userId;
      }
    },
    toggleSelection(selection) {
      if (selection && selection.length > 0) {
        this.$nextTick(() => {
          selection.forEach(item => {
            let row = this.userTableList.find(k => k.userId === item.userId);
            this.$refs.multipleTable.toggleRowSelection(row);
          });
        });
      } else {
        this.$nextTick(() => {
          this.$refs.multipleTable.clearSelection();
        });
      }
    },
    getLevelOneFirstAndLevelTwoFirstIds(deptTreeData) {
      this.deptDefaultExpandedKeys = [];
      if(deptTreeData && deptTreeData.length > 0) {
        this.deptDefaultExpandedKeys.push(deptTreeData[0].id);
        if(deptTreeData[0].children) {
          this.deptDefaultExpandedKeys.push(deptTreeData[0].children[0].id);
        }
      }
    }
  },
  created() {
  }
};
</script>

<style scoped lang="scss"></style>

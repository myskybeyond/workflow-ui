<template>
  <div class="message_of_user_task panel-tab__content">
    <h4><b style="color: red;">节点抄送</b></h4>
    <h4><b>消息模板</b></h4>
    <el-select v-model="copyNoticeIds" size="small" placeholder="请选择 模板" clearable style="width: 240px;" @change="copyNoticeChange">
      <el-option v-for="item in msgTemplateOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
    </el-select>
  </div>
  <div class="message_of_user_task">
    <h4><b style="color: red;">节点通知</b></h4>
    <el-row>
      <el-checkbox-group v-model="dataType" @change="multipleValChange">
        <el-checkbox v-for="item in checkBoxGroupData" :key="item.label" :label="item.label">{{ item.value }} </el-checkbox>
      </el-checkbox-group>
    </el-row>
    <el-row>
      <el-table v-if="showSelectedTable.length > 0" ref="showSelectedTableRef" :data="showSelectedTable">
        <el-table-column label="类型" prop="dataTypeLabel" :show-overflow-tooltip="true" width="90" />
        <el-table-column label="类型内容" prop="dataValueLabel" :show-overflow-tooltip="true" width="220">
          <template #default="scope">
            <div v-if="scope.row.dataType==='USERS'">
              <el-input autosize readonly v-model="scope.row.dataValueLabel" style="width: 140px;" :show-overflow-tooltip="true" />
              <el-button style="float: right;" size="small" type="primary" @click="addUser">添加 </el-button>
            </div>
            <el-select
              v-else-if="scope.row.dataType==='POSTS'"
              v-model="scope.row.dataValue"
              multiple
              size="small"
              placeholder="请选择 岗位"
              @change="postsChange"
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
            >
              <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId"></el-option>
            </el-select>
            <el-tree-select
              v-else-if="scope.row.dataType==='DEPTS'"
              v-model="scope.row.dataValue"
              :data="deptOptions"
              :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
              value-key="deptId"
              placeholder="选择部门"
              check-strictly
              multiple
              @change="deptsChange"
            />
            <el-input v-else-if="scope.row.dataType==='INITIATOR'" readonly v-model="scope.row.dataValue" style="width: 170px;"></el-input>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <h4><b>消息模板</b></h4>
    <el-select v-model="completeNoticeIds" size="small" placeholder="请选择 模板" clearable style="width: 240px;" @change="completeNoticeChange">
      <el-option v-for="item in msgTemplateOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
    </el-select>
  </div>
  <select-dept-user ref="showSelectedTableRef" :show-user-panel="userOpen" @selectedUserIds="selectedUserIds" @openOrClose="openOrClose" />
</template>
<script setup lang="ts">

import SelectDeptUser from "@/views/workflow/components/selectDeptUser.vue";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { listSmsTemplateInfo } from "@/api/business/smsTemplateInfo";
import { SmsTemplateInfoVO } from "@/api/business/smsTemplateInfo/types";
import { PostVO } from "@/api/system/post/types";
import { listPost } from "@/api/system/post";
import { listRole } from "@/api/system/role";
import { RoleVO } from "@/api/system/role/types";
import { listDept } from "@/api/system/dept";
import { DeptVO } from "@/api/system/dept/types";

const msgTemplateOptions = ref<SmsTemplateInfoVO[]>([]);
const showSelectedTableRef = ref<any>();
const completeNoticeIds = ref([]);
const copyNoticeIds = ref([]);
const dataType = ref([]);
const userOpen = ref(false);
const postOptions = ref<PostVO[]>([]);
const roleOptions = ref<RoleVO[]>([]);
const deptOptions = ref<any>([]);
const userTaskForm = ref({
  completeNoticeIds: "",
  copyNoticeIds: "",
  completeCandidateUsers: [],
  completeCandidateUsersTypes: [],
  completeText: ""
});
const checkBoxGroupData = ref<any>([
  { label: "USERS", value: "指定用户" },
  { label: "ROLES", value: "角色" },
  { label: "DEPTS", value: "部门" },
  { label: "INITIATOR", value: "发起人" },
  { label: "POSTS", value: "岗位" }
]);

interface SelectedObj {
  dataType: string | undefined;
  dataTypeLabel: string | undefined;
  dataValue: string | undefined;
  dataValueLabel: string | undefined;
}

const initRowData: SelectedObj = {
  dataType: undefined,
  dataTypeLabel: undefined,
  dataValue: undefined,
  dataValueLabel: undefined
};

const dataRowType = reactive<SelectedObj>({
  ...initRowData
});

const showSelectedTable = ref<SelectedObj[]>([]);

const getMsgTemplate = async () => {
  const res = await listSmsTemplateInfo();
  msgTemplateOptions.value = res.rows;
};

const multipleValChange = (select: CheckboxValueType[]) => {
  select.forEach(s => {
    const _select = showSelectedTable.value?.find((_row) => _row.dataType === s);
    if (!_select) {
      const _check = checkBoxGroupData.value.find((_c) => _c.label === s);
      const _ele = {
        dataType: s.toString(),
        dataTypeLabel: _check.value,
        dataValue: '',
        dataValueLabel: ''
      };
      if(_check.label === 'INITIATOR') {
        _ele.dataValue = '${INITIATOR}';
        // _ele.dataTypeLabel = '${INITIATOR}';
      }
      showSelectedTable.value?.push(_ele);
    }
  });
  // 处理数据表格多余的类别
  showSelectedTable.value = showSelectedTable.value.filter(_table => select.includes(_table.dataType));
  updateElementMessage();
};

const getPostOptions = async () => {
  const res = await listPost();
  postOptions.value = res.rows;
};
const getRoleOptions = async () => {
  const res = await listRole();
  roleOptions.value = res.rows;
};

const getDeptTreeData = async () => {
  const res = await listDept();
  const data = proxy?.handleTree<DeptVO>(res.data, "deptId", "parentId");
  if(data) {
    deptOptions.value = data;
  }
};
const addUser = () => {
  userOpen.value = true;
};
const selectedUserIds = (selectedUserObj: any) => {
  console.log(selectedUserObj);
  userOpen.value = false;
  // 表格赋值
  const userUserRow = showSelectedTable.value.find(_row => _row.dataType === selectedUserObj.dataType);
  if(userUserRow) {
    userUserRow.dataValue = selectedUserObj.candidateUsers;
    userUserRow.dataValueLabel = selectedUserObj.text;
  }
  updateElementMessage();
};
const openOrClose = (val : any) => {
  userOpen.value = val;
};
const copyNoticeChange = () => {
  updateElementMessage();
};
const completeNoticeChange = () => {
  updateElementMessage();
};
const postsChange = () => {
  updateElementMessage();
};
const rolesChange = () => {
  updateElementMessage();
};
const deptsChange = () => {
  updateElementMessage();
};
const updateElementMessage = () => {
  console.log(userTaskForm.value + 'updateElementMessage');
  proxy?.$emit('messageParams',userTaskForm.value)
}
onMounted(() => {
  getMsgTemplate();
  getPostOptions();
  getRoleOptions();
  getDeptTreeData();
});
</script>

<style scoped lang="scss">
.message_of_user_task {
  padding: 8px 16px;
}
</style>

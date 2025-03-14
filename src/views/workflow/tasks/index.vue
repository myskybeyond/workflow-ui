<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!--模型分类树-->
      <el-col :lg="4" :xs="24" style="">
        <flow-strategy-tree :category-tree-options="categoryTreeOptions" @passCategory="receiveStrategy" :related-obj="groupByCategory" />
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div class="search" v-show="showSearch">
            <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
              <el-form-item label="流程编号" prop="taskId">
                <el-input v-model="queryParams.taskId" placeholder="请输入" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="流程名称" prop="processName">
                <el-input v-model="queryParams.processName" placeholder="请输入流程名称" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="接收时间">
                <el-date-picker
                  v-model="dateRange"
                  style="width: 240px"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="defaultTime"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="任务状态" prop="taskState">
                <el-select v-model="queryParams.taskState" clearable>
                  <el-option v-for="dict in wf_task_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </transition>
        <el-card shadow="never">
          <el-table v-loading="loading" :data="tableDataList">
            <el-table-column type="index" width="55" align="center" label="序号" />
            <el-table-column label="流程编号" align="center" prop="taskId" :show-overflow-tooltip="true" />
            <el-table-column label="流程名称" align="center" prop="procDefName" />
            <el-table-column label="流程分类" align="center" prop="category">
              <template #default="scope">
                {{ categoryFormat(scope.row.category, categoryOptions) }}
              </template>
            </el-table-column>
            <el-table-column label="流程版本" align="center">
              <template #default="scope">
                <el-tag>v{{ scope.row.procDefVersion }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="任务状态" align="center">
              <template #default="scope">
                <dict-tag :options="wf_task_status" :value="scope.row.taskStatus" />
              </template>
            </el-table-column>
            <el-table-column label="当前节点" align="center" prop="taskName" />
            <el-table-column label="接收时间" align="center" prop="createTime" width="180" />
            <el-table-column label="流程发起人" align="center">
              <template #default="scope">
                {{ getUserNameById(scope.row.startUserId) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  icon="VideoPause"
                  @click="handleAssume(scope.row)"
                  v-hasPermi="['workflow:task:assume']"
                  v-if="scope.row.taskStatus !== 'suspended'"
                  >挂起
                </el-button>
                <el-button
                  type="primary"
                  link
                  icon="VideoPlay"
                  @click="handleActive(scope.row)"
                  v-hasPermi="['workflow:task:active']"
                  v-if="scope.row.taskStatus === 'suspended'"
                  >激活
                </el-button>
                <el-button
                  type="primary"
                  link
                  icon="ChatDotSquare"
                  @click="handleDelegate(scope.row)"
                  v-hasPermi="['workflow:process:approval']"
                  v-if="scope.row.taskStatus === 'created'"
                  >委派
                </el-button>
                <el-button
                  type="primary"
                  link
                  icon="Pointer"
                  @click="handleTransfer(scope.row)"
                  v-hasPermi="['workflow:process:approval']"
                  v-if="scope.row.taskStatus === 'created'"
                  >转办
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>
    <select-dept-user
      ref="showSelectedTableRef"
      :title="userData.title"
      :key="userData.title"
      :show-user-panel="userData.open"
      :user-data-type="userData.type"
      @selectedUserId="submitUser"
      @openOrClose="openOrClose"
    />
  </div>
</template>

<script setup lang="ts" name="Tasks">
import { listTask } from "@/api/workflow/work/process";
import { addDateRange } from "@/utils/ruoyi";
import FlowStrategyTree from "@/views/workflow/components/FlowStrategyTree.vue";
import { totalTaskGroupByCategory } from "@/api/workflow/category";
import {
  categoryFormat,
  commonVariables,
  flowCategoryQuery,
  flowCategoryTotalQuery
} from "@/api/workflow/mixins/workFlowMixins";
import { active, assume, close, delegate, transfer } from "@/api/workflow/work/task";
import SelectDeptUser from "@/views/workflow/components/selectDeptUser.vue";
import { ref } from "vue";
import { getUserNameById } from "@/utils/userCommonUtil";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_task_status } = toRefs<any>(proxy?.useDict("wf_task_status"));
const { categoryOptions, categoryTreeOptions } = flowCategoryQuery();
/** 按流程分类统计业务数据 */
const totalGroupByCategory = async () => {
  return await totalTaskGroupByCategory();
};
const { groupByCategory } = flowCategoryTotalQuery(totalGroupByCategory);
const {
  total,
  loading,
  showSearch,
  dateRange,
  tableDataList,
  defaultTime,
  queryFormRef
} = commonVariables();
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  processName: null,
  category: undefined,
  taskId: undefined,
  taskState: undefined
});
const taskForm = ref({
  comment: "", // 意见内容
  procInsId: "", // 流程实例编号
  taskId: "",// 流程任务编号
  copyUserIds: "", // 抄送人Id
  vars: "",
  targetKey: "",
  userId: ""
});
const getList = async () => {
  loading.value = true;
  const res = await listTask(addDateRange(queryParams.value, dateRange.value ? [...dateRange.value] : []));
  tableDataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
const userData = ref({
  title: "",
  type: "",
  open: false
});
const submitUser = async (userId: string) => {
  taskForm.value.userId = userId;
  let type = userData.value.type;
  if (type === "delegate") {
    const res = await delegate(taskForm.value);
    userData.value.open = false;
    proxy?.$modal.msgSuccess(res.msg);
    await getList();
  } else if (type === "transfer") {
    const res = await transfer(taskForm.value);
    userData.value.open = false;
    proxy?.$modal.msgSuccess(res.msg);
    await getList();
  } else {
    proxy?.$modal.msgWarning("不支持的操作 " + type);
  }
};
const resetQuery = () => {
  dateRange.value = "";
  queryFormRef.value?.resetFields();
  handleQuery();
};
const receiveStrategy = (category: undefined) => {
  queryParams.value.category = category;
  handleQuery();
};
onMounted(() => {
  getList();
});
/** 挂起/激活流程 */
const handleAssume = async (row: any) => {
  const params = {
    procInsId: row.procInsId,
    taskId: row.taskId
  };
  const res = await assume(params);
  proxy?.$modal.msgSuccess(res.msg);
  await getList();
};
const handleActive = async (row: any) => {
  const params = {
    procInsId: row.procInsId,
    taskId: row.taskId
  };
  const res = await active(params);
  proxy?.$modal.msgSuccess(res.msg);
  await getList();
};
const handleDelegate = (row: any) => {
  taskForm.value = {};
  userData.value.type = "delegate";
  userData.value.title = "请选择委派人";
  taskForm.value.taskId = row.taskId;
  taskForm.value.procInsId = row.procInsId;
  userData.value.open = true;
};
const handleTransfer = (row: any) => {
  taskForm.value = {};
  userData.value.type = "transfer";
  userData.value.title = "请选择转办人";
  taskForm.value.taskId = row.taskId;
  taskForm.value.procInsId = row.procInsId;
  userData.value.open = true;
};
const openOrClose = (val: any) => {
  userData.value.open = val;
}
</script>

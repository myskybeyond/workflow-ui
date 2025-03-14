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
              <el-form-item label="流程编号" prop="processInstanceId">
                <el-input v-model="queryParams.processInstanceId" placeholder="请输入流程编号" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="流程名称" prop="processName">
                <el-input v-model="queryParams.processName" placeholder="请输入流程名称" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="发起时间">
                <el-date-picker
                  v-model="dateRange"
                  style="width: 240px"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :default-time="defaultTime"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="发起人" prop="startUserId">
                <el-select v-model="queryParams.startUserId" clearable placeholder="请选择" filterable>
                  <el-option v-for="user in userSelectOptions" :key="user.userId" :label="user.nickName" :value="user.userId" />
                </el-select>
              </el-form-item>
              <el-form-item label="流程状态" prop="state">
                <el-select v-model="queryParams.state" clearable>
                  <el-option v-for="dict in wf_process_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-table-column label="流程编号" align="center" prop="procInsId" :show-overflow-tooltip="true" />
            <el-table-column label="流程名称" align="center" prop="procDefName" :show-overflow-tooltip="true" />
            <el-table-column label="流程分类" align="center" prop="category">
              <template #default="scope">
                {{ categoryFormat(scope.row.category, categoryOptions) }}
              </template>
            </el-table-column>
            <el-table-column label="流程版本" align="center" width="80px">
              <template #default="scope">
                <el-tag>v{{ scope.row.procDefVersion }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="发起人" align="center">
              <template #default="scope">
                {{ getUserNameById(scope.row.startUserId) }}
              </template>
            </el-table-column>
            <el-table-column label="当前节点" align="center" prop="taskName" />
            <el-table-column label="发起时间" align="center" prop="createTime" width="160" />
            <el-table-column label="流程状态" align="center" width="100" prop="processStatus">
              <template #default="scope">
                <dict-tag :options="wf_process_status" :value="scope.row.processStatus" />
              </template>
            </el-table-column>
            <el-table-column label="耗时" align="center" prop="duration" width="160" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
              <template #default="scope">
                <el-button type="primary" link icon="Tickets" @click="handleFlowRecord(scope.row)" v-hasPermi="['workflow:process:info']"
                  >详情
                </el-button>
                <el-button
                  type="primary"
                  link
                  icon="VideoPause"
                  @click="handleChangeState(scope.row, 'suspended')"
                  v-hasPermi="['workflow:process:state']"
                  v-if="scope.row.processStatus === 'running'"
                  >挂起
                </el-button>
                <el-button
                  type="primary"
                  link
                  icon="VideoPlay"
                  @click="handleChangeState(scope.row, 'active')"
                  v-hasPermi="['workflow:process:state']"
                  v-if="scope.row.processStatus === 'suspended'"
                  >激活
                </el-button>
                <el-button
                  type="primary"
                  link
                  icon="CircleClose"
                  @click="handleStop(scope.row)"
                  v-hasPermi="['workflow:process:terminated']"
                  v-if="scope.row.processStatus === 'running'"
                  >关闭
                </el-button>
                <el-button
                  type="primary"
                  link
                  icon="RefreshLeft"
                  @click="handleChooseFlowNode(scope.row)"
                  v-hasPermi="['workflow:process:jump']"
                  v-if="scope.row.processStatus === 'running'"
                  >跳转
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>
    <!-- 流程节点选择-->
    <el-dialog :title="returnTitle" v-model="returnOpen" width="40%" append-to-body>
      <el-form ref="taskFormRef" :model="taskForm" label-width="140px" v-loading="taskFormLoading">
        <el-form-item label="当前节点:">
          {{ currentNode }}
        </el-form-item>
        <el-form-item label="选择跳转节点：" prop="targetKey">
          <el-radio-group v-model="taskForm.targetKey">
            <el-radio border v-for="item in returnTaskList" :key="item.id" :label="item.id">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="returnOpen = false">取 消</el-button>
          <el-button type="primary" @click="handleReturnSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Instances">
import { changeState, jumpList, jumpProcess, listProcessInstances, stopProcess } from "@/api/workflow/work/process";
import { totalProcessGroupByCategory } from "@/api/workflow/category";
import { addDateRange } from "@/utils/ruoyi";
import FlowStrategyTree from "@/views/workflow/components/FlowStrategyTree.vue";
import {
  categoryFormat,
  commonVariables,
  flowCategoryQuery,
  flowCategoryTotalQuery
} from "@/api/workflow/mixins/workFlowMixins";
import { userOptions } from "@/api/system/user";
import { UserVO } from "@/api/system/user/types";
import { ref } from "vue";
import { getUserNameById } from "@/utils/userCommonUtil";

const taskFormRef = ref<ElFormInstance>();
const userSelectOptions = ref<UserVO[]>();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_process_status } = toRefs<any>(proxy?.useDict("wf_process_status"));
const { categoryOptions, categoryTreeOptions } = flowCategoryQuery();
const {
  total,
  loading,
  showSearch,
  dateRange,
  tableDataList,
  defaultTime,
  queryFormRef
} = commonVariables();
/** 按流程分类统计业务数据 */
const totalGroupByCategory = async () => {
  return await totalProcessGroupByCategory();
};
const { groupByCategory } = flowCategoryTotalQuery(totalGroupByCategory);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  processKey: undefined,
  processName: undefined,
  category: undefined,
  state: undefined,
  processInstanceId: undefined,
  startUserId: undefined
});
const userData = ref({});
const returnTitle = ref();
const returnOpen = ref(false);
const taskForm = ref({
  comment: "", // 意见内容
  procInsId: "", // 流程实例编号
  taskId: "",// 流程任务编号
  copyUserIds: "", // 抄送人Id
  vars: "",
  targetKey: ""
});
const returnTaskList = ref([]);
const currentNode = ref("");
const getList = async () => {
  loading.value = true;
  listProcessInstances(addDateRange(queryParams.value, dateRange.value ? [...dateRange.value] : [])).then(response => {
    tableDataList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};
onMounted(() => {
  getList();
  getUserOptions();
});
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
const receiveStrategy = (category: undefined) => {
  queryParams.value.category = category;
  handleQuery();
};

const resetQuery = () => {
  dateRange.value = "";
  queryFormRef.value?.resetFields();
  handleQuery();
};
const handleStop = async (row: any) => {
  await proxy?.$modal.confirm("是否确认取消流程编号为\"" + row.procInsId + "\"的数据项,确认后流程将终止？").finally(() => loading.value = false);
  const params = {
    procInsId: row.procInsId
  };
  loading.value = true;
  stopProcess(params).then(res => {
    loading.value = false;
    proxy?.$modal.msgSuccess(res.msg);
    getList();
  });
};
const handleFlowRecord = (row: any) => {
  proxy?.$router.push({
    path: "/workflow/process/detail/" + row.procInsId,
    query: {
      processed: false
    }
  });
};
const getUserOptions = async () => {
  const res = await userOptions();
  if (res) {
    userSelectOptions.value = res.data;
  }
};
/** 挂起/激活流程 */
const handleChangeState = async (row: any, state: string) => {
  if (state === "suspended") {
    await proxy?.$modal.confirm("是否确认挂起流程实例为\"" + row.procInsId + "\"的数据项？挂起流程实例会暂停流程中所有未完成的任务，直到流程实例被激活。");
  }
  const params = {
    processInstanceId: row.procInsId,
    state: state
  };
  const res = await changeState(params);
  proxy?.$modal.msgSuccess(res.msg);
  await getList();
};
const handleChooseFlowNode = async (row: any) => {
  returnOpen.value = true;
  taskFormLoading.value = true;
  returnTitle.value = "流程实例用户任务节点";
  currentNode.value = row.taskName;
  const data = { procInsId: row.procInsId };
  const res = await jumpList(data);
  returnTaskList.value = res.data;
  taskForm.value.targetKey = null;
  taskForm.value.procInsId = row.procInsId;
  taskFormLoading.value = false;
};
// 流程节点跳转
const handleReturnSubmit = async () => {
  const _validate = taskFormRef.value?.validate();
  if (_validate) {
    if (!taskForm.value.targetKey) {
      proxy?.$modal.msgError("请选择跳转节点");
    }
    // proxy?.$modal.alert('暂未实现')
    const res = await jumpProcess(taskForm.value);
    proxy?.$modal.msgSuccess(res.msg);
    returnOpen.value = false;
    await getList();
  }
};
const taskFormLoading = ref(false);
</script>

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
                <el-input v-model="queryParams.processName" placeholder="请输入" clearable @keyup.enter="handleQuery" />
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
            <el-table-column label="当前节点" align="center" prop="taskName" />
            <el-table-column label="接收时间" align="center" prop="createTime" width="180" />
            <el-table-column label="流程发起人" align="center">
              <template #default="scope">
                {{ getUserNameById(scope.row.startUserId) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button type="primary" link icon="Edit" @click="handleClaim(scope.row)" v-hasPermi="['workflow:process:claim']">签收 </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Claim" lang="ts">
import { listClaimProcess } from "@/api/workflow/work/process";
import { claimTask } from "@/api/workflow/work/task";
import {
  commonVariables,
  flowCategoryQuery,
  flowCategoryTotalQuery,
  categoryFormat
} from "@/api/workflow/mixins/workFlowMixins";
import { addDateRange } from "@/utils/ruoyi";
import FlowStrategyTree from "@/views/workflow/components/FlowStrategyTree.vue";
import { totalClaimGroupByCategory } from "@/api/workflow/category";
import { getUserNameById } from "@/utils/userCommonUtil";
const { categoryOptions, categoryTreeOptions } = flowCategoryQuery();
/** 按流程分类统计业务数据 */
const totalGroupByCategory = async () => {
  return await totalClaimGroupByCategory();
};
const { groupByCategory } = flowCategoryTotalQuery(totalGroupByCategory);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
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
  name: null,
  processName: null,
  taskId: null,
  category: undefined
});

const getList = async () => {
  loading.value = true;
  const response = await listClaimProcess(addDateRange(queryParams.value, dateRange.value ? [...dateRange.value] : []));
  tableDataList.value = response.rows;
  total.value = response.total;
  loading.value = false;
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  dateRange.value = "";
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleClaim = (row: any) => {
  claimTask({ taskId: row.taskId }).then(response => {
    proxy?.$modal.msgSuccess(response.msg);
    proxy?.$router.push({
      path: "/work/todo"
    });
  });
};
const receiveStrategy = (category: undefined) => {
  queryParams.value.category = category;
  handleQuery();
};
onMounted(() => {
  getList();
});
</script>

<style scoped></style>

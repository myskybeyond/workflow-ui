<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="抄送编号" prop="copyId">
            <el-input v-model="queryParams.copyId" placeholder="请输入" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="流程名称" prop="processName">
            <el-input v-model="queryParams.processName" placeholder="请输入" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="节点名称" prop="copyNodeName">
            <el-input v-model="queryParams.copyNodeName" placeholder="请输入" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="创建日期">
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
        <el-table-column label="抄送编号" align="center" prop="copyId" />
        <el-table-column label="流程名称" align="center" prop="processName" :show-overflow-tooltip="true" />
        <el-table-column label="抄送节点" align="center" prop="copyNodeName" :show-overflow-tooltip="true" />
        <el-table-column label="流程分类" align="center" prop="category" :show-overflow-tooltip="true">
          <template #default="scope">
            {{ categoryFormat(scope.row.category, categoryOptions) }}
          </template>
        </el-table-column>
        <el-table-column label="流程版本" align="center" prop="processVersion">
          <template #default="scope">
            <el-tag v-if="scope.row.processVersion">v{{ scope.row.processVersion }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="流程发起人" align="center" prop="originatorName" />
        <el-table-column label="创建时间" align="center" prop="createTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button type="primary" link icon="Tickets" @click="handleFlowRecord(scope.row)" v-hasPermi="['workflow:process:query']"
              >详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="Copy" lang="ts">
import { listCopyProcess } from "@/api/workflow/work/process";
import { flowCategoryQuery, categoryFormat, commonVariables } from "@/api/workflow/mixins/workFlowMixins";
import { onMounted, ref } from "vue";
import { addDateRange } from "@/utils/ruoyi";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { categoryOptions } = flowCategoryQuery();
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
  copyId: undefined,
  processName: undefined,
  copyNodeName: undefined
});
const getList = async () => {
  loading.value = true;
  const res = await listCopyProcess(addDateRange(queryParams.value, dateRange.value ? [...dateRange.value] : []));
  tableDataList.value = res.rows;
  total.value = res.total;
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
const handleFlowRecord = (row: any) => {
  proxy?.$router.push({
    path: "/workflow/process/detail/" + row.instanceId,
    query: {
      processed: false
    }
  });
};
onMounted(() => {
  getList();
});
</script>

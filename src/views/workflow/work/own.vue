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
              <el-form-item label="状态" prop="state">
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
                {{categoryFormat(scope.row.category,categoryOptions)}}
              </template>
            </el-table-column>
            <el-table-column label="流程版本" align="center" width="80px">
              <template #default="scope">
                <el-tag>v{{ scope.row.procDefVersion }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="当前节点" align="center" prop="taskName" />
            <el-table-column label="发起时间" align="center" prop="createTime" width="160" />
            <el-table-column label="状态" align="center" width="100" prop="processStatus">
              <template #default="scope">
                <dict-tag :options="wf_process_status" :value="scope.row.processStatus" />
              </template>
            </el-table-column>
            <el-table-column label="耗时" align="center" prop="duration" width="160" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  icon="Tickets"
                  @click="handleFlowRecord(scope.row)"
                  v-hasPermi="['workflow:process:query']"
                  >详情</el-button
                >
                <el-button
                  type="primary"
                  link
                  icon="CircleClose"
                  @click="handleStop(scope.row)"
                  v-hasPermi="['workflow:process:cancel']"
                  v-if="scope.row.processStatus !== 'terminated' && scope.row.processStatus !== 'completed'"
                  >取消</el-button
                >
                <el-button
                  type="primary"
                  link
                  icon="RefreshRight"
                  v-hasPermi="['workflow:process:start']"
                  @click="handleAgain(scope.row)"
                  >重新发起</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="Own">
import { listOwnProcess, stopProcess } from '@/api/workflow/work/process';
import { totalMyProcessGroupByCategory } from "@/api/workflow/category";
import { addDateRange } from "@/utils/ruoyi";
import FlowStrategyTree from "@/views/workflow/components/FlowStrategyTree.vue";
import { categoryFormat, commonVariables, flowCategoryQuery, flowCategoryTotalQuery } from "@/api/workflow/mixins/workFlowMixins";
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
  return await totalMyProcessGroupByCategory();
};
const { groupByCategory } = flowCategoryTotalQuery(totalGroupByCategory);
const queryParams = ref({pageNum: 1,
  pageSize: 10,
  processKey: undefined,
  processName: undefined,
  category: undefined,
  state: undefined,
  processInstanceId: undefined
});
const getList = async () => {
  loading.value = true;
  listOwnProcess(addDateRange(queryParams.value, dateRange.value ? [ ... dateRange.value] : [])).then(response => {
    tableDataList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};
onMounted(() => {
  getList();
});
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}
const receiveStrategy = (category: undefined) => {
  queryParams.value.category = category;
  handleQuery();
}

const resetQuery = () => {
  dateRange.value = '';
  queryFormRef.value?.resetFields();
  handleQuery();
}
const handleAgain = (row: any) => {
  proxy?.$router.push({
    path: '/workflow/process/start/' + row.deployId,
    query: {
      definitionId: row.procDefId,
      procInsId: row.procInsId,
      definitionKey: row.procDefKey
    }
  })
}

const handleStop = (row: any) => {
  const params = {
    procInsId: row.procInsId
  }
  loading.value = true;
  stopProcess(params).then( res => {
    loading.value = false;
    proxy?.$modal.msgSuccess(res.msg);
    getList();
  });
}
const handleFlowRecord = (row: any) => {
  proxy?.$router.push({
    path: '/workflow/process/detail/' + row.procInsId,
    query: {
      processed: false
    }
  })
}
</script>

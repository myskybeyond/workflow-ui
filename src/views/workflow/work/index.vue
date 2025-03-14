<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!--模型分类树-->
      <el-col :lg="4" :xs="24" style="">
        <flow-strategy-tree :category-tree-options="categoryTreeOptions" @passCategory="receiveStrategy" :related-obj="groupByCategory" />
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="animate.searchAnimate.enter" :leave-active-class="animate.searchAnimate.leave">
          <div class="mb-[10px]" v-show="showSearch">
            <el-card shadow="hover">
              <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
                <el-form-item label="流程标识" prop="processKey">
                  <el-input v-model="queryParams.processKey" placeholder="请输入流程标识" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="流程名称" prop="processName">
                  <el-input v-model="queryParams.processName" placeholder="请输入流程名称" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                  <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </transition>
        <el-card shadow="hover">
          <template #header></template>
          <el-table v-loading="loading" fit :data="processList">
            <el-table-column label="序号" type="index" width="50"></el-table-column>
            <el-table-column label="流程标识" align="center" prop="processKey" :show-overflow-tooltip="true" />
            <el-table-column label="流程名称" align="center" :show-overflow-tooltip="true">
              <template #default="scope">
                <el-button type="primary" link @click="handleProcessView(scope.row)">
                  <span>{{ scope.row.processName }}</span>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="流程分类" align="center" prop="categoryName">
              <template #default="scope">
                {{ categoryFormat(scope.row.category, categoryOptions) }}
              </template>
            </el-table-column>
            <el-table-column label="流程版本" align="center">
              <template #default="scope">
                <el-tag size="default">v{{ scope.row.version }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
              <template #default="scope">
                <el-tag type="success" v-if="!scope.row.suspended">激活</el-tag>
                <el-tag type="warning" v-if="scope.row.suspended">挂起</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="部署时间" align="center" prop="deploymentTime" width="180" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button type="primary" link @click="handleStart(scope.row)" v-hasPermi="['workflow:process:start']">
                  <VideoPlay style="width: 1.4em; height: 1.4em; margin-right: 3px" />
                  <span style="margin-top: 4px;">发起</span></el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>
    <!-- 流程图 -->
    <el-dialog :title="processView.title" v-model="processView.open" width="70%" append-to-body>
      <process-viewer :key="`designer-${processView.index}`" :xml="processView.xmlData" :style="{height: '400px'}" />
    </el-dialog>
  </div>
</template>

<script>
import { listProcess, getBpmnXml } from "@/api/workflow/work/process";
import { totalFlowStartGroupByCategory } from "@/api/workflow/category";
import ProcessViewer from "@/components/ProcessViewer";
import FlowStrategyTree from "@/views/workflow/components/FlowStrategyTree.vue";
import { categoryFormat, flowCategoryQuery } from "@/api/workflow/mixins/workFlowMixins";
import { VideoPlay } from "@element-plus/icons-vue";

export default {
  name: "Create",
  components: {
    VideoPlay,
    FlowStrategyTree,
    ProcessViewer
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        processKey: undefined,
        processName: undefined,
        category: undefined
      },
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      filterCategoryText: "",
      categoryOptions: [],
      categoryProps: {
        label: "categoryName",
        value: "code"
      },
      // 流程定义表格数据
      processList: [],
      processView: {
        title: "",
        open: false,
        index: undefined,
        xmlData: ""
      },
      categoryTreeOptions: [],
      groupByCategory: []
    };
  },
  created() {
    this.getCategoryList();
    this.totalGroupByCategory();
    this.getList();
  },
  methods: {
    categoryFormat,
    /** 查询流程分类列表 */
    async getCategoryList() {
      const response = flowCategoryQuery();
      this.categoryOptions = response.categoryOptions;
      this.categoryTreeOptions = response.categoryTreeOptions;
    },
    /** 按流程分类统计业务数据 */
    async totalGroupByCategory() {
      const res = await totalFlowStartGroupByCategory();
      if (res) {
        this.groupByCategory = res.data;
      }
    },
    /** 查询流程定义列表 */
    getList() {
      this.loading = true;
      listProcess(this.queryParams).then(response => {
        this.processList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    receiveStrategy(category) {
      this.queryParams.category = category;
      this.handleQuery();
    },
    // 搜索按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 重置按钮操作
    resetQuery() {
      this.$refs["queryForm"].resetFields();
      this.handleQuery();
    },
    /** 查看流程图 */
    handleProcessView(row) {
      let definitionId = row.definitionId;
      this.processView.title = "流程图";
      this.processView.index = definitionId;
      // 发送请求，获取xml
      getBpmnXml(definitionId).then(res => {
        this.processView.xmlData = res.data;
      });
      this.processView.open = true;
    },
    handleStart(row) {
      this.$router.push({
        path: "/workflow/process/start/" + row.deploymentId,
        query: {
          definitionId: row.definitionId,
          definitionKey: row.processKey
        }
      });
    }
  }
};
</script>

<style scoped></style>

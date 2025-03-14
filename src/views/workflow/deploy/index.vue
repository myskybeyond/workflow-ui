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
          <el-table v-loading="loading" fit :data="deployList">
            <el-table-column type="index" width="55" align="center" label="序号" />
            <el-table-column label="流程标识" align="center" prop="processKey" :show-overflow-tooltip="true" />
            <el-table-column label="流程名称" align="center" :show-overflow-tooltip="true">
              <template #default="scope">
                <el-button type="primary" link @click="handleProcessView(scope.row)">
                  <span>{{ scope.row.processName }}</span>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="流程分类" align="center" prop="category">
              <template #default="scope">
                {{ categoryFormat(scope.row.category, categoryOptions) }}
              </template>
            </el-table-column>
            <el-table-column label="流程版本" align="center">
              <template #default="scope">
                <el-tag>v{{ scope.row.version }}</el-tag>
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
                <el-button type="primary" link icon="PriceTag" @click="handlePublish(scope.row)" v-4hasPermi="['workflow:deploy:list']"
                  >版本管理
                </el-button>
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

    <!-- 版本管理 -->
    <el-dialog title="版本管理" v-model="publish.open" width="50%" append-to-body>
      <el-table v-loading="publish.loading" :data="publish.dataList">
        <el-table-column label="流程标识" align="center" prop="processKey" :show-overflow-tooltip="true" />
        <el-table-column label="流程名称" align="center" :show-overflow-tooltip="true">
          <template #default="scope">
            <el-button type="primary" link @click="handleProcessView(scope.row)">
              <span>{{ scope.row.processName }}</span>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="流程版本" align="center">
          <template #default="scope">
            <el-tag>v{{ scope.row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="!scope.row.suspended">激活</el-tag>
            <el-tag type="warning" v-if="scope.row.suspended">挂起</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              type="primary"
              link
              icon="VideoPause"
              v-if="!scope.row.suspended"
              @click="handleChangeState(scope.row, 'suspended')"
              v-hasPermi="['workflow:deploy:state']"
              >挂起
            </el-button>
            <el-button
              type="primary"
              link
              icon="VideoPlay"
              v-if="scope.row.suspended"
              @click="handleChangeState(scope.row, 'active')"
              v-hasPermi="['workflow:deploy:state']"
              >激活
            </el-button>
            <el-button type="primary" link icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['workflow:deploy:remove']">删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="publishTotal > 0"
        :total="publishTotal"
        v-model:page="publishQueryParams.pageNum"
        v-model:limit="publishQueryParams.pageSize"
        @pagination="getPublishList"
      />
    </el-dialog>
  </div>
</template>

<script>
import { totalDeploymentGroupByCategory } from "@/api/workflow/category";
import { listDeploy, listPublish, getBpmnXml, changeState, delDeploy } from "@/api/workflow/deploy";
import ProcessViewer from "@/components/ProcessViewer";
import FlowStrategyTree from "@/views/workflow/components/FlowStrategyTree.vue";
import { categoryFormat, flowCategoryQuery } from "@/api/workflow/mixins/workFlowMixins";

export default {
  name: "Deploy",
  components: {
    FlowStrategyTree,
    ProcessViewer
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        processKey: null,
        processName: null,
        category: null,
        state: null
      },
      deployList: [],
      categoryOptions: [],
      processView: {
        title: "",
        open: false,
        index: undefined,
        xmlData: ""
      },
      publish: {
        open: false,
        loading: false,
        dataList: []
      },
      publishTotal: 0,
      publishQueryParams: {
        pageNum: 1,
        pageSize: 10,
        processKey: ""
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
      const res = flowCategoryQuery();
      this.categoryOptions = res.categoryOptions;
      this.categoryTreeOptions = res.categoryTreeOptions;
    },
    /** 按流程分类统计业务数据 */
    async totalGroupByCategory() {
      const res = await totalDeploymentGroupByCategory();
      this.groupByCategory = res.data;
    },
    /** 查询流程部署列表 */
    getList() {
      this.loading = true;
      listDeploy(this.queryParams).then(response => {
        this.deployList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        processKey: null,
        processName: null,
        category: null,
        state: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    receiveStrategy(category) {
      this.queryParams.category = category;
      this.handleQuery();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryForm.resetFields();
      this.handleQuery();
    },
    /** 查看流程图 */
    handleProcessView(row) {
      let definitionId = row.definitionId;
      this.processView.title = "流程图";
      this.processView.index = definitionId;
      // 发送请求，获取xml
      getBpmnXml(definitionId).then(response => {
        this.processView.xmlData = response.data;
      });
      this.processView.open = true;
    },
    getPublishList() {
      this.publish.loading = true;
      listPublish(this.publishQueryParams).then(response => {
        this.publish.dataList = response.rows;
        this.publishTotal = response.total;
        this.publish.loading = false;
      });
    },
    handlePublish(row) {
      this.publishQueryParams.processKey = row.processKey;
      this.publish.open = true;
      this.getPublishList();
    },
    /** 挂起/激活流程 */
    handleChangeState(row, state) {
      const params = {
        definitionId: row.definitionId,
        state: state
      };
      changeState(params).then(res => {
        this.$modal.msgSuccess(res.msg);
        this.getPublishList();
      });
    },
    handleDelete(row) {
      const deploymentIds = row.deploymentId || this.ids;
      this.$modal.confirm("是否确认删除选中的数据项？").then(() => {
        this.loading = true;
        return delDeploy(deploymentIds);
      }).then(() => {
        this.loading = false;
        this.getList();
        this.$modal.msgSuccess("删除成功");
        this.publish.open = false;
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
</script>

<style scoped></style>

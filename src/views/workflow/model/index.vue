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
                <el-form-item label="模型标识" prop="modelKey">
                  <el-input v-model="queryParams.modelKey" placeholder="请输入模型标识" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="模型名称" prop="modelName">
                  <el-input v-model="queryParams.modelName" placeholder="请输入模型名称" clearable @keyup.enter="handleQuery" />
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
          <template #header>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button type="success" plain icon="Plus" @click="handleAdd" v-hasPermi="['workflow:model:add']">新增 </el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
          </template>
          <el-table v-loading="loading" fit :data="modelList" @selection-change="handleSelectionChange">
            <el-table-column type="index" width="55" align="center" label="序号" />
            <el-table-column label="模型标识" align="center" prop="modelKey" :show-overflow-tooltip="true" />
            <el-table-column label="模型名称" align="center" :show-overflow-tooltip="true">
              <template #default="scope">
                <el-button type="primary" link @click="handleProcessView(scope.row)">
                  <span>{{ scope.row.modelName }}</span>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="流程分类" align="center" prop="categoryName" :formatter="categoryFormat" />
            <el-table-column label="模型版本" align="center">
              <template #default="scope">
                <el-tag>v{{ scope.row.version }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
              <template #default="scope">
                <el-button type="primary" link icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['workflow:model:edit']"
                  >修改
                </el-button>
                <el-button type="primary" link icon="Brush" @click="handleDesigner(scope.row)" v-hasPermi="['workflow:model:designer']"
                  >设计
                </el-button>
                <el-button type="primary" link icon="VideoPlay" v-hasPermi="['workflow:model:deploy']" @click="handleDeploy(scope.row)"
                  >部署
                </el-button>
                <el-dropdown v-hasPermi="['workflow:model:query', 'workflow:model:list', 'workflow:model:remove']">
                  <el-button type="primary" link icon="ArrowRight">更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item icon="View" @click="handleProcessView(scope.row)" v-hasPermi="['workflow:model:query']"
                        >流程图
                      </el-dropdown-item>
                      <el-dropdown-item icon="PriceTag" @click="handleHistory(scope.row)" v-hasPermi="['workflow:model:list']"
                        >历史
                      </el-dropdown-item>
                      <el-dropdown-item icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['workflow:model:remove']">删除 </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
    <!--  添加或修改模型信息对话框  -->
    <el-dialog :title="title" v-model="open" width="30%" append-to-body @close="cancel()">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模型标识" prop="modelKey">
          <el-input v-model="form.modelKey" clearable disabled />
        </el-form-item>
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="form.modelName" clearable :disabled="form.modelId !== undefined" />
        </el-form-item>
        <el-form-item label="流程分类" prop="category">
          <el-tree-select
            v-model="form.category"
            :data="categoryTreeOptions"
            :props="{ value: 'code', label: 'categoryName', children: 'children' }"
            value-key="categoryId"
            placeholder="请选择"
            check-strictly
            style="width: 400px;"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel()">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 流程图 -->
    <el-dialog :title="processView.title" v-model="processView.open" width="70%" append-to-body>
      <process-viewer :key="`designer-${processView.index}`" :xml="processView.xmlData" :style="{height: '400px'}" />
    </el-dialog>
    <el-dialog title="模型历史" v-model="history.open" width="70%">
      <el-table v-loading="history.loading" fit :data="historyList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="模型标识" align="center" prop="modelKey" :show-overflow-tooltip="true" />
        <el-table-column label="模型名称" align="center" :show-overflow-tooltip="true">
          <template #default="scope">
            <el-button type="primary" link @click="handleProcessView(scope.row)">
              <span>{{ scope.row.modelName }}</span>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="流程分类" align="center" prop="categoryName" :formatter="categoryFormat" />
        <el-table-column label="模型版本" align="center">
          <template #default="scope">
            <el-tag size="default">v{{ scope.row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button type="primary" link icon="VideoPlay" v-hasPermi="['workflow:model:deploy']" @click="handleDeploy(scope.row)"
              >部署
            </el-button>
            <el-button type="primary" link icon="Star" v-hasPermi="['workflow:model:save']" @click="handleLatest(scope.row)"
              >设为最新
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="historyTotal > 0"
        :total="historyTotal"
        v-model:page="queryHistoryParams.pageNum"
        v-model:limit="queryHistoryParams.pageSize"
        @pagination="getHistoryList"
      />
    </el-dialog>
    <el-dialog :title="designerData.title" v-model="designerOpen" append-to-body fullscreen>
      <process-designer
        :key="designerOpen"
        style="border:1px solid rgba(0, 0, 0, 0.1);"
        ref="modelDesigner"
        v-loading="designerData.loading"
        :bpmnXml="designerData.bpmnXml"
        :designerForm="designerData.form"
        @save="onSaveDesigner"
      />
    </el-dialog>
  </div>
</template>

<script name="Model">
import {
  getBpmnXml,
  listModel,
  historyModel,
  latestModel,
  addModel,
  updateModel,
  saveModel,
  delModel,
  deployModel
} from "@/api/workflow/model";
import { totalModalGroupByCategory } from "@/api/workflow/category";
import ProcessDesigner from "@/components/ProcessDesigner";
import ProcessViewer from "@/components/ProcessViewer";
import { getToken } from "@/utils/auth";
import FlowStrategyTree from "@/views/workflow/components/FlowStrategyTree.vue";
import { flowCategoryQuery } from "@/api/workflow/mixins/workFlowMixins";
export default {
  name: "Model",
  components: {
    FlowStrategyTree,
    ProcessDesigner,
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
      // 流程模型表格数据
      modelList: [],
      categoryTreeOptions: [],
      title: "",
      open: false,
      form: {},
      // 表单校验
      rules: {
        modelKey: [
          { required: true, message: "模型标识不能为空", trigger: "blur" }
        ],
        modelName: [
          { required: true, message: "模型名称不能为空", trigger: "blur" }
        ],
        category: [
          { required: true, message: "请选择类型", trigger: "change" }
        ]
      },
      designerOpen: false,
      designerData: {
        loading: false,
        bpmnXml: "",
        modelId: null,
        form: {
          processName: null,
          processKey: null
        }
      },
      designerModelId: null,
      processView: {
        title: "",
        open: false,
        index: undefined,
        xmlData: ""
      },
      // bpmn.xml 导入
      upload: {
        // 是否显示弹出层（xml导入）
        open: false,
        // 弹出层标题（xml导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        name: null,
        category: null,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: import.meta.env.VITE_APP_BASE_API + "/workflow/definition/import"
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        modelKey: null,
        modelName: null,
        category: null
      },
      currentRow: null,
      history: {
        open: false,
        loading: false
      },
      historyList: [],
      historyTotal: 0,
      queryHistoryParams: {
        pageNum: 1,
        pageSize: 10,
        modelKey: null
      },
      categoryOptions: [],
      groupByCategory: []
    };
  },
  created() {
    this.getCategoryList();
    this.totalGroupByCategory();
    this.getList();
  },
  methods: {
    /** 查询流程分类列表 */
    async getCategoryList() {
      const res = flowCategoryQuery();
      this.categoryOptions = res.categoryOptions;
      this.categoryTreeOptions = res.categoryTreeOptions;
    },
    /** 按流程分类统计业务数据 */
    async totalGroupByCategory() {
      const res = await totalModalGroupByCategory();
      this.groupByCategory = res.data;
    },
    /** 查询流程模型列表 */
    getList() {
      this.loading = true;
      listModel(this.queryParams).then(response => {
        this.modelList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    cancel() {
      this.reset();
      // 关闭dialog
      this.open = false;
    },
    // 表单重置
    reset() {
      this.form = {
        modelId: undefined,
        modelKey: undefined,
        modelName: undefined,
        category: undefined,
        description: undefined
      };
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.modelId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 部署流程 */
    handleDeploy(row) {
      this.loading = true;
      deployModel({
        modelId: row.modelId
      }).then(response => {
        this.$modal.msgSuccess(response.msg);
        let obj = { name: "Deploy", path: "/workflow/deploy" };
        return this.$store.dispatch("tagsView/delCachedView", obj).then(() => {
          this.$router.push(obj);
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    /** 查看流程图 */
    handleProcessView(row) {
      let modelId = row.modelId;
      this.processView.title = "流程图";
      this.processView.index = modelId;
      // 发送请求，获取xml
      getBpmnXml(modelId).then(response => {
        this.processView.xmlData = response.data;
      });
      this.processView.open = true;
    },
    getHistoryList() {
      this.history.loading = true;
      historyModel(this.queryHistoryParams).then(response => {
        this.historyTotal = response.total;
        this.historyList = response.rows;
        this.history.loading = false;
      });
    },
    handleHistory(row) {
      this.history.open = true;
      this.queryHistoryParams.modelKey = row.modelKey;
      this.getHistoryList();
    },
    /** 设为最新版 */
    handleLatest(row) {
      this.$modal.confirm("是否确认将此版本设为最新？").then(() => {
        this.history.loading = true;
        latestModel({
          modelId: row.modelId
        }).then(response => {
          this.history.open = false;
          this.getList();
          this.$modal.msgSuccess(response.msg);
        }).finally(() => {
          this.history.loading = false;
        });
      });
    },
    handleAdd() {
      this.title = "新增流程模型";
      const dateTime = new Date().getTime();
      this.form = {
        modelKey: `Process_${dateTime}`,
        modelName: `业务流程_${dateTime}`
      };
      this.open = true;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.title = "修改流程模型";
      this.form = {
        modelId: row.modelId,
        modelKey: row.modelKey,
        modelName: row.modelName,
        category: row.category,
        description: row.description
      };
      this.open = true;
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.modelId !== undefined) {
            updateModel(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addModel(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.getCategoryList();
              this.totalGroupByCategory();
            });
          }
        }
      });
    },
    /** 设计按钮操作 */
    handleDesigner(row) {
      this.designerData.title = "流程设计 - " + row.modelName;
      this.designerData.modelId = row.modelId;
      this.designerData.form = {
        processName: row.modelName,
        processKey: row.modelKey
      };
      if (row.modelId) {
        this.designerData.loading = true;
        getBpmnXml(row.modelId).then(response => {
          this.designerData.bpmnXml = response.data || "";
          this.designerData.loading = false;
          this.designerOpen = true;
        });
      }
    },
    onSaveDesigner(bpmnXml) {
      this.bpmnXml = bpmnXml;
      let dataBody = {
        modelId: this.designerData.modelId,
        bpmnXml: this.bpmnXml
      };
      this.$confirm("是否将此模型保存为新版本？", "提示", {
        distinguishCancelAndClose: true,
        confirmButtonText: "是",
        cancelButtonText: "否"
      }).then(() => {
        this.confirmSave(dataBody, true);
      }).catch(action => {
        if (action === "cancel") {
          this.confirmSave(dataBody, false);
        }
      });
    },
    confirmSave(body, newVersion) {
      this.designerData.loading = true;
      saveModel(Object.assign(body, {
        newVersion: newVersion
      })).then(() => {
        this.designerOpen = false;
        this.getList();
      }).finally(() => {
        this.designerData.loading = false;
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const modelIds = row.modelId || this.ids;
      this.$modal.confirm("是否确认删除模型编号为\"" + modelIds + "\"的数据项？").then(() => {
        this.loading = true;
        return delModel(modelIds);
      }).then(() => {
        this.loading = false;
        this.totalGroupByCategory();
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).finally(() => {
        this.loading = false;
      });
    },
    categoryFormat(row, column) {
      return this.categoryOptions.find(k => k.code === row.category)?.categoryName ?? "";
    }
  }
};
</script>
<style lang="scss" scoped></style>

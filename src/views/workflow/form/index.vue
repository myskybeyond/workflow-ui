<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!--模型分类树-->
      <el-col :lg="4" :xs="24" style="">
        <flow-strategy-tree
          :key="formList.length"
          :category-tree-options="categoryTreeOptions"
          @passCategory="receiveStrategy"
          :related-obj="groupByCategory"
        />
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div class="search" v-show="showSearch">
            <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
              <el-form-item label="表单名称" prop="formName">
                <el-input v-model="queryParams.formName" placeholder="请输入表单名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </transition>
        <el-card shadow="never">
          <template #header>
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['workflow:form:add']">新增 </el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" :data="formList">
            <el-table-column label="序号" type="index" width="55" align="center" />
            <el-table-column label="表单名称" align="center" prop="formName" />
            <el-table-column label="流程分类" align="center" prop="categoryCode">
              <template #default="scope">
                {{ categoryFormat(scope.row.categoryCode, categoryOptions) }}
              </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
            <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['workflow:form:edit']">修改 </el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['workflow:form:remove']">删除 </el-button>
                <el-button link type="primary" icon="Tools" @click="handleDesign(scope.row)" v-hasPermi="['workflow:form:design']">设计 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>
    <!-- 添加或修改流程单信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <el-form ref="formFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="模型分类" prop="categoryCode">
          <el-tree-select
            v-model="form.categoryCode"
            :data="categoryTreeOptions"
            :props="{ value: 'code', label: 'categoryName', children: 'children' }"
            value-key="code"
            placeholder="选择模型分类"
            check-strictly
            style="width: 450px;"
          />
        </el-form-item>
        <el-form-item label="表单名称" prop="formName">
          <el-input v-model="form.formName" placeholder="请输入表单名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="3" v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="表单预览" v-if="clickInfo">
          <FormCreate :rule="rule" :option="options" v-model="formData" v-model:api="fApi" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="clickInfo" @click="cancel">关 闭</el-button>
          <div v-else>
            <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Form" lang="ts">
import { listForm, getForm, delForm, addForm, updateForm } from "@/api/workflow/form";
import { FormVO, FormQuery, FormForm, DesignFormForm } from "@/api/workflow/form/types";
import { ref } from "vue";
import { categoryFormat, flowCategoryQuery } from "@/api/workflow/mixins/workFlowMixins";
import FlowStrategyTree from "@/views/workflow/components/FlowStrategyTree.vue";
import { totalFormGroupByCategory } from "@/api/workflow/category";
import { DataGroupByCategoryVo } from "@/api/workflow/category/types";

const { categoryOptions, categoryTreeOptions } = flowCategoryQuery();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
/** 按流程分类统计业务数据 */
const totalGroupByCategory = async () => {
  const res = await totalFormGroupByCategory();
  groupByCategory.value = res.data;
};
const groupByCategory = ref<DataGroupByCategoryVo[]>();
const formList = ref<FormVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const total = ref(0);
const fApi = ref({});
const queryFormRef = ref<ElFormInstance>();
const formFormRef = ref<ElFormInstance>();
let clickInfo = ref(false);
const dialog = reactive<DialogOption>({
  visible: false,
  title: ""
});
const formData = ref<any>();
let options = ref<any>();
let rule = ref<any>();

const parsedDesignData = ref<DesignFormForm>();

const initFormData: FormForm = {
  formId: undefined,
  formName: undefined,
  content: undefined,
  remark: undefined,
  categoryCode: undefined
};
const data = reactive<PageData<FormForm, FormQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    formName: undefined,
    content: undefined,
    params: {},
    categoryCode: undefined
  },
  rules: {
    formId: [
      { required: true, message: "表单主键不能为空", trigger: "blur" }
    ],
    formName: [
      { required: true, message: "表单名称不能为空", trigger: "blur" }
    ]
    // content: [
    //   { required: true, message: "表单内容不能为空", trigger: "blur" }
    // ],
    // remark: [
    //   { required: true, message: "备注不能为空", trigger: "blur" }
    // ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询流程单信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listForm(queryParams.value);
  formList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
  clickInfo.value = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  formFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.categoryCode = undefined;
  handleQuery();
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加流程表单信息";
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FormVO) => {
  reset();
  const _formId = row?.formId || ids.value[0];
  const res = await getForm(_formId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改流程表单信息";
};

/** 查看详情操作 */
const handleView = (row?: FormVO) => {
  clickInfo.value = true;
  dialog.visible = true;
  dialog.title = "查看流程表单详情";
  parsedDesignData.value = JSON.parse(<string>row?.content);
  rule.value = parsedDesignData.value?.rule;
  options.value = parsedDesignData.value?.option;
};

/** 提交按钮 */
const submitForm = () => {
  formFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.formId) {
        await updateForm(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addForm(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await totalGroupByCategory();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: FormVO) => {
  const _formIds = row?.formId || ids.value;
  const _formName = row?.formName;
  await proxy?.$modal.confirm("是否确认删除流程表单名称为【" + _formName + "】的数据项？").finally(() => loading.value = false);
  await delForm(_formIds);
  proxy?.$modal.msgSuccess("删除成功");
  await totalGroupByCategory();
  await getList();
};

const handleDesign = (row?: FormVO) => {
  const _formIds = row?.formId || ids.value;
  proxy?.$router.push({ path: "/workflow/form/designer", query: { formId: _formIds } });
};
const receiveStrategy = (category: undefined) => {
  queryParams.value.categoryCode = category;
  handleQuery();
};
onMounted(() => {
  getList();
  totalGroupByCategory();
});
</script>

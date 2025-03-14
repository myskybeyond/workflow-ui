<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="分类名称" prop="categoryName">
            <el-input v-model="queryParams.categoryName" placeholder="请输入" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="分类编码" prop="code">
            <el-input v-model="queryParams.code" placeholder="请输入" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['workflow:category:add']"> 新建 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        v-loading="loading"
        :data="categoryList"
        row-key="categoryId"
        ref="categoryTableRef"
        default-expand-all
        :indent="indent"
      >
<!--                <el-table-column prop="name" label="分类名称">-->
<!--                  <template v-slot="{ row, $index }">-->
<!--                    <span v-for="n in getDepth(row)" :key="n" class="line"></span>-->
<!--                    {{ row.categoryName }}-->
<!--                    &lt;!&ndash;            {{ row }}&ndash;&gt;-->
<!--                  </template>-->
<!--                </el-table-column>-->
        <el-table-column label="分类名称" align="left" prop="categoryName" width="200px" />
        <el-table-column label="分类编码" align="center" prop="code" />
        <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="新增" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['workflow:category:add']">新增 </el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['workflow:category:edit']">修改 </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['workflow:category:remove']"
              >删除
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改流程分类对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="categoryFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级分类" prop="categoryPid" v-if="form.categoryPid !== 0">
          <el-tree-select
            v-model="form.categoryPid"
            :data="categoryOptions"
            :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            value-key="categoryId"
            placeholder="选择上级分类"
            check-strictly
            style="width: 400px;"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入流程分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" step-strictly :step="1" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Category" lang="ts">

interface CategoryOptionsType {
  categoryId: number | string;
  categoryName: string;
  children: CategoryOptionsType[];
}

import { addCategory, delCategory, getCategory, listAllCategory, updateCategory } from "@/api/workflow/category";
import { CategoryForm, CategoryQuery, CategoryVO } from "@/api/workflow/category/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const categoryList = ref<CategoryVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const total = ref(0);
const indent = ref(20);
const categoryOptions = ref<CategoryOptionsType[]>([]);

const queryFormRef = ref<ElFormInstance>();
const categoryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ""
});
const categoryTableRef = ref<ElTableInstance>();
const initFormData: CategoryForm = {
  categoryId: undefined,
  categoryName: undefined,
  code: undefined,
  remark: undefined,
  sort: undefined,
  categoryPid: undefined
};
const data = reactive<PageData<CategoryForm, CategoryQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    categoryName: undefined,
    code: undefined,
    params: {}
  },
  rules: {
    categoryId: [
      { required: true, message: "流程分类id不能为空", trigger: "blur" }
    ],
    categoryName: [
      { required: true, message: "流程分类名称不能为空", trigger: "blur" }
    ],
    code: [
      { required: true, message: "分类编码不能为空", trigger: "blur" }
    ],
    sort: [
      { required: true, message: "排序不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询流程分类列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAllCategory(queryParams.value);
  const data = proxy?.handleTree<CategoryVO>(res.data, "categoryId", "categoryPid");
  if (data) {
    categoryList.value = data;
  }
  // categoryList.value = res.rows;
  // total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  categoryFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 新增按钮操作 */
const handleAdd = async (row?: CategoryVO) => {
  reset();
  const res = await listAllCategory(queryParams.value);
  const data = proxy?.handleTree<CategoryOptionsType>(res.data, "categoryId", "categoryPid");
  if (data) {
    categoryOptions.value = data;
    if (row && row.categoryId) {
      form.value.categoryPid = row?.categoryId;
    }
    dialog.visible = true;
    dialog.title = "新增流程分类";
  }
};

/** 修改按钮操作 */
const handleUpdate = async (row?: CategoryVO) => {
  reset();
  const res = await listAllCategory(queryParams.value);
  const data = proxy?.handleTree<CategoryOptionsType>(res.data, "categoryId", "categoryPid");
  if (data) {
    categoryOptions.value = data;
    if (row && row.categoryId) {
      form.value.categoryPid = row?.categoryId;
    }
    const _categoryId = row?.categoryId || ids.value[0];
    const res1 = await getCategory(_categoryId);
    Object.assign(form.value, res1.data);
    dialog.visible = true;
    dialog.title = "修改流程分类";
  }
};

/** 提交按钮 */
const submitForm = () => {
  categoryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.categoryId) {
        await updateCategory(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addCategory(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: CategoryVO) => {
  const _categoryIds = row?.categoryId || ids.value;
  const _categoryName = row?.categoryName;
  await proxy?.$modal.confirm("是否确认删除流程分类名称为【" + _categoryName + "】的数据项？").finally(() => loading.value = false);
  await delCategory(_categoryIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
};

// 获取节点深度
const getDepth = async (node: CategoryVO) => {
  let depth = 0;
  if (node && node.categoryId) {
    let current = node;
    while (current && current.categoryPid !== 0) {
      if (current.children) {
        depth++;
        current = findNode(categoryList.value, current.categoryId)
      } else {
        break;
      }
    }
    console.log(depth);
    return depth;
  }
};
// 在原始数据中查找节点
const findNode = (data: CategoryVO[], id: string | number) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].categoryId === id) {
      return data[i];
    }
  }
  return null;
};
onMounted(() => {
  getList();
});
</script>
<style scoped>
.line {
  display: inline-block;
  width: 10px;
  height: 1px;
  background-color: #ccc;
  margin-right: 5px;
}
</style>

<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入分类名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="分类编码" prop="code">
            <el-input v-model="queryParams.code" placeholder="请输入分类编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['business:categoryInfo:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">展开/折叠</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table
        v-loading="loading"
        :data="categoryInfoList"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        ref="categoryInfoTableRef"
      >
        <el-table-column label="分类名称" align="left" prop="name" />
        <el-table-column label="分类编码" align="center" prop="code" />
        <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:categoryInfo:edit']" />
            </el-tooltip>
            <el-tooltip content="新增" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['business:categoryInfo:add']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:categoryInfo:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改系统类别信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="categoryInfoFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级分类" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="categoryInfoOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            value-key="id"
            placeholder="请选择上级分类"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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

<script setup name="CategoryInfo" lang="ts">
import { listCategoryInfo, getCategoryInfo, delCategoryInfo, addCategoryInfo, updateCategoryInfo } from "@/api/business/categoryInfo";
import { CategoryInfoVO, CategoryInfoQuery, CategoryInfoForm } from '@/api/business/categoryInfo/types';
import { useRouter } from "vue-router";

type CategoryInfoOption = {
  id: number;
  name: string;
  children?: CategoryInfoOption[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;;

const router = useRouter();
const categoryInfoList = ref<CategoryInfoVO[]>([]);
const categoryInfoOptions = ref<CategoryInfoOption[]>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);
const loading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const categoryInfoFormRef = ref<ElFormInstance>();
const categoryInfoTableRef = ref<ElTableInstance>()

const dialog = reactive<DialogOption>({
    visible: false,
    title: ''
});


const initFormData: CategoryInfoForm = {
    id: undefined,
    category: undefined,
    parentId: undefined,
    name: undefined,
    code: undefined,
    sort: undefined,
    remark: undefined,
}

const data = reactive<PageData<CategoryInfoForm, CategoryInfoQuery>>({
  form: {...initFormData},
  queryParams: {
    category: undefined,
    name: undefined,
    code: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    category: [
      { required: true, message: "分类类别不能为空", trigger: "blur" }
    ],
    parentId: [
      { required: true, message: "上级分类不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "分类名称不能为空", trigger: "blur" }
    ],
    code: [
      { required: true, message: "分类编码不能为空", trigger: "blur" }
    ],
    sort: [
      { required: true, message: "排序不能为空", trigger: "blur" }
    ],
    remark: [
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询系统类别信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCategoryInfo(queryParams.value);
  const data = proxy?.handleTree<CategoryInfoVO>(res.data, "id", "parentId");
  if (data) {
    categoryInfoList.value = data;
    loading.value = false;
  }
}

/** 查询系统类别信息下拉树结构 */
const getTreeselect = async () => {
  const query = {"category":category.value};
  const res = await listCategoryInfo(query);
  categoryInfoOptions.value = [];
  const data: CategoryInfoOption = { id: 0, name: '顶级节点', children: [] };
  data.children = proxy?.handleTree<CategoryInfoOption>(res.data, "id", "parentId");
  categoryInfoOptions.value.push(data);
}

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
}

// 表单重置
const reset = () => {
  form.value = {...initFormData}
  categoryInfoFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 新增按钮操作 */
const handleAdd = (row?: CategoryInfoVO) => {
  reset();
  getTreeselect();
  if (row != null && row.id) {
      form.value.parentId = row.id;
  } else {
      form.value.parentId = 0;
  }
  dialog.visible = true;
  dialog.title = "添加分类信息";
}

/** 展开/折叠操作 */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(categoryInfoList.value, isExpandAll.value)
}

/** 展开/折叠操作 */
const toggleExpandAll = (data: CategoryInfoVO[], status: boolean) => {
  data.forEach((item) => {
    categoryInfoTableRef.value?.toggleRowExpansion(item, status)
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status)
  })
}

/** 修改按钮操作 */
const handleUpdate = async (row: CategoryInfoVO) => {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getCategoryInfo(row.id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改分类信息";
}

/** 提交按钮 */
const submitForm = () => {
  categoryInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateCategoryInfo(form.value).finally(() => buttonLoading.value = false);
      } else {
        form.value.category = category.value;
        await addCategoryInfo(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: CategoryInfoVO) => {
  await proxy?.$modal.confirm('是否确认删除分类信息编号为"' + row.code + '"的数据项？');
  loading.value = true;
  await delCategoryInfo(row.id).finally(() => loading.value = false);
  await getList();
  proxy?.$modal.msgSuccess("删除成功");
}
const category = ref();
onMounted(() => {
  //设置路由的参数
  const categoryVal = router.currentRoute.value.query.category;
  queryParams.value.category = categoryVal;
  category.value = categoryVal;
  getList();
});
</script>

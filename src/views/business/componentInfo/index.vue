<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="4" :xs="24" style="">
        <el-card shadow="hover">
          <el-input v-model="categoryName" placeholder="请输入分类名称" prefix-icon="Search" clearable />
          <el-tree
            class="mt-2"
            ref="categoryTreeRef"
            node-key="id"
            :data="categoryOptions"
            :props="{ value: 'id',label: 'name', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template #default="{ node ,data }">
              <span>{{ node.label }} </span>
              <el-tag round>{{ data.num }}</el-tag>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div class="search" v-show="showSearch">
            <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
              <el-form-item label="品名" prop="name">
                <el-input v-model="queryParams.name" placeholder="请输入品名" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="物料号" prop="partNo">
                <el-input v-model="queryParams.partNo" placeholder="请输入物料号" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="图号" prop="drgNo">
                <el-input v-model="queryParams.drgNo" placeholder="请输入图号" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="材料" prop="material">
                <el-input v-model="queryParams.material" placeholder="请输入材料" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="规格" prop="spec">
                <el-input v-model="queryParams.spec" placeholder="请输入规格" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                  <el-option key="0" label="正常" value="0" />
                  <el-option key="1" label="停用" value="1" />
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
          <template #header>
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['business:componentInfo:add']">新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">展开/折叠</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-dropdown class="mt-[1px]">
                  <el-button plain type="info">
                    更多
                    <el-icon class="el-icon--right"><arrow-down /></el-icon
                  ></el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="importTemplate" icon="Download">下载模板</el-dropdown-item>
                      <el-dropdown-item @click="handleImport" icon="Top"> 导入数据</el-dropdown-item>
                      <el-dropdown-item @click="handleExport" icon="Download"> 导出数据</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
          </template>
          <el-table
            v-loading="loading"
            :data="componentInfoList"
            row-key="id"
            :default-expand-all="isExpandAll"
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
            ref="componentInfoTableRef"
          >
            <el-table-column label="所属分类" align="left" prop="categoryId" :formatter="categoryFormat" width="200px" />
            <el-table-column label="上级构件" align="center" prop="parentId" :formatter="componentFormat" width="200px" />
            <el-table-column label="料号" align="center" prop="partNo" width="150px" />
            <el-table-column label="品名" align="center" prop="name" width="150px" />
            <el-table-column label="状态" align="center" prop="status">
              <template #default="scope">
                <el-tag type="success" v-if="scope.row.status == 0">正常</el-tag>
                <el-tag type="warning" v-if="scope.row.status == 1">停用</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="型号" align="center" prop="type" width="100px" />
            <el-table-column label="图号" align="center" prop="drgNo" width="100px" />
            <el-table-column label="材料" align="center" prop="material" width="60px" />
            <el-table-column label="规格" align="center" prop="spec" width="100px" />
            <el-table-column label="理论尺寸" align="center" prop="theoreticalSize" width="100px" />
            <el-table-column label="物料尺寸" align="center" prop="materialSize" width="100px" />
            <el-table-column label="数量" align="center" prop="num" width="60px" />
            <el-table-column label="单位" align="center" prop="unit" width="60px" />
            <el-table-column label="长度" align="center" prop="length" width="60px" />
            <el-table-column label="米重(kg/m）" align="center" prop="meterWeight" width="100px" />

            <el-table-column label="单重(kg)" align="center" prop="weight" width="100px" />
            <el-table-column label="模具编号" align="center" prop="mouldNo" width="100px" />
            <el-table-column label="开条尺寸" align="center" prop="stripSize" width="100px" />
            <el-table-column label="卷宽" align="center" prop="seamWidth" width="100px" />
            <el-table-column label="生产工艺" align="center" prop="manufactureProcess" width="150px">
              <template #default="scope">
                <dict-tag :options="mfg_process" :value="scope.row.manufactureProcess" />
              </template>
            </el-table-column>
            <el-table-column label="成品完工物料号" align="center" prop="finishPartNo" width="150px" />
            <el-table-column label="黑件完工物料号" align="center" prop="blackPartNo" width="150px" />
            <el-table-column label="外协完工物料号" align="center" prop="outPartNo" width="150px" />
            <el-table-column label="备注" align="center" prop="remark" width="150px" />
            <el-table-column label="说明" align="center" prop="description" width="150px" />
            <el-table-column label="排序" align="center" prop="sort" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150px">
              <template #default="scope">
                <el-tooltip content="修改" placement="top" v-if="scope.row.status == 1">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:componentInfo:edit']" />
                </el-tooltip>
                <el-tooltip content="新增" placement="top">
                  <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['business:componentInfo:add']" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top" v-if="scope.row.status == 1">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:componentInfo:remove']" />
                </el-tooltip>
                <el-tooltip content="启用" placement="top" v-if="scope.row.status == 1">
                  <el-button
                    link
                    type="primary"
                    icon="VideoPlay"
                    @click="handleStatusChange(scope.row)"
                    v-hasPermi="['business:templateInfo:edit']"
                  ></el-button>
                </el-tooltip>
                <el-tooltip content="停用" placement="top" v-if="scope.row.status == 0">
                  <el-button
                    link
                    type="primary"
                    icon="VideoPause"
                    @click="handleStatusChange(scope.row)"
                    v-hasPermi="['business:templateInfo:edit']"
                  ></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <!-- 添加或修改构件信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="700px" append-to-body>
      <el-scrollbar style="height:800px;">
        <el-form ref="componentInfoFormRef" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="上级构件" prop="parentId">
            <el-tree-select
              v-model="form.parentId"
              :data="componentInfoOptions"
              :props="{ value: 'id', label: 'name', children: 'children' }"
              value-key="id"
              placeholder="请选择上级构件"
              check-strictly
            />
          </el-form-item>
          <el-form-item label="所属分类" prop="parentId">
            <el-tree-select
              v-model="form.categoryId"
              :data="categoryOptions"
              :props="{ value: 'id', label: 'name', children: 'children' }"
              value-key="id"
              placeholder="请选择所属分类"
              check-strictly
            />
          </el-form-item>
          <el-form-item label="品名" prop="name">
            <el-input v-model="form.name" placeholder="请输入品名" />
          </el-form-item>
          <el-form-item label="物料号" prop="partNo">
            <el-input v-model="form.partNo" placeholder="请输入物料号" />
          </el-form-item>
          <el-form-item label="图号" prop="drgNo">
            <el-input v-model="form.drgNo" placeholder="请输入图号" />
          </el-form-item>
          <el-form-item label="型号" prop="type">
            <el-input v-model="form.type" placeholder="请输入型号" />
          </el-form-item>
          <el-form-item label="材料" prop="material">
            <el-input v-model="form.material" placeholder="请输入材料" />
          </el-form-item>
          <el-form-item label="规格" prop="spec">
            <el-input v-model="form.spec" placeholder="请输入规格" />
          </el-form-item>
          <el-form-item label="理论尺寸" prop="theoreticalSize">
            <el-input v-model="form.theoreticalSize" placeholder="请输入理论尺寸" />
          </el-form-item>
          <el-form-item label="物料尺寸" prop="materialSize">
            <el-input v-model="form.materialSize" placeholder="请输入物料尺寸" />
          </el-form-item>
          <el-form-item label="数量" prop="num">
            <el-input-number v-model="form.num" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" placeholder="请输入单位" />
          </el-form-item>
          <el-form-item label="长度" prop="length">
            <el-input v-model="form.length" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="米重(kg/m）" prop="meterWeight">
            <el-input v-model="form.meterWeight" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="单重(kg)" prop="weight">
            <el-input v-model="form.weight" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="模具编号" prop="mouldNo">
            <el-input v-model="form.mouldNo" placeholder="请输入模具编号" />
          </el-form-item>
          <el-form-item label="开条尺寸" prop="stripSize">
            <el-input v-model="form.stripSize" placeholder="请输入开条尺寸" />
          </el-form-item>
          <el-form-item label="卷宽" prop="seamWidth">
            <el-input v-model="form.seamWidth" placeholder="请输入卷宽" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="说明" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="成品完工物料号" prop="finishPartNo">
            <el-input v-model="form.finishPartNo" placeholder="请输入成品完工物料号" />
          </el-form-item>
          <el-form-item label="黑件完工物料号" prop="blackPartNo">
            <el-input v-model="form.blackPartNo" placeholder="请输入黑件完工物料号" />
          </el-form-item>
          <el-form-item label="外协完工物料号" prop="outPartNo">
            <el-input v-model="form.outPartNo" placeholder="请输入外协完工物料号" />
          </el-form-item>
          <el-form-item label="生产工艺" prop="manufactureProcess">
            <el-select v-model="form.manufactureProcess" placeholder="请选择生产工艺">
              <el-option v-for="dict in mfg_process" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="form.sort" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="文件" prop="relaFileInfo">
            <file-upload v-model="form.relaFileInfo" :file-size="50" :file-type='["dwg", "pdf", "doc", "docx"]' />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?category=' + category"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload">
          <i-ep-upload-filled />
        </el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="text-center el-upload__tip">
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ComponentInfo" lang="ts">
import { listComponentInfo, getComponentInfo, delComponentInfo, addComponentInfo, updateComponentInfo, changeStatus} from "@/api/business/componentInfo";
import { listCategoryInfoNum } from "@/api/business/categoryInfo";
import { ComponentInfoVO, ComponentInfoQuery, ComponentInfoForm } from '@/api/business/componentInfo/types';
import { CategoryInfoVO } from '@/api/business/categoryInfo/types';
import { useRouter } from "vue-router";
import { globalHeaders } from "@/utils/request";
type ComponentInfoOption = {
  id: number;
  name: string;
  children?: ComponentInfoOption[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;;
//分类查询vo
const categoryOptions = ref<CategoryInfoVO[]>([]);
const categoryName = ref('');
const categoryTreeRef = ref<ElTreeInstance>();
const router = useRouter();
const categoryData = ref([]);
const componentData = ref([]);
const { mfg_process } = toRefs<any>(proxy?.useDict('mfg_process'));
/*** 构件导入参数 */
const upload = reactive<ImportOption>({
  // 是否显示弹出层
  open: false,
  // 弹出层标题
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/business/componentInfo/import"
})
const componentInfoList = ref<ComponentInfoVO[]>([]);
const componentInfoOptions = ref<ComponentInfoOption[]>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);
const loading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const componentInfoFormRef = ref<ElFormInstance>();
const componentInfoTableRef = ref<ElTableInstance>()

const dialog = reactive<DialogOption>({
    visible: false,
    title: ''
});

const uploadRef = ref<ElUploadInstance>();

const initFormData: ComponentInfoForm = {
    id: undefined,
    category: undefined,
    categoryId: undefined,
    parentId: undefined,
    name: undefined,
    partNo: undefined,
    type: undefined,
    drgNo: undefined,
    material: undefined,
    spec: undefined,
    theoreticalSize: undefined,
    materialSize: undefined,
    num: undefined,
    unit: undefined,
    length: undefined,
    meterWeight: undefined,
    weight: undefined,
    mouldNo: undefined,
    stripSize: undefined,
    seamWidth: undefined,
    remark: undefined,
    description: undefined,
    finishPartNo: undefined,
    blackPartNo: undefined,
    outPartNo: undefined,
    manufactureProcess: undefined,
    status: undefined,
    sort: undefined,
    tenantId: undefined
}

const data = reactive<PageData<ComponentInfoForm, ComponentInfoQuery>>({
  form: {...initFormData},
  queryParams: {
    category: undefined,
    categoryId: undefined,
    parentId: undefined,
    name: undefined,
    partNo: undefined,
    type: undefined,
    drgNo: undefined,
    material: undefined,
    spec: undefined,
    theoreticalSize: undefined,
    materialSize: undefined,
    num: undefined,
    unit: undefined,
    length: undefined,
    meterWeight: undefined,
    weight: undefined,
    mouldNo: undefined,
    stripSize: undefined,
    seamWidth: undefined,
    description: undefined,
    finishPartNo: undefined,
    blackPartNo: undefined,
    outPartNo: undefined,
    manufactureProcess: undefined,
    status: undefined,
    sort: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    category: [
      { required: true, message: "分类不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "所属分类不能为空", trigger: "change" }
    ],
    parentId: [
      { required: true, message: "父ID不能为空", trigger: "blur" }
    ],
    sort: [
      { required: true, message: "排序不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "品名不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询构件信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listComponentInfo(queryParams.value);
  const data = proxy?.handleTree<ComponentInfoVO>(res.data, "id", "parentId");
  if (data) {
    componentInfoList.value = data;
    loading.value = false;
  }
}

const getCompontList =  async ()=>{
  const res = await listComponentInfo();
  componentData.value = res.data;
}


/** 查询构件信息下拉树结构 */
const getTreeselect = async () => {
  const query = {"category":category.value};
  const res = await listComponentInfo(query);
  componentInfoOptions.value = [];
  const data: ComponentInfoOption = { id: 0, name: '顶级节点', children: [] };
  data.children = proxy?.handleTree<ComponentInfoOption>(res.data, "id", "parentId");
  componentInfoOptions.value.push(data);
}

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
}

// 表单重置
const reset = () => {
  form.value = {...initFormData}
  componentInfoFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  categoryTreeRef.value?.setCurrentKey(undefined);
  handleQuery();
}

/** 新增按钮操作 */
const handleAdd = (row?: ComponentInfoVO) => {
  reset();
  getTreeselect();
  if (row != null && row.id) {
      form.value.parentId = row.id;
  } else {
      form.value.parentId = 0;
  }
  //默认排序 最低排序值
  form.value.sort = 0;
  dialog.visible = true;
  dialog.title = "添加构件信息";
}

/** 展开/折叠操作 */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(componentInfoList.value, isExpandAll.value)
}

/** 展开/折叠操作 */
const toggleExpandAll = (data: ComponentInfoVO[], status: boolean) => {
  data.forEach((item) => {
    componentInfoTableRef.value?.toggleRowExpansion(item, status)
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status)
  })
}

/** 修改按钮操作 */
const handleUpdate = async (row: ComponentInfoVO) => {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getComponentInfo(row.id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改构件信息";
}

/** 提交按钮 */
const submitForm = () => {
  componentInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateComponentInfo(form.value).finally(() => buttonLoading.value = false);
      } else {
        form.value.category = category.value;
        await addComponentInfo(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      getTreeSelect();
      getCompontList();
      getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: ComponentInfoVO) => {
  await proxy?.$modal.confirm('是否确认删除构件信息编号为"' + row.id + '"的数据项？');
  loading.value = true;
  await delComponentInfo(row.id).finally(() => loading.value = false);
  await getList();
  await getTreeSelect();
  await getCompontList();
  proxy?.$modal.msgSuccess("删除成功");
}

/** 节点单击事件 */
const handleNodeClick = (data: CategoryInfoVO) => {
  queryParams.value.categoryId = data.id;
  handleQuery()
}

/** 通过条件过滤节点  */
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.indexOf(value) !== -1
}

/** 根据名称筛选部门树 */
watchEffect(
  () => { categoryTreeRef.value?.filter(categoryName.value); },
  {
    flush: 'post' // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);
/** 查询分类下拉树结构 */
const getTreeSelect = async () => {
  const res = await listCategoryInfoNum(queryParams.value);
  categoryData.value = res.data;
  categoryOptions.value = proxy?.handleTree<CategoryInfoVO>(res.data, "id", "parentId");
};
const category = ref();
onMounted(() => {
  //设置路由的参数
  const categoryVal = router.currentRoute.value.query.category;
  queryParams.value.category = categoryVal;
  category.value = categoryVal;
  getTreeSelect();
  getCompontList();
  getList();
});

//分类formatter
const categoryFormat = (row: any, column: any, cellValue: any, index: any) =>  {
  return categoryData.value.find(data =>data.id === cellValue)?.name ?? '';
}
//组件formatter
const componentFormat = (row: any, column: any, cellValue: any, index: any) =>  {
  if(cellValue == 0){
    return "顶级节点";
  }
  return componentData.value.find(data =>data.id === cellValue)?.name ?? '';
}
/** 状态修改  */
const handleStatusChange = async (row: ComponentInfoVO) => {
  let status = row.status;
  status = status === 0 ? 1 : 0;
  let text = status === 0 ? "启用" : "停用"
  try {
    await proxy?.$modal.confirm('确认要"' + text + '"吗?')
    await changeStatus(row.id, status);
    proxy?.$modal.msgSuccess(text + "成功");
    row.status = row.status === 0 ? 1 : 0;
  } catch (err) {
    row.status = row.status === 0 ? 1 : 0;
  }
}
/** 下载模板操作 */
const importTemplate = () => {
  proxy?.download("business/componentInfo/importTemplate", {
  }, `component_template_${new Date().getTime()}.xlsx`);
}

/** 导入按钮操作 */
const handleImport = () => {
  upload.title = "构件信息导入";
  upload.open = true;
}
/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download("business/componentInfo/export", {
    ...queryParams.value,
  }, `component_${new Date().getTime()}.xlsx`);
};


/**文件上传中处理 */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
}
/** 文件上传成功处理 */
const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getTreeSelect();
  getCompontList();
  getList();
}
/** 提交上传文件 */
function submitFileForm() {
  uploadRef.value?.submit();
}
</script>

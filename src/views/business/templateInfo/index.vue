<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入模板名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select v-model="queryParams.category" placeholder="请选择分类" clearable>
              <el-option v-for="dict in template_category" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['business:templateInfo:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['business:templateInfo:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['business:templateInfo:remove']"
              >删除</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="templateInfoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" width="50px" align="center" type="index" />
        <el-table-column label="主键" align="center" prop="id" v-if="false" />
        <el-table-column label="模板名称" align="center" prop="name" />
        <el-table-column label="模板说明" align="center" prop="description" />
        <el-table-column label="分类" align="center" prop="category">
          <template #default="scope">
            <dict-tag :options="template_category" :value="scope.row.category" />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status == 0">正常</el-tag>
            <el-tag type="warning" v-if="scope.row.status == 1">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <el-table-column label="更新时间" align="center" prop="updateTime" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top" v-if="scope.row.status == 1">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:templateInfo:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" v-if="scope.row.status == 1">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:templateInfo:remove']"></el-button>
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

            <el-tooltip content="设计" placement="top" v-if="scope.row.status == 1">
              <el-button
                link
                type="primary"
                icon="Setting"
                @click="handleEditExcel(scope.row)"
                v-hasPermi="['business:templateInfo:edit']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改项目资料模板对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="templateInfoFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option v-for="dict in template_category" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
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

<script setup name="TemplateInfo" lang="ts">
import { listTemplateInfo, getTemplateInfo, delTemplateInfo, addTemplateInfo, updateTemplateInfo,changeStatus } from '@/api/business/templateInfo';
import { TemplateInfoVO, TemplateInfoQuery, TemplateInfoForm } from '@/api/business/templateInfo/types';
import {createFile, delFileByVer, getFileInfo, getUserFileList} from "@/api/excel";
import {useRouter} from "vue-router";
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { template_category } = toRefs<any>(proxy?.useDict('template_category'));

const templateInfoList = ref<TemplateInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const templateInfoFormRef = ref<ElFormInstance>();

const type = ref();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TemplateInfoForm = {
  id: undefined,
  name: undefined,
  description: undefined,
  type: undefined,
  category: undefined,
  status: undefined,
  onlineFileId: undefined,
}
const data = reactive<PageData<TemplateInfoForm, TemplateInfoQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    category: undefined,
    status: undefined,
    type: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "模板名称不能为空", trigger: "blur" }
    ],
    description: [
    ],
    category: [
      { required: true, message: "分类不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目资料模板列表 */
const getList = async () => {
  loading.value = true;
  const res = await listTemplateInfo(queryParams.value);
  templateInfoList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  templateInfoFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: TemplateInfoVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加项目资料模板";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: TemplateInfoVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getTemplateInfo(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改项目资料模板";
}

/** 提交按钮 */
const submitForm = () => {
  templateInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateTemplateInfo(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        //设置状态
        form.value.type = type.value;
        await addTemplateInfo(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: TemplateInfoVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除项目资料模板编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delTemplateInfo(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('business/templateInfo/export', {
    ...queryParams.value
  }, `templateInfo_${new Date().getTime()}.xlsx`)
}

/** 状态修改  */
const handleStatusChange = async (row: TemplateInfoVO) => {
  let status = row.status;
  status = status === 0 ? 1 : 0;
  let text = status === 0 ? "启用" : "停用"
  try {
    await proxy?.$modal.confirm('确认要"' + text + '"吗?')
    await changeStatus(row.id, status);
    proxy?.$modal.msgSuccess(text + "成功");
    row.status = row.status === 0 ? 1 : 0;
  } catch (err) { /* empty */ }
}

onMounted(() => {
  //设置路由的参数
  const typeVal = router.currentRoute.value.query.type;
  queryParams.value.type = typeVal;
  type.value = typeVal;
  getList();
});

const onlineFileForm = ref({
  name: '',
  remark: ''
});
/** 编辑内容  */
const handleEditExcel = async (row: TemplateInfoVO) => {
  //判断是否已存在excel文件信息 存在 直接跳转 不存在需要直接创建excel文件信息
  if(row.onlineFileId != null ){
    //根据fileId 查询最新数据
    router.push({ path: '/excel/info', query: { id:row.onlineFileId, isHistoryStatus: 1, purview: 1 } })
  }else {
    //创建文件信息
    onlineFileForm.value.name = row.name;
    onlineFileForm.value.remark = row.description;
    //调用excel创建接口
    const res = await createFile(onlineFileForm.value);
    const editForm = {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      category: row.category,
      status: row.status,
      onlineFileId: res.data
    }
    await updateTemplateInfo(editForm);
    row.onlineFileId =  res.data;
    //创建文件版本
    router.push({path: '/excel/info', query: {id:res.data, isHistoryStatus: 1, purview: 1}})
  }
}
</script>

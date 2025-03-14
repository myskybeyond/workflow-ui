<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="应用类型" prop="appType">
            <el-select v-model="queryParams.appType" clearable>
              <el-option v-for="dict in third_app_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="应用名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入应用名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" clearable>
              <el-option v-for="dict in third_app_org_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['business:appInfo:add']">新增 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="appInfoList" @selection-change="handleSelectionChange">
        <el-table-column type="index" width="55" align="center" label="序号" />
        <el-table-column label="应用类型" align="center" prop="appType">
          <template #default="scope">
            <dict-tag :options="third_app_type" :value="scope.row.appType" />
          </template>
        </el-table-column>
        <el-table-column label="应用名称" align="center" prop="name" />
        <el-table-column label="客户端编号" align="center" prop="appKey" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="third_app_org_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <el-table-column label="更新时间" align="center" prop="updateTime" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['business:appInfo:query']">详情 </el-button>
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:appInfo:edit']">修改 </el-button>
            <el-button
              link
              type="primary"
              icon="TurnOff"
              @click="changeAppState(scope.row.id, 1)"
              v-hasPermi="['business:appInfo:changeState']"
              v-if="scope.row.status === 0"
              >停用
            </el-button>
            <el-button
              link
              type="primary"
              icon="Open"
              @click="changeAppState(scope.row.id, 0)"
              v-hasPermi="['business:appInfo:changeState']"
              v-if="scope.row.status === 1"
              >启用
            </el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:appInfo:remove']">删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改应用信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="appInfoFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="应用类型" prop="appType">
          <el-select v-model="form.appType" clearable :disabled="isReadOnly" @change="addAppCodePrefix">
            <el-option v-for="dict in third_app_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="应用编码" prop="appCode">
          <el-input v-model="form.appCode" placeholder="请输入" style="width: 220px;" :disabled="isReadOnly" />
        </el-form-item>
        <el-form-item label="应用名称" prop="name" style="width: 340px;">
          <el-input v-model="form.name" placeholder="请输入" :disabled="isReadOnly" />
        </el-form-item>
        <el-form-item label="排序" prop="sort" style="width: 340px;">
          <el-input-number v-model="form.sort" :step="1" step-strictly :disabled="isReadOnly" />
        </el-form-item>
        <el-form-item label="客户端编号" prop="appKey" style="width: 340px;">
          <el-input v-model="form.appKey" placeholder="请输入" :disabled="isReadOnly" />
        </el-form-item>
        <el-form-item label="客户端密钥" prop="appSecret" style="width: 340px;">
          <el-input v-model="form.appSecret" placeholder="请输入" :disabled="isReadOnly" />
        </el-form-item>
        <el-form-item label="agent_id" prop="agentId" style="width: 340px;">
          <el-input v-model="form.agentId" placeholder="请输入" :disabled="isReadOnly" />
        </el-form-item>
      </el-form>
      <template #footer v-if="dialog.title !== '查看应用信息'">
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AppInfo" lang="ts">
import { listAppInfo, getAppInfo, delAppInfo, addAppInfo, updateAppInfo, changeState } from "@/api/business/appInfo";
import { AppInfoVO, AppInfoQuery, AppInfoForm } from "@/api/business/appInfo/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const isReadOnly = ref(false); // 控制表单是否只读
const appInfoList = ref<AppInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const appInfoFormRef = ref<ElFormInstance>();
const { third_app_type } = toRefs<any>(proxy?.useDict("third_app_type"));
const { third_app_org_status } = toRefs<any>(proxy?.useDict("third_app_org_status"));
const dialog = reactive<DialogOption>({
  visible: false,
  title: ""
});

const initFormData: AppInfoForm = {
  id: undefined,
  name: undefined,
  appType: undefined,
  appKey: undefined,
  appSecret: undefined,
  agentId: undefined,
  status: undefined,
  appCode: undefined,
  sort: undefined
};
const data = reactive<PageData<AppInfoForm, AppInfoQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    appType: undefined,
    appKey: undefined,
    appSecret: undefined,
    agentId: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "应用名称不能为空", trigger: "blur" }
    ],
    appType: [
      { required: true, message: "应用类型不能为空", trigger: "change" }
    ],
    appKey: [
      { required: true, message: "客户端编号不能为空", trigger: "blur" }
    ],
    appSecret: [
      { required: true, message: "客户端密钥不能为空", trigger: "blur" }
    ],
    agentId: [
      { required: true, message: "AGENT_ID不能为空", trigger: "blur" }
    ],
    appCode: [{ required: true, message: "应用编码不能为空", trigger: "blur" }],
    sort: [
      { required: true, message: "排序不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询应用信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAppInfo(queryParams.value);
  appInfoList.value = res.rows;
  total.value = res.total;
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
  appInfoFormRef.value?.resetFields();
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

/** 多选框选中数据 */
const handleSelectionChange = (selection: AppInfoVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增应用";
  isReadOnly.value = false;
};

/** 修改按钮操作 */
const handleUpdate = async (row?: AppInfoVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getAppInfo(_id);
  Object.assign(form.value, res.data);
  // form.value.appCode =  form.value.appCode?.split('-')[1];
  dialog.visible = true;
  dialog.title = "修改应用";
  isReadOnly.value = false;
};

/** 提交按钮 */
const submitForm = () => {
  appInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateAppInfo(form.value).finally(() => buttonLoading.value = false);
      } else {
        form.value.status = 0;
        await addAppInfo(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: AppInfoVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm("是否确认删除应用信息编号为\"" + _ids + "\"的数据项？").finally(() => loading.value = false);
  await delAppInfo(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
};

/** 修改状态 */
const changeAppState = async (rowId?: string | number, state?: string | number) => {
  if (state === 1) {
    await proxy?.$modal.confirm("是否确认停用应用为【\"" + rowId + "\"】的数据项？停用后将无法辅助登录和发送钉钉通知消息。").finally(() => loading.value = false);
  }
  await changeState(rowId, state);
  proxy?.$modal.msgSuccess("修改成功");
  await getList();
};
/** 查看详情 */
const handleDetail = async (row?: AppInfoVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getAppInfo(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "查看应用信息";
  isReadOnly.value = true;
};
const addAppCodePrefix = (val: string) => {
  form.value.appCode = val ? val.toLowerCase() + '-' : val;
}
onMounted(() => {
  getList();
});
</script>

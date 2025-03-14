<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入模板名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="模板编码" prop="code">
            <el-input v-model="queryParams.code" placeholder="请输入模板编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" clearable>
              <el-option v-for="dict in sms_template_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['business:smsTemplateInfo:add']">新增 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table v-loading="loading" :data="smsTemplateInfoList">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column label="模板名称" align="center" prop="name" width="180" show-tooltip-when-overflow />
        <el-table-column label="模板编码" align="center" prop="code" width="200" show-tooltip-when-overflow />
        <el-table-column label="模板内容" align="center" prop="content" show-tooltip-when-overflow />
        <el-table-column label="状态" align="center" prop="status" width="50">
          <template #default="scope">
            <dict-tag :options="sms_template_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:smsTemplateInfo:edit']"
                >修改
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['business:smsTemplateInfo:remove']"
                v-if="scope.row.status === 1"
                >删除
              </el-button>
            </el-tooltip>
            <el-button
              link
              type="primary"
              icon="VideoPause"
              @click="changeAppState(scope.row.id, 1)"
              v-hasPermi="['business:smsTemplateInfo:changestate']"
              v-if="scope.row.status === 0"
              >停用
            </el-button>
            <el-button
              link
              type="primary"
              icon="VideoPlay"
              @click="changeAppState(scope.row.id, 0)"
              v-hasPermi="['business:smsTemplateInfo:changestate']"
              v-if="scope.row.status === 1"
              >启用
            </el-button>
            <el-button link type="primary" icon="Pointer" @click="handleTestSend(scope.row)" v-hasPermi="['business:smsTemplateInfo:test']"
              >测试
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改消息模板信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" append-to-body>
      <el-row class="mt-2">
        <el-col :span="8">
          <msg-template-variables-tree @passVariable="receiveVariable" />
        </el-col>
        <el-col :span="1"></el-col>
        <el-col :span="14">
          <el-form ref="smsTemplateInfoFormRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入模板名称" />
            </el-form-item>
            <el-form-item label="模板编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入模板编码" />
            </el-form-item>
            <el-form-item label="模板内容" prop="content">
              <el-input v-model="form.content" type="textarea" placeholder="请输入模板内容" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="1"></el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!--      测试发送的对话框-->
    <el-dialog title="测试发送" v-model="testSendDialog" width="500px" append-to-body>
      <el-form ref="testSendFromRef" :model="testSendForm" :rules="testSendFormRules" label-width="120px">
        <el-form-item label="模板内容" prop="content">
          <el-input v-model="testSendForm.content" type="textarea" disabled />
        </el-form-item>
        <el-form-item label="应用类型" prop="appType">
          <el-select v-model="testSendForm.appType" clearable @change="getAppOptions" style="width: 360px;">
            <el-option v-for="dict in third_app_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="应用名称" prop="appCode">
          <el-select v-model="testSendForm.appCode" clearable placeholder="请选择" filterable style="width: 360px;" @change="getUserOptions">
            <el-option v-for="app in appOptions" :key="app.id" :label="app.name" :value="app.appCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="应用用户ID" prop="userId">
          <el-select v-model="testSendForm.userId" clearable placeholder="请选择" filterable style="width: 360px;">
            <el-option v-for="user in userSelectOptions" :key="user.userId" :label="user.userName" :value="user.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数" prop="contentParams">
          <el-input v-model="testSendForm.contentParams" placeholder="{attr1: val1, attr2: val2}" />
        </el-form-item>
        <span style="color:red;margin: 0 25px">参数格式说明：{"attr1": "val1", "attr2": "val2", ... }有几个写几个</span>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitSendTest">确 定</el-button>
          <el-button @click="cancelSendTestDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SmsTemplateInfo" lang="ts">
import {
  addSmsTemplateInfo,
  changeState,
  delSmsTemplateInfo,
  getSmsTemplateInfo,
  listSmsTemplateInfo,
  testSendTemplateMsg,
  updateSmsTemplateInfo
} from "@/api/business/smsTemplateInfo";
import { SmsTemplateInfoForm, SmsTemplateInfoQuery, SmsTemplateInfoVO } from "@/api/business/smsTemplateInfo/types";
import { listAll } from "@/api/business/appInfo";
import { ref } from "vue";
import { AppInfoVO } from "@/api/business/appInfo/types";
import { appUserList } from "@/api/system/social/auth";
import MsgTemplateVariablesTree from "@/views/business/smsTemplateInfo/components/MsgTemplateVariables.vue";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sms_template_status, third_app_type } = toRefs<any>(proxy?.useDict("sms_template_status", "third_app_type"));
const smsTemplateInfoList = ref<SmsTemplateInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const total = ref(0);
const testSendDialog = ref(false);
const queryFormRef = ref<ElFormInstance>();
const smsTemplateInfoFormRef = ref<ElFormInstance>();
const testSendFromRef = ref<ElFormInstance>();
const appOptions = ref<AppInfoVO[]>();
const userSelectOptions = ref<any[]>();

interface testSendFormType {
  content: undefined | string,
  appType: undefined,
  appCode: undefined,
  userId: undefined,
  contentParams: string,
  templateId: string | number
}

const testSendForm = ref<testSendFormType>({
  content: undefined,
  appType: undefined,
  appCode: undefined,
  userId: undefined,
  contentParams: "",
  templateId: ""
});
const testSendFormRules = ref({
  content: [
    { required: true, message: "模板内容不能为空", trigger: "blur" }
  ],
  appType: [
    { required: true, message: "不能为空", trigger: "change" }
  ],
  appCode: [
    { required: true, message: "不能为空", trigger: "change" }
  ],
  userId: [
    { required: true, message: "不能为空", trigger: "change" }
  ],
  contentParams: [
    { required: true, message: "参数不能为空", trigger: "blur" }
  ]
});
const dialog = reactive<DialogOption>({
  visible: false,
  title: ""
});

const initFormData: SmsTemplateInfoForm = {
  id: undefined,
  name: undefined,
  code: undefined,
  content: undefined,
  status: undefined,
  remark: undefined
};
const data = reactive<PageData<SmsTemplateInfoForm, SmsTemplateInfoQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    code: undefined,
    content: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "模板名称不能为空", trigger: "blur" }
    ],
    code: [
      { required: true, message: "模板编码不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "模板内容不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询消息模板信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSmsTemplateInfo(queryParams.value);
  smsTemplateInfoList.value = res.rows;
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
  smsTemplateInfoFormRef.value?.resetFields();
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
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增消息模板";
};

/** 修改按钮操作 */
const handleUpdate = async (row?: SmsTemplateInfoVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getSmsTemplateInfo(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改消息模板";
};

/** 提交按钮 */
const submitForm = () => {
  smsTemplateInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateSmsTemplateInfo(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addSmsTemplateInfo(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: SmsTemplateInfoVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm("是否确认删除消息模板信息编号为\"" + _ids + "\"的数据项？").finally(() => loading.value = false);
  await delSmsTemplateInfo(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
};
/** 修改状态 */
const changeAppState = async (rowId?: string | number, state?: string | number) => {
  if (state === 1) {
    await proxy?.$modal.confirm("是否确认停用消息模板为【\"" + rowId + "\"】的数据项？停用后将不能发送此模板消息。").finally(() => loading.value = false);
  }
  await changeState(rowId, state);
  proxy?.$modal.msgSuccess("修改成功");
  await getList();
};
const getAppOptions = async (appType: string) => {
  const params = { appType: appType };
  const res = await listAll(params);
  appOptions.value = res.data;
};
const getUserOptions = async () => {
  if (testSendForm.value.appType && testSendForm.value.appCode) {
    const res = await appUserList(testSendForm.value.appType, testSendForm.value.appCode);
    if (res) {
      userSelectOptions.value = res.data;
    }
  }
};
const handleTestSend = (row: SmsTemplateInfoVO) => {
  testSendDialog.value = true;
  testSendForm.value.content = row.content;
  testSendForm.value.templateId = row.id;
};
const submitSendTest = async () => {
  const templateParams = testSendForm.value.contentParams;
  testSendForm.value.contentParams = JSON.parse(templateParams);
  testSendFromRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const res = await testSendTemplateMsg(testSendForm.value);
      if (res && res.code === 200) {
        ElMessage.success("发送成功");
        testSendDialog.value = false;
        testSendFromRef.value?.resetFields();
      }
    }
  });
};
const cancelSendTestDialog = () => {
  testSendFromRef.value?.resetFields();
  testSendDialog.value = false;
};
const receiveVariable = (variable: string) => {
  form.value.content = form.value.content?.concat("${").concat(variable).concat("}");
};
onMounted(() => {
  getList();
});
</script>

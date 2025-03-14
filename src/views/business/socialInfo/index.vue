<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="85px">
          <el-form-item label="应用类型" prop="appType">
            <el-select v-model="queryParams.appType" clearable>
              <el-option v-for="dict in third_app_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="应用名称" prop="appName">
            <el-input v-model="queryParams.appName" placeholder="请输入" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="用户名称" prop="systemUserName">
            <el-input v-model="queryParams.systemUserName" placeholder="请输入" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="应用用户ID" prop="openId">
            <el-input v-model="queryParams.openId" placeholder="请输入" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['app:social:bind']">绑定 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="tableList">
        <el-table-column label="序号" width="50" type="index"></el-table-column>
        <el-table-column label="应用类型" align="center" prop="appType" width="180">
          <template #default="scope">
            <dict-tag :options="third_app_type" :value="scope.row.appType" />
          </template>
        </el-table-column>
        <el-table-column label="应用名称" align="center" prop="appName" />
        <el-table-column label="用户名称" align="center" prop="systemUserName" />
        <el-table-column label="用户姓名" align="center" prop="systemNickName" />
        <el-table-column label="应用用户ID" align="center" prop="openId" />
        <el-table-column label="应用用户姓名" align="center" prop="nickName" />
        <el-table-column label="创建时间" width="180" align="center" prop="createTime" />
        <el-table-column label="更新时间" width="180" align="center" prop="updateTime" />
        <el-table-column label="操作" width="80" align="center" class-name="small-padding fixed-width">
          <template v-slot="scope">
            <el-button size="small" type="primary" link @click="unlockAuth(scope.row)" v-hasPermi="['app:social:delete']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改应用信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="470px" append-to-body @close="getList">
      <el-form ref="appInfoFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="应用类型" prop="appType">
          <el-select v-model="form.appType" clearable @change="getAppOptions">
            <el-option v-for="dict in third_app_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="应用名称" prop="name" style="width: 340px;">
          <el-select v-model="form.appName" clearable placeholder="请选择" filterable @change="generateDingTalkAuthQrcode">
            <el-option v-for="app in appOptions" :key="app.id" :label="app.name" :value="app.appCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名称" prop="appKey" style="width: 340px;">
          <el-select v-model="form.userId" clearable placeholder="请选择" filterable @change="generateDingTalkAuthQrcode">
            <el-option v-for="user in userSelectOptions" :key="user.userId" :label="user.userName" :value="user.userId" />
          </el-select>
        </el-form-item>
        <div style="margin-top: -30px; margin-bottom: -10px;">
          <ding-talk-auth-qrcode
            style="margin-left: 45px;"
            v-if="show"
            :app-code="app?.appCode.toUpperCase()"
            :app-key="app?.appKey"
            @callback="callbackByCode"
          >
          </ding-talk-auth-qrcode>
          <div style="height: 400px; width: 365px; display: flex; justify-content: center; align-items: center;" v-else>
            <div
              style="height: 200px; width: 290px; display: flex; justify-content: center; align-items: center;border: 1px solid rgb(233,226,232);margin-left: 20px;margin-top: -125px;"
            >
              选择表单项生成二维码后扫码绑定
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="margin-top: -40px;">
          <el-button @click="getList">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SocialInfo" lang="ts">
import { listAll } from "@/api/business/appInfo";
import { authUnlock, listAuthList } from "@/api/system/social/auth";
import { ref } from "vue";
import { UserVO } from "@/api/system/user/types";
import { userOptions } from "@/api/system/user";
import { AppInfoVO } from "@/api/business/appInfo/types";
import { LoginData } from "@/api/types";
import { callbackBind } from "@/api/login";
import { useRoute } from "vue-router";

const route = useRoute();
const app = ref<AppInfoVO>();
const show = ref(false);
const userSelectOptions = ref<UserVO[]>();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const tableList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const appOptions = ref<AppInfoVO[]>();
const queryFormRef = ref<ElFormInstance>();
const appInfoFormRef = ref<ElFormInstance>();
const dingTalkQrcode = ref("");
const { third_app_type } = toRefs<any>(proxy?.useDict("third_app_type"));
const dialog = reactive<DialogOption>({
  visible: false,
  title: ""
});
const initFormData: any = {
  appName: undefined,
  appType: undefined,
  userId: undefined,
  openId: undefined
};
const data = reactive<PageData<any, any>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    appName: undefined,
    appType: undefined,
    systemUserName: undefined,
    openId: undefined
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
    appCode: [{ required: true, message: "应用编码不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询应用信息列表 */
const getList = async () => {
  dialog.visible = false;
  loading.value = true;
  const res = await listAuthList(queryParams.value);
  tableList.value = res.rows;
  total.value = res.total;
  loading.value = false;
  show.value = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  appInfoFormRef.value?.resetFields();
  dingTalkQrcode.value = "";
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
  dialog.title = "绑定用户信息";
};

const unlockAuth = (row: any) => {
  ElMessageBox.confirm("您确定要删除\"" + row.source + "\"的账号绑定吗？")
    .then(() => {
      return authUnlock(row.id);
    }).then((res: any) => {
    if (res.code === 200) {
      proxy?.$modal.msgSuccess("解绑成功");
      proxy?.$tab.refreshPage();
    } else {
      proxy?.$modal.msgError(res.msg);
    }
  }).catch(() => {
  });
};
const getUserOptions = async () => {
  const res = await userOptions();
  if (res) {
    userSelectOptions.value = res.data;
  }
};
const getAppOptions = async (appType: string) => {
  const params = { appType: appType };
  const res = await listAll(params);
  appOptions.value = res.data;
};
const generateDingTalkAuthQrcode = async () => {
  show.value = false;
  if (form.value.appType && form.value.appName && form.value.userId) {
    app.value = appOptions.value?.find(a => a.appCode === form.value.appName);
    show.value = true;
  }
};

const callbackByCode = async (params: any) => {
  const data: LoginData = {
    socialCode: params.code,
    socialState: params.state,
    // tenantId: tenantId,
    source: app.value?.appCode.toUpperCase(),
    clientId: "e5cd7e4891bf95d1d19206ce24a7b32e",
    grantType: "social",
    userId: form.value.userId,
    appId: app.value?.id.toString()
  };
  try {
    const res = await callbackBind(data);
    await processResponse(res);
  } catch (error) {
    handleError(error);
  }
};
const processResponse = async (res: any) => {
  if (res.code !== 200) {
    throw new Error(res.msg);
  }
  ElMessage.success(res.msg);
  resetAppInfo();
};
const handleError = (error: any) => {
  ElMessage.error(error.message);
};
const resetAppInfo = () => {
  show.value = false;
  app.value = {
    agentId: "", appSecret: "", appType: "", name: "", status: 0,
    id: "",
    appKey: "",
    appCode: ""
  };
  getList();
};
watch(() => route.query.userName,
  (newUserName, oldUserName) => {
    queryParams.value.systemUserName = newUserName;
    console.log(`New user name: ${newUserName}, Old user name: ${oldUserName}`);
    getList();
  },
  { immediate: true });
onMounted(() => {
  getList();
  getUserOptions();
});
</script>

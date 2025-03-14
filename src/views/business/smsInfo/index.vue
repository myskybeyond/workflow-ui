<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="108px">
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="queryParams.projectName" placeholder="请输入项目名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="销售订单名称" prop="orderName">
            <el-input v-model="queryParams.orderName" placeholder="请输入销售订单名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="来源用户名称" prop="sourceUserId">
            <el-select v-model="queryParams.sourceUserId" clearable placeholder="请选择" filterable>
              <el-option v-for="user in userSelectOptions" :key="user.userId" :label="user.userName" :value="user.userId" />
            </el-select>
          </el-form-item>
          <el-form-item label="接收用户名称" prop="userId">
            <el-select v-model="queryParams.userId" clearable placeholder="请选择" filterable>
              <el-option v-for="user in userSelectOptions" :key="user.userId" :label="user.userName" :value="user.userId" />
            </el-select>
          </el-form-item>
          <el-form-item label="流程名称" prop="procName">
            <el-input v-model="queryParams.procName" placeholder="请输入" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="节点名称" prop="name">
            <el-input v-model="queryParams.procNodeName" placeholder="请输入" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="smsInfoList">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column label="项目名称" align="center" prop="projectName" show-tooltip-when-overflow />
        <el-table-column label="销售订单名称" align="center" prop="orderName" show-tooltip-when-overflow />
        <el-table-column label="流程名称" align="center" prop="procName" show-tooltip-when-overflow />
        <el-table-column label="节点名称" align="center" prop="procNodeName" />
        <el-table-column label="来源用户名称" align="center">
          <template #default="scope">
            {{ getUserNameById(scope.row.sourceUserId) }}
          </template>
        </el-table-column>
        <el-table-column label="接收用户名称" align="center">
          <template #default="scope">
            {{ getUserNameById(scope.row.userId) }}
          </template>
        </el-table-column>
        <el-table-column label="模板名称" align="center" prop="name" />
        <el-table-column label="模板编码" align="center" prop="code" />
        <el-table-column label="消息内容" align="center" prop="content" show-tooltip-when-overflow />
        <el-table-column label="消息参数" align="center" prop="smsParams" show-tooltip-when-overflow />
        <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" icon="Tickets" @click="handleDetail(scope.row)" v-hasPermi="['business:smsInfo:query']">详情 </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 消息历史记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <div style="margin: 0 10px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="项目名称：">
              {{ form.projectName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售订单名称：">
              {{ form.orderName }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="流程名称：">
              {{ form.procName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="节点名称:"> {{ form.procNodeName }}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="来源用户名称：">
              {{ getUserNameById(form.sourceUserId) }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接收用户名称：">
              {{ getUserNameById(form.userId) }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="模板名称：">
              {{ form.name }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板编码：">
              {{ form.code }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="消息内容：" style="width: 620px;">
              <el-input type="textarea" v-model="form.content" disabled />
            </el-form-item>
          </el-col>
          <el-col></el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="消息参数：" style="width: 620px;">
              <el-input type="textarea" v-model="form.smsParams" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24"> 创建时间：{{ form.createTime }}</el-col>
        </el-row>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SmsInfo" lang="ts">
import { listSmsInfo, getSmsInfo } from "@/api/business/smsInfo";
import { SmsInfoVO, SmsInfoQuery, SmsInfoForm } from "@/api/business/smsInfo/types";
import { ref } from "vue";
import { UserVO } from "@/api/system/user/types";
import { userOptions } from "@/api/system/user";
import { getUserNameById } from "@/utils/userCommonUtil";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const smsInfoList = ref<SmsInfoVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const userSelectOptions = ref<UserVO[]>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ""
});
const getUserOptions = async () => {
  const res = await userOptions();
  if (res) {
    userSelectOptions.value = res.data;
  }
};
const initFormData: SmsInfoForm = {
  id: undefined,
  smsTemplateId: undefined,
  name: undefined,
  code: undefined,
  projectId: undefined,
  projectName: undefined,
  orderId: undefined,
  orderName: undefined,
  procId: undefined,
  procName: undefined,
  source: undefined,
  sourceUserId: undefined,
  userId: undefined,
  content: undefined,
  isRead: undefined,
  smsParams: undefined,
  templateContent: undefined,
  procNodeName: undefined
};
const data = reactive<PageData<SmsInfoForm, SmsInfoQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    smsTemplateId: undefined,
    name: undefined,
    code: undefined,
    projectId: undefined,
    projectName: undefined,
    orderId: undefined,
    orderName: undefined,
    procId: undefined,
    procName: undefined,
    source: undefined,
    sourceUserId: undefined,
    userId: undefined,
    content: undefined,
    isRead: undefined,
    params: undefined,
    templateContent: undefined,
    params: {},
    procNodeName: undefined
  },
  rules: {}
});

const { queryParams, form, rules } = toRefs(data);

/** 查询消息历史记录信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSmsInfo(queryParams.value);
  smsInfoList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 取消按钮 */
const cancel = () => {
  dialog.visible = false;
};
/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 修改按钮操作 */
const handleDetail = async (row?: SmsInfoVO) => {
  const _id = row?.id || ids.value[0];
  const res = await getSmsInfo(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "详情";
};
onMounted(() => {
  getList();
  getUserOptions();
});
</script>

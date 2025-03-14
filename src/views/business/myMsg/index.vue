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
          <el-form-item label="流程名称" prop="procName">
            <el-input v-model="queryParams.procName" placeholder="请输入流程定义名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <!--          <el-form-item label="节点名称" prop="procName">-->
          <!--            <el-input v-model="queryParams.procName" placeholder="请输入流程定义名称" clearable style="width: 240px" @keyup.enter="handleQuery" />-->
          <!--          </el-form-item>-->
          <el-form-item label="消息内容" prop="procName">
            <el-input v-model="queryParams.content" placeholder="请输入流程定义名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="选择日期">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="defaultTime"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="消息状态" prop="taskState">
            <el-select v-model="queryParams.isRead" clearable>
              <el-option v-for="dict in msg_read_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="success" plain @click="handleMarkRead()" :disabled="multiple" v-has-permi="['business:smsInfo:markRead']" icon="Edit">
              设为已读
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain @click="handleMarkAllRead()" v-has-permi="['business:smsInfo:markRead']" icon="Edit">
              全部已读
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :search="true"></right-toolbar>
        </el-row>
      </template>
      <el-table v-loading="loading" :data="smsInfoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="项目名称" align="center" prop="projectName" width="220" show-tooltip-when-overflow />
        <el-table-column label="销售订单名称" align="center" prop="orderName" width="220" show-tooltip-when-overflow />
        <el-table-column label="流程名称" align="center" prop="procName" show-tooltip-when-overflow />
        <!--        <el-table-column label="节点名称" align="center" prop="procName" />-->
        <el-table-column label="来源用户名称" align="center" width="120">
          <template #default="scope">
            {{ getUserNameById(scope.row.sourceUserId) }}
          </template>
        </el-table-column>
        <el-table-column label="消息内容" align="center" prop="content" show-tooltip-when-overflow />
        <el-table-column label="时间" align="center" prop="createTime" width="160" />
        <el-table-column label="消息状态" align="center" width="80">
          <template #default="scope">
            <dict-tag :options="msg_read_status" :value="scope.row.isRead" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
          <template #default="scope">
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" icon="Tickets" @click="handleDetail(scope.row)" v-hasPermi="['business:mysmg:query']">详情 </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 消息历史记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body @close="getList">
      <div style="margin: 0 10px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="项目名称:">
              {{ form.projectName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售订单名称:">
              {{ form.orderName }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="流程名称:">
              {{ form.procName }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="节点名称:"> {{}}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="来源用户名称:">
              {{ getUserNameById(form.sourceUserId) }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接收用户名称:">
              {{ getUserNameById(form.userId) }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="消息内容:" style="width: 620px;">
              <el-input type="textarea" v-model="form.content" disabled />
            </el-form-item>
          </el-col>
          <el-col></el-col>
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

<script setup name="MyMsg" lang="ts">
import { listMySmsInfo, getSmsInfo, markRead, markAllRead } from "@/api/business/smsInfo";
import { SmsInfoVO, SmsInfoQuery, SmsInfoForm } from "@/api/business/smsInfo/types";
import { ref } from "vue";
import { UserVO } from "@/api/system/user/types";
import { userOptions } from "@/api/system/user";
import { commonVariables } from "@/api/workflow/mixins/workFlowMixins";
import { addDateRange } from "@/utils/ruoyi";
import useUserStore from "@/store/modules/user";
import { to } from "await-to-js";
import { getUserNameById } from "@/utils/userCommonUtil";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const userId = useUserStore().userId;
const {
  total,
  loading,
  showSearch,
  dateRange,
  defaultTime,
  queryFormRef
} = commonVariables();
const { msg_read_status } = toRefs<any>(proxy?.useDict("msg_read_status"));
const smsInfoList = ref<SmsInfoVO[]>([]);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
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
  params: undefined,
  templateContent: undefined
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
    params: {}
  },
  rules: {}
});

const { queryParams, form, rules } = toRefs(data);

/** 查询消息历史记录信息列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.userId = userId;
  const res = await listMySmsInfo(addDateRange(queryParams.value, dateRange.value ? [...dateRange.value] : []));
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
  dateRange.value = "";
  handleQuery();
};

/** 修改按钮操作 */
const handleDetail = async (row?: SmsInfoVO) => {
  const _id = row?.id || ids.value[0];
  const res = await getSmsInfo(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "详情";
  // 如果是未读状态设置为已读
  if(form.value.isRead === 0) {
    await markRead(_id);
  }
};
/** 选择条数  */
const handleSelectionChange = (selection: SmsInfoVO[]) => {
  // 校验是否存在已读的选择项
  const hadReadMsgObj = selection.find(s => s.isRead === 1);
  if (hadReadMsgObj) {
    multiple.value = true;
    proxy?.$modal.msgError("选择项中存在已读消息无须重复选择");
  } else {
    ids.value = selection.map((item) => item.id);
    multiple.value = !selection.length;
  }
};
const handleMarkRead = async (row?: SmsInfoVO) => {
  const msgIds = row?.id || ids.value;
  const [err] = await to(proxy?.$modal.confirm("是否确认已读消息编号为\"" + msgIds + "\"的数据项？") as any);
  if (!err) {
    await markRead(msgIds);
    await getList();
    proxy?.$modal.msgSuccess("设置已读成功");
  }
};
const handleMarkAllRead = async () => {
  const [err] = await to(proxy?.$modal.confirm("是否确认设置为全部已读？") as any);
  if (!err) {
    await markAllRead(userId);
    await getList();
    proxy?.$modal.msgSuccess("设置全部已读成功");
  }
};
onMounted(() => {
  getList();
  getUserOptions();
});
</script>

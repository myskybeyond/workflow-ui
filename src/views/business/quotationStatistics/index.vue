<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="项目" prop="projectId">
            <el-select v-model="queryParams.projectId" placeholder="请选择项目信息" clearable filterable>
              <el-option v-for="data in projectInfoList" :key="data.id" :label="data.name" :value="data.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="选择日期" style="width: 308px" prop="statisticsDate">
            <el-date-picker
              v-model="dateRangeCreateTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['business:quotationStatistics:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="quotationStatisticsList" @selection-change="handleSelectionChange">
        <el-table-column label="主键" align="center" prop="id" v-if="false" />
        <el-table-column label="序号" width="50px" align="center" type="index" />
        <el-table-column label="项目" align="center" prop="projectId" width="150px">
          <template #default="scope">
            <span>{{ getProjectName(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目类型" align="center" prop="projectType">
          <template #default="scope">
            <dict-tag :options="support_type" :value="scope.row.projectType" />
          </template>
        </el-table-column>
        <el-table-column label="部门" align="center" prop="deptId">
          <template #default="scope">
            <span>{{ getDeptName(scope.row.deptId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发起业务员" align="center" prop="salesman">
          <template #default="scope">
            <span>{{ getUserName(scope.row.salesman) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设计员" align="center" prop="designer">
          <template #default="scope">
            <span>{{ getUserName(scope.row.designer) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="校对人" align="center" prop="proofreader">
          <template #default="scope">
            <span>{{ getUserName(scope.row.proofreader) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核人" align="center" prop="auditer">
          <template #default="scope">
            <span>{{ getUserName(scope.row.auditer) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="接收日期" align="center" prop="receivedDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.receivedDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预计完成时间" align="center" prop="expectedDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.expectedDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实际完成时间" align="center" prop="actualDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.actualDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="统计日期" align="center" prop="statisticsDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.statisticsDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="QuotationStatistics" lang="ts">
import { listQuotationStatistics, getQuotationStatistics, delQuotationStatistics, addQuotationStatistics, updateQuotationStatistics } from '@/api/business/quotationStatistics';
import { QuotationStatisticsVO, QuotationStatisticsQuery, QuotationStatisticsForm } from '@/api/business/quotationStatistics/types';
import { ProjectInfoVO } from "@/api/business/projectInfo/types";
import { listProjectInfoAll } from "@/api/business/projectInfo";
import { ProjectFileInfoVO } from "@/api/business/projectFileInfo/types";
import { UserVO } from "@/api/system/user/types";
import { selectAll } from "@/api/system/user";
import { listDept } from "@/api/system/dept";
import { DeptVO } from "@/api/system/dept/types";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const quotationStatisticsList = ref<QuotationStatisticsVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const quotationStatisticsFormRef = ref<ElFormInstance>();
const projectInfoList = ref<ProjectInfoVO[]>([]);
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
//用户列表
const userList = ref<UserVO[]>([]);

const deptList = ref<DeptVO[]>([]);
const initFormData: QuotationStatisticsForm = {
  id: undefined,
  projectId: undefined,
  projectType: undefined,
  deptId: undefined,
  salesman: undefined,
  designer: undefined,
  proofreader: undefined,
  auditer: undefined,
  receivedDate: undefined,
  expectedDate: undefined,
  actualDate: undefined,
  statisticsDate: undefined,
}
const data = reactive<PageData<QuotationStatisticsForm, QuotationStatisticsQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectId: undefined,
    projectType: undefined,
    deptId: undefined,
    statisticsDate: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    projectId: [
      { required: true, message: "项目ID不能为空", trigger: "blur" }
    ],
    projectType: [
      { required: true, message: "项目类型不能为空", trigger: "change" }
    ],
    deptId: [
      { required: true, message: "部门ID不能为空", trigger: "blur" }
    ],
    statisticsDate: [
      { required: true, message: "统计日期;固定、跟踪、电气、车棚不能为空", trigger: "blur" }
    ],
  }
});
const {  support_type } = toRefs<any>(proxy?.useDict( 'support_type'));
const { queryParams, form, rules } = toRefs(data);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);
/** 查询项目报价统计信息列表 */
const getList = async () => {
  loading.value = true;
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'StatisticsDate');
  const res = await listQuotationStatistics(queryParams.value);
  quotationStatisticsList.value = res.rows;
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
  quotationStatisticsFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: QuotationStatisticsVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加项目报价统计信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: QuotationStatisticsVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getQuotationStatistics(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改项目报价统计信息";
}

/** 提交按钮 */
const submitForm = () => {
  quotationStatisticsFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateQuotationStatistics(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addQuotationStatistics(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: QuotationStatisticsVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除项目报价统计信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delQuotationStatistics(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('business/quotationStatistics/export', {
    ...queryParams.value
  }, `quotationStatistics_${new Date().getTime()}.xlsx`)
}
//获取所有的项目信息
const getAllProjects = async () => {
  let res =  await listProjectInfoAll();
  projectInfoList.value = res.data;
}

onMounted(() => {
  getAllProjects();
  //获取所有的用户信息
  getAllUsers();
  //获取所有的部门信息
  getAllDepts();
  getList();
});
const getProjectName = (row?:ProjectFileInfoVO ) => {
  let actions: any[] = [];
  let datas = projectInfoList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].id == ('' + row.projectId)) {
      actions.push(datas[key].name);
      return true;
    }
  })
  return actions.join('');
}
//获取所有的用户信息
const getAllUsers = async () => {
  let res =  await selectAll();
  userList.value = res.data;
}

const getUserName = (id: number) => {
  let actions: any[] = [];
  let datas = userList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].userId == ('' +id)) {
      actions.push(datas[key].nickName);
      return true;
    }
  })
  return actions.join('');
}

const getAllDepts = async () => {
  let res =  await listDept();
  deptList.value = res.data;
}
const getDeptName = (deptId:any ) => {
  if(!deptId){
   return "";
  }
  let actions: any[] = [];
  let datas = deptList.value;
  let arr = deptId.split(",");
  for(let i= 0 ; i< arr.length ;i++){
    Object.keys(datas).some((key) => {
      if (datas[key].deptId == ('' + arr[i])) {
        actions.push(datas[key].deptName);
        return true;
      }
    })
  }
  return actions.join(',');
}
</script>

<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="订单" prop="orderId">
            <el-select v-model="queryParams.orderId" placeholder="请选择订单信息" clearable filterable>
              <el-option v-for="data in orderInfoList" :key="data.id" :label="data.name" :value="data.id" />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['business:projectProgressStatistics:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="projectProgressStatisticsList" @selection-change="handleSelectionChange">
        <el-table-column label="主键" align="center" prop="id" v-if="false" />
        <el-table-column label="序号" width="50px" align="center" type="index" />
        <el-table-column label="项目" align="center" prop="projectId" width="150px">
          <template #default="scope">
            <span>{{ getProjectName(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单" align="center" prop="orderId" width="150px">
          <template #default="scope">
            <span>{{ getOrderName(scope.row.orderId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="到货进度" align="center" prop="arrival" />
        <el-table-column label="生产进度" align="center" prop="production" />
        <el-table-column label="镀锌进度(黑件)" align="center" prop="black" />
        <el-table-column label="镀锌进度(白件)" align="center" prop="white" />
        <el-table-column label="发货进度" align="center" prop="delivery" />
        <el-table-column label="进度名称" align="center" prop="projectProgressId">
          <template #default="scope">
            <span>{{ getProgressName(scope.row.projectProgressId) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="下单日期" align="center" prop="orderDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.orderDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发货开始时间" align="center" prop="deliverStartDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.deliverStartDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发货结束时间" align="center" prop="deliverEndDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.deliverEndDate, '{y}-{m}-{d}') }}</span>
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

<script setup name="ProjectProgressStatistics" lang="ts">
import { listProjectProgressStatistics, getProjectProgressStatistics, delProjectProgressStatistics, addProjectProgressStatistics, updateProjectProgressStatistics } from '@/api/business/projectProgressStatistics';
import { ProjectProgressStatisticsVO, ProjectProgressStatisticsQuery, ProjectProgressStatisticsForm } from '@/api/business/projectProgressStatistics/types';
import { ref } from "vue";
import { OrderInfoVO } from "@/api/business/orderInfo/types";
import { ProjectInfoVO } from "@/api/business/projectInfo/types";
import { listAllOrderInfo } from "@/api/business/orderInfo";
import { listProjectInfoAll } from "@/api/business/projectInfo";
import { ProjectFileInfoVO } from "@/api/business/projectFileInfo/types";
import { listAllProjectProgressInfo } from '@/api/business/projectProgressInfo';
import { ProjectProgressInfoVO } from '@/api/business/projectProgressInfo/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const projectProgressStatisticsList = ref<ProjectProgressStatisticsVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const projectProgressStatisticsFormRef = ref<ElFormInstance>();

//订单信息
const orderInfoList = ref<OrderInfoVO[]>([]);
//项目列表
const projectInfoList = ref<ProjectInfoVO[]>([]);

const ProjectProgressInfoList = ref<ProjectProgressInfoVO[]>([]);

const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProjectProgressStatisticsForm = {
  id: undefined,
  projectId: undefined,
  orderId: undefined,
  projectProgressId: undefined,
  arrival: undefined,
  production: undefined,
  black: undefined,
  white: undefined,
  delivery: undefined,
  orderDate: undefined,
  deliverStartDate: undefined,
  deliverEndDate: undefined,
  statisticsDate: undefined,
}
const data = reactive<PageData<ProjectProgressStatisticsForm, ProjectProgressStatisticsQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectId: undefined,
    orderId: undefined,
    projectProgressId: undefined,
    arrival: undefined,
    production: undefined,
    black: undefined,
    white: undefined,
    delivery: undefined,
    orderDate: undefined,
    deliverStartDate: undefined,
    deliverEndDate: undefined,
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
    orderId: [
      { required: true, message: "订单ID不能为空", trigger: "blur" }
    ],
    projectProgressId: [
      { required: true, message: "关联进度ID不能为空", trigger: "blur" }
    ],
    arrival: [
      { required: true, message: "到货进度不能为空", trigger: "blur" }
    ],
    production: [
      { required: true, message: "生产进度不能为空", trigger: "blur" }
    ],
    black: [
      { required: true, message: "镀锌进度 黑件不能为空", trigger: "blur" }
    ],
    white: [
      { required: true, message: "镀锌进度 白件不能为空", trigger: "blur" }
    ],
    delivery: [
      { required: true, message: "发货进度不能为空", trigger: "blur" }
    ],
    orderDate: [
      { required: true, message: "下单日期不能为空", trigger: "blur" }
    ],
    deliverStartDate: [
      { required: true, message: "发货开始时间不能为空", trigger: "blur" }
    ],
    deliverEndDate: [
      { required: true, message: "发货结束时间不能为空", trigger: "blur" }
    ],
    statisticsDate: [
      { required: true, message: "统计日期;固定、跟踪、电气、车棚不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目进度统计信息列表 */
const getList = async () => {
  loading.value = true;
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'StatisticsDate');
  const res = await listProjectProgressStatistics(queryParams.value);
  projectProgressStatisticsList.value = res.rows;
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
  projectProgressStatisticsFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ProjectProgressStatisticsVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加项目进度统计信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ProjectProgressStatisticsVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getProjectProgressStatistics(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改项目进度统计信息";
}

/** 提交按钮 */
const submitForm = () => {
  projectProgressStatisticsFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateProjectProgressStatistics(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProjectProgressStatistics(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ProjectProgressStatisticsVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除项目进度统计信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delProjectProgressStatistics(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('business/projectProgressStatistics/export', {
    ...queryParams.value
  }, `projectProgressStatistics_${new Date().getTime()}.xlsx`)
}

onMounted(async () => {
  await getAllProjects();
  await getOrderList();
  await getAllProgress();
  await getList();
});

/** 查询销售订单列表 */
const getOrderList = async () => {
  const res = await listAllOrderInfo();
  orderInfoList.value = res.data;
}
//获取所有的项目信息
const getAllProjects = async () => {
  let res =  await listProjectInfoAll();
  projectInfoList.value = res.data;
}

//获取所有的项目信息
const getAllProgress = async () => {
  let res =  await listAllProjectProgressInfo();
  ProjectProgressInfoList.value = res.data;
}

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

//获取订单名称
const getOrderName = (id: number) => {
  let actions: any[] = [];
  let datas = orderInfoList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].id == ('' +id)) {
      actions.push(datas[key].name);
      return true;
    }
  })
  return actions.join('');
}

//获取订单名称
const getProgressName = (id: number) => {
  let actions: any[] = [];
  let datas = ProjectProgressInfoList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].id == ('' +id)) {
      actions.push(datas[key].name);
      return true;
    }
  })
  return actions.join('');
}
</script>

<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="组织名称" prop="OrgCode">
            <el-select v-model="queryParams.OrgCode" placeholder="请选择组织名称" clearable style="width: 240px">
              <el-option v-for="dict in yongyou_org" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="销售订单编码" prop="ProNo" label-width="100px">
            <el-input v-model="queryParams.ProNo" placeholder="请输入销售订单编码" clearable style="width: 240px" />
          </el-form-item>
          <el-form-item label="销售订单名称" prop="ProName" label-width="100px">
            <el-input v-model="queryParams.ProName" placeholder="请输入销售订单名称" clearable style="width: 240px" />
          </el-form-item>
          <el-form-item label="供应商" prop="Supplier">
            <el-input v-model="queryParams.Supplier" placeholder="请输入供应商" clearable style="width: 240px" />
          </el-form-item>
          <el-form-item label="料号" prop="PartNo">
            <el-input v-model="queryParams.PartNo" placeholder="请输入料号" clearable style="width: 240px" />
          </el-form-item>
          <el-form-item label="规格" prop="Spec" label-width="100px">
            <el-input v-model="queryParams.Spec" placeholder="请输入规格" clearable style="width: 240px" />
          </el-form-item>
          <el-form-item label="材质" prop="Material" label-width="100px">
            <el-input v-model="queryParams.Material" placeholder="请输入材质" clearable style="width: 240px" />
          </el-form-item>
          <el-form-item label="选择日期" style="width: 308px;">
            <el-date-picker
              v-model="dateRange"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
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
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="arrivalList">
        <el-table-column label="序号" width="50px" align="center" type="index" />
        <el-table-column label="项目编号" align="center" prop="proNo" width="100px" />
        <el-table-column label="项目名称" align="center" prop="proName" width="200px" />
        <el-table-column label="供应商" align="center" prop="supplier" width="200px" />
        <el-table-column label="存储地点" align="center" prop="stoLocation" width="150px" />
        <el-table-column label="料号" align="center" prop="partNo" width="150px" />
        <el-table-column label="品名" align="center" prop="pname" width="150px" />
        <el-table-column label="规格" align="center" prop="spec" width="100px" />
        <el-table-column label="材质" align="center" prop="material" width="60px" />
        <el-table-column label="长度" align="center" prop="length" width="60px" />
        <el-table-column label="库管员" align="center" prop="stoKeeper" width="70px" />
        <el-table-column label="收货部门" align="center" prop="receiveDepartment" width="100px" />
        <el-table-column label="到货时间" align="center" prop="arriveTime" width="160px" />
        <!--  <el-table-column label="入库时间" align="center" prop="receiveTime" width="160px" /> -->
        <el-table-column label="实到数量" align="center" prop="rtNum" />
        <el-table-column label="点收数量" align="center" prop="pcNum" />
        <el-table-column label="实收数量" align="center" prop="nrNum" />
        <el-table-column label="退补数量" align="center" prop="rsNum" />
        <el-table-column label="采购单位名称" align="center" prop="unitName" width="120px" />
        <el-table-column label="收货单号" align="center" prop="receiveNo" width="150px" />
        <el-table-column label="业务日期" align="center" prop="busiDate" width="160px" >
          <template #default="scope">
            <span>{{ parseTime(scope.row.busiDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="ArrivalInfo" lang="ts">
import moment from "moment"
import { listArrival} from '@/api/business/arrivalInfo';
import { ArrivalInfoVO, ArrivalQuery } from '@/api/business/arrivalInfo/types';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const {  yongyou_org } = toRefs<any>(proxy?.useDict( 'yongyou_org'));
const arrivalList = ref<ArrivalInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const data = reactive<PageData<{}, ArrivalQuery>>({
  form: {

  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    OrgCode: undefined,
    ProNo: undefined,
    ProName: undefined,
    Supplier: undefined,
    PartNo: undefined,
    Spec: undefined,
    Material: undefined,
    StartTime: undefined,
    EndTime: undefined,
    params: undefined,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);


const getList = async () => {
  loading.value = true;
  const res = await listArrival(addBusiDateRange(queryParams.value,dateRange.value));
  arrivalList.value = res.rows;
  total.value = res.total;
  loading.value = false;
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

onMounted(() => {
  getList();
});

//增加时间查询条件
const addBusiDateRange = (params: any, dateRange: any[]) => {
  const search = params;
  dateRange = Array.isArray(dateRange) ? dateRange : [];
  search.StartTime = dateRange[0];
  search.EndTime = dateRange[1];
  return search;
};

/**
 * 格式化日期
 * @param params
 */
const  dateFormat = (params: any) => {
  if (params !== '' && params !== null && params !== undefined) {
    return moment(params).format('YYYY-MM-DD');
  }else {
    return params;
  }
};
</script>

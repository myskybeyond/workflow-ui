<template>
  <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
              :leave-active-class="proxy?.animate.searchAnimate.leave">
    <div class="mb-[10px]" v-show="showSearch">
      <el-card shadow="hover">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item prop="projectId" style="margin-bottom: 0">
            <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable filterable
                       @change="selectOne">
              <el-option v-for="data in projectInfoList" :key="data.id" :label="data.name" :value="data.id"/>
            </el-select>
          </el-form-item>
          <el-form-item prop="userName" style="margin-bottom: 0">
            <el-input v-model="queryParams.userName" placeholder="搜索处理人" clearable style="width: 240px"
                      @change="selectOne"
                      @keyup.enter="handleQuery"/>
          </el-form-item>
          <el-form-item prop="status" style="margin-bottom: 0">
            <el-radio-group v-model="queryParams.status" @change="selectOne">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button v-for="item in status" :label="item.value">{{ item.name }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </transition>
  <el-table v-loading="loading" :data="dataList">
    <el-table-column label="项目名称" align="center" prop="projectName" :show-overflow-tooltip="true"/>
    <el-table-column label="任务节点" align="center" prop="ahtName" :show-overflow-tooltip="true"/>
    <el-table-column label="状态" align="center" prop="TEXT_" :show-overflow-tooltip="true">
      <template #default="scope">
        <span>{{ getStatusName(scope.row.TEXT_) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="处理人" align="center" prop="nick_name" :show-overflow-tooltip="true">
      <template #default="scope">
        <span>{{ getUserName(scope.row.nick_name, scope.row.END_TIME_) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="接收时间" align="center" prop="START_TIME_" width="160" :show-overflow-tooltip="true"/>
    <el-table-column label="处理时间" align="center" prop="END_TIME_" width="160" :show-overflow-tooltip="true"/>
    <el-table-column label="耗时" align="center" prop="DURATION_" width="160" :show-overflow-tooltip="true">
      <template #default="scope">
        <span>{{ LongToTime(scope.row.DURATION_) }}</span>
      </template>
    </el-table-column>
  </el-table>
  <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize" @pagination="getList" :autoScroll="false"/>
</template>

<script setup name="DaiBan" lang="ts">
import {defineEmits, defineProps} from "vue";
import {getOrderFlwReationList, getprojectFlwRelationList} from "@/api/Index";
import Pagination from "@/components/Pagination/index.vue";
import {ProjectInfoVO} from "@/api/business/projectInfo/types";
import {listProjectInfoAll} from "@/api/business/projectInfo";
import {listAllOrderInfo} from "@/api/business/orderInfo";
import {OrderInfoVO} from "@/api/business/orderInfo/types";

const router = useRouter();

const loading = ref(true);
const dataList = ref([]);

const queryParams = ref({
  pageNum: 1,
  pageSize: 5,
  orderId: undefined,
  projectId: undefined,
  userName: '',
  status: undefined
});
const projectInfoList = ref<ProjectInfoVO[]>([]);
const orderInfoList = ref<OrderInfoVO[]>([]);
const total = ref(0)
const showSearch = ref(true);
const queryFormRef = ref<ElFormInstance>();
const status = ref(
  [{
    name: '进行中',
    value: 'running',
  }, {
    name: '已终止',
    value: 'terminated',
  }, {
    name: '已完成',
    value: 'completed',
  }, {
    name: '已挂起',
    value: 'suspended',
  },]
)

const emit = defineEmits(['backData']);

onMounted(() => {
  //查询所有的项目
  getAllProjects();
  //获取所有的销售订单
  getAllOrders();

  getList();
})

function selectOne(row: any) {
  console.log('测试选择一个', row)
  getList()
}

function getStatusName(data: any) {
  for (let item of status.value) {
    if (item.value == data) {
      return item.name
    }
  }
}

function LongToTime(seconds: number) {
  if (!seconds)
    return ""
  seconds = Math.floor(seconds / 1000)
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const formattedHours = hours > 0 ? `${hours}小时` : '';
  const formattedMinutes = minutes > 0 ? `${minutes}分` : '';
  const formattedSecs = secs > 0 ? `${secs}秒` : '';
  return `${formattedHours}${formattedMinutes}${formattedSecs}`;
}
const getUserName = (nickName, endTime) => {
  if (nickName)
    return nickName;
  if (endTime)
    return '(他人处理)';
  return '';
}
async function getList() {
  loading.value = true;
  await getprojectFlwRelationList(queryParams.value).then((res) => {
    dataList.value = res.data.records;
    total.value = res.data.total
  }).finally(() => {
    loading.value = false;
  });
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
//获取所有的项目信息
const getAllProjects = async () => {
  let res = await listProjectInfoAll();
  projectInfoList.value = res.data;
}
//获取所有的销售订单信息
const getAllOrders = async () => {
  let res = await listAllOrderInfo();
  orderInfoList.value = res.data;
}
</script>

<style scoped>

</style>

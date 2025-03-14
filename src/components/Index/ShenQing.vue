<template>
  <el-table v-loading="loading" :data="dataList">
    <el-table-column label="流程名称" align="center" prop="procDefName" :show-overflow-tooltip="true"/>
    <el-table-column label="发起时间" align="center" prop="createTime" width="160" :show-overflow-tooltip="true"/>
    <el-table-column label="当前节点" align="center" prop="taskName" :show-overflow-tooltip="true"/>
    <el-table-column label="处理人" align="center" prop="assigneeId" :show-overflow-tooltip="true">
      <template #default="scope">
        <span>{{ getUserNameById(scope.row.assigneeId) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="60">
      <template #default="scope">
        <el-button size="small" type="primary" link @click="handleFlowRecord(scope.row)"
                   v-hasPermi="['workflow:process:query']"
        >详情
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup name="ShenQing" lang="ts">
import {defineEmits, defineProps} from "vue";
import {listOwnProcess, listTodoProcess} from "@/api/workflow/work/process";
import { getUserNameById } from "@/utils/userCommonUtil";

const router = useRouter();

const loading = ref(true);
const dataList = ref([]);

const queryParams = ref({
  pageNum: 1,
  pageSize: 5,
});

const emit = defineEmits(['backData']);

onMounted(() => {
  getList();
})

async function getList() {
  loading.value = true;
  await listOwnProcess(queryParams.value).then((res) => {
    dataList.value = res.rows;
    // emit('backData', res.total);
  }).finally(() => {
    loading.value = false;
  });

}

const handleFlowRecord = (row: any) => {
  router.push({
    path: '/workflow/process/detail/' + row.procInsId,
    query: {
      processed: false
    }
  })
}
</script>

<style scoped>

</style>

<template>
  <el-table v-loading="loading" :data="dataList">
    <el-table-column label="流程名称" align="center" prop="processName" :show-overflow-tooltip="true" />
    <el-table-column label="创建时间" align="center" prop="createTime" width="160" :show-overflow-tooltip="true">
      <template #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="发起人" align="center" prop="originatorName"  :show-overflow-tooltip="true"/>
    <el-table-column label="抄送节点" align="center" prop="copyNodeName" :show-overflow-tooltip="true" />
    <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="60">
      <template #default="scope">
        <el-button type="primary" link @click="handleFlowRecord(scope.row)" v-hasPermi="['workflow:process:query']"
        >详情
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup name="ChaoSong" lang="ts">
import {defineEmits, defineProps} from "vue";
import {listCopyProcess, listFinishedProcess, listTodoProcess} from "@/api/workflow/work/process";

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
  await listCopyProcess(queryParams.value).then((res) => {
    dataList.value = res.rows;
    emit('backData', res.total);
  }).finally(() => {
    loading.value = false;
  });
}

const handleFlowRecord = (row: any) => {
  router.push({
    path: "/workflow/process/detail/" + row.instanceId,
    query: {
      processed: false
    }
  });
};
</script>

<style scoped>

</style>

<template>
  <el-card style="position: relative;">
    <template #header>
      <span style="font-weight: bold;font-size: 15px">发起流程</span>
      <el-button style="float: right;" type="primary" link @click="handleMore" v-hasPermi="['workflow:process:startList']">
        更多
      </el-button>
      <el-button style="float: right;padding-right: 20px" type="primary" link @click="isEditing = !isEditing" v-hasPermi="['workflow:process:startList']">
        {{ isEditing === true ? '完成' : '编辑' }}
      </el-button>
    </template>
    <el-scrollbar style="height: 80px" v-if="dataList.length||isEditing">
      <el-space wrap v-loading="loading">
        <el-tag v-for="(value,index) in dataList" :key="index" :closable="isEditing" @close="handleClose(value)"
                style="cursor: pointer;"
                size="large"
                @click="handleOne(value)">
          {{ value.wfName }}
        </el-tag>
        <el-button v-if="dataList.length<8&&isEditing" @click="handleAdd">+ 添加</el-button>
      </el-space>
    </el-scrollbar>
    <el-empty image-size="20" style="height: 10px" v-if="!dataList.length&&!isEditing" />
  </el-card>

  <el-dialog v-model="wfLoading" width="800" append-to-body destroy-on-close title="添加流程快捷入口">
    <WFComponents @CallBack="wfCallback"/>
  </el-dialog>
</template>

<script setup name="LiuCheng" lang="ts">
import {delWf, getWfList, setWf} from "@/api/Index";
import WFComponents from "@/components/Index/WFComponents.vue";

const router = useRouter();

const loading = ref(true);
const dataList = ref([]);

const isEditing = ref(false);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
});

const wfInfo = ref({
  wfId: undefined,
  wfName: undefined,
  processKey: undefined,
  deploymentId: undefined,
})

const wfLoading = ref(false);

onMounted(() => {
  getList();
})

async function getList() {
  loading.value = true;
  await getWfList().then((res) => {
    dataList.value = res.data;
  }).finally(() => {
    loading.value = false;
  });
}

async function delOne(row: any) {
  loading.value = true
  await delWf({wfId: row.wfId}).then((res) => {
    getList()
  }).finally(() => {
    loading.value = false;
  });
}

async function handleMore() {
  router.push({
    path: "/work/create",
  });
}

async function addOne() {
  loading.value = true;
  await setWf(wfInfo.value).then((res) => {
    getList()
  }).finally(() => {
    loading.value = false;
    wfInfo.value = {
      wfId: undefined,
      wfName: undefined,
      processKey: undefined,
      deploymentId: undefined,
    };
  });
}

async function handleAdd() {
  wfLoading.value = true;
}

/**
 * 发起流程
 */
async function handleOne(row: any) {
  console.log('点击了发起流程==', row.definitionId, row.processKey, row)
  router.push({
    path: '/workflow/process/start/' + row.deploymentId,
    query: {
      definitionId: row.wfId,
      definitionKey: row.processKey
    }
  })
}

async function handleClose(row: any) {
  await ElMessageBox.confirm(`确定删除"${row.wfName}"流程的快捷入口吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await delOne(row)
}

function wfCallback(value: any) {
  wfLoading.value = false;
  // console.log('wfCallback', value)
  wfInfo.value = {
    wfId: value.definitionId,
    wfName: value.processName,
    processKey: value.processKey,
    deploymentId: value.deploymentId,
  };
  addOne();
}
</script>

<style scoped>

</style>

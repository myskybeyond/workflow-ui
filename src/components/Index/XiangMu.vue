<template>
  <!--  <el-space wrap v-loading="loading" style="width: 100%" :fill-ratio="23" fill>-->
  <el-scrollbar style="height: 50px" v-if="dataList.length">
    <el-space wrap v-loading="loading" style="width: 100%">
      <el-tooltip v-for="(item,index) in dataList" :content="item.name" :key="index">
        <p class="item"
           @click="headleItem(item)">{{ item.name }}</p>
      </el-tooltip>
    </el-space>
  </el-scrollbar>
  <el-empty image-size="20" style="height: 10px" v-if="!dataList.length"/>
</template>

<script setup name="XiangMu" lang="ts">
import {defineEmits} from "vue";
import {projectList} from "@/api/Index";

const router = useRouter();

const loading = ref(true);
const dataList = ref([]);

const emit = defineEmits(['backData']);

onMounted(() => {
  getList();
})

async function getList() {
  loading.value = true;
  await projectList().then((res) => {
    dataList.value = res.data.rows;
    emit('backData', res.data.total);
  }).finally(() => {
    loading.value = false;
  });
}

function headleItem(item: any) {
  router.push({path: '/business/projectInfo/detail', query: {projectId: item?.id}});
}
</script>

<style scoped>
.item {
  cursor: pointer;
  font-size: 16px;
  /* 文本不会换行 */
  white-space: nowrap;
  width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  text-align: center;
}
</style>

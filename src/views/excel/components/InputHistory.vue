<template>
  <el-dialog v-model="dialogVisible" title="历史版本" width="800px" append-to-body @opened="handleOpen"
             @close="handleClose">
    <el-table v-loading="loding" :data="datas" border max-height="600">
      <el-table-column label="版本" align="center" prop="fileVer" width="160">
        <template #default="scope">
          <el-tag> V{{ scope.row.fileVer }}</el-tag>
        </template>
      </el-table-column>
      <!--      <el-table-column label="状态" align="center">保存</el-table-column>-->
      <el-table-column label="更新时间" align="center" prop="update_time"/>
      <el-table-column label="用户" align="center" prop="user_name"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="导入" placement="top">
            <el-button link type="primary" icon="Download" @click="handleInput(scope.row)"/>
          </el-tooltip>
          <el-tooltip content="查看" placement="top">
            <el-button link type="primary" icon="View" @click="handleLook(scope.row)"/>
          </el-tooltip>

        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup>
import {ref, defineEmits, defineProps} from "vue";
import {useRouter} from "vue-router";
import {getEditHistory, getFileInfo} from "@/api/excel";

const selectModelSheetData = ref('');
const loading = ref(false)

const loding = ref(false);
const datas = ref([]);
const fileName = ref('');

const router = useRouter();
const emit = defineEmits(['cClose']);
const props = defineProps({
  dialogVisible: {
    default: false
  },
  fileId: {}
})
const dialogVis = computed(() => props.dialogVisible);
const dialogVisible = ref();
watch(dialogVis, (n) => {
  dialogVisible.value = n;
})

function handleClose() {
  emit('cClose', selectModelSheetData.value);
}

async function initData() {
  loding.value = true
  await getEditHistory({fileId: props.fileId}).then((res) => {
    if (res.rows == null) {
      datas.value = [];
      fileName.value = ''
    } else {
      datas.value = res.rows
      if (res.rows.length > 0)
        fileName.value = res.rows[0].name
    }
  }).finally(() => {
    loding.value = false
  })
}

function handleOpen() {
  initData()
  selectModelSheetData.value = []
}

function handleInput(row) {
  ElMessageBox.confirm('导入 V' + row.fileVer + ' 版本将覆盖文件确认导入吗？', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      getModelInfo(row.id, row.fileVer)
    })
    .catch((e) => {

    })
}

async function getModelInfo(id, version) {
  loading.value = true
  await getFileInfo({fileId: id, version: version}).then(res => {
    if (res.data && res.data.sheetData && res.data.sheetData.length) {
      selectModelSheetData.value = res.data.sheetData
      dialogVisible.value = false
    }
  }).finally(() => {
    loading.value = false
  })
}

function handleLook(row) {
  router.push({path: '/excel/view', query: {id: row.id, name: row.name, version: row.fileVer}})
}
</script>

<style scoped>

</style>

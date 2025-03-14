<template>
  <div>
    <Createexcel :dialogVisible="testVis" @cClose="testFun"/>
    <!--    <el-button :onclick="testFun">测试一下</el-button>-->
    <!--    <el-button :onclick="testFun">编辑</el-button>-->
    <el-table v-loading="loading" :data="datas" border :span-method="objectSpanMethod" max-height="600">
      <el-table-column label="文件名" align="center" prop="name"/>
      <el-table-column label="版本" align="center" prop="fileVer" width="120">
        <template #default="scope">
          <el-tag> V{{ scope.row.fileVer }}</el-tag>
        </template>
      </el-table-column>
      <!--      <el-table-column label="状态" align="center">保存</el-table-column>-->
      <el-table-column label="更新时间" align="center" prop="update_time"/>
      <el-table-column label="用户" align="center" prop="user_name"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="查看" placement="top">
            <el-button link type="primary" icon="View" @click="handleLook(scope,0)"/>
          </el-tooltip>
          <el-tooltip content="修改" placement="top" v-if="props.purview==1">
            <el-button link type="primary" icon="Edit" @click="handleEdit(scope,1)"/>
          </el-tooltip>
          <el-tooltip content="导出" placement="top">
            <el-button link type="primary" icon="Download" @click="handleExport(scope.row)"/>
          </el-tooltip>
<!--          <el-tooltip content="删除" placement="top" v-if="props.purview==1">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"/>
          </el-tooltip>-->
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" @pagination="getVersionList"/>
  </div>
</template>

<script setup lang="ts">

/**
 * 文件历史列表  需要传入文件id
 * @props fileId 文件id
 * @props purview 0:查看 1：编辑 对文档的编辑权限 默认有编辑权限
 */
import {delFileByVer, getEditHistory, getFileInfo} from "@/api/excel";
import {useRouter} from 'vue-router';
import CreateExcel from "@/views/excel/components/createExcel.vue";
import {ref, onMounted, defineProps} from 'vue'
import {loadCollection} from "@iconify/json";
import {exportSheetExcel} from "@/views/excel/components/myExport2";

const router = useRouter();

const loading = ref(false);
const datas = ref([]);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
})
const total = ref(0);
const fileName = ref('');
const testVis = ref(false);

const testFun = () => {
  router.push({path: '/excel/info', query: {id: props.fileId, isHistoryStatus: 1, purview: props.purview}})
}
const props = defineProps({
  fileId: {
    required: true
    // default: '1789905555880677377'
  },
  purview: {
    default: 1
  }
});
const thisFileId = computed(() => props.fileId)
watch(thisFileId, (newValue) => {
  getVersionList()
})

const objectSpanMethod = ({
                            row,
                            column,
                            rowIndex,
                            columnIndex,
                          }: any) => {
  if (columnIndex === 0) {
    if (rowIndex === 0) {
      return {
        rowspan: datas.value.length,
        colspan: 1,
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
  }
}

onMounted(() => {
  getVersionList()
})
/**
 * 获取文件保存记录列表
 * @returns {Promise<void>}
 */
const getVersionList = async () => {
  loading.value = true
  await getEditHistory({fileId: props.fileId, ...queryParams.value}).then((res) => {
    if (res.rows == null) {
      datas.value = [];
      fileName.value = ''
      total.value = 0;
    } else {
      datas.value = res.rows
      if (res.rows.length > 0)
        fileName.value = datas.value[0].name
      total.value = res.total
    }
  }).finally(() => {
    loading.value = false
  })
}
//修改操作
const handleEdit = (row: any, isEdit: any) => {
  if (row.$index)
    ElMessageBox.confirm('修改只能基于最新版本，是否从最新版开始修改?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        router.push({path: '/excel/info', query: {...datas.value[0], isHistoryStatus: isEdit, purview: props.purview}})
      })
      .catch((e) => {
      })
  else router.push({path: '/excel/info', query: {...row.row, isHistoryStatus: isEdit, purview: props.purview}})
}
//更新查看操作
const handleLook = (row: any, isEdit: any) => {
  console.log(row)
  router.push({path: '/excel/info', query: {...row.row, isHistoryStatus: isEdit, purview: props.purview}})
}
//删除操作
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除 V' + row.fileVer + ' 版本记录吗?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    loading.value = true
    await delFileByVer({fileId: props.fileId, version: row.fileVer}).then(res => {
      if (res.code == 200)
        ElMessage.success('删除成功')
      else ElMessage.error('删除失败')
    }).finally(() => {
      loading.value = false
      getVersionList()
    })
  })
    .catch((e) => {
    })
}
//导出操作
const handleExport = async (row: any) => {
  loading.value = true
  await getFileInfo({fileId: row.id, version: row.fileVer}).then(res => {
    if (res.data && res.data.sheetData && res.data.sheetData.length) {
      for (let sheetItem of res.data.sheetData) {
        sheetItem.celldata
        var newdata = window.luckysheet.transToData(sheetItem.celldata)
        sheetItem.data = newdata;
      }
      // console.log('导出内容', res.data.sheetData)
      setTimeout(async () => {
        // await exportExcel(luckysheet.getAllSheets(), excelInitData.value.fileName).then(() => {
        // eslint-disable-next-line no-undef
        await exportSheetExcel(res.data.sheetData, res.data.name).then(() => {
          console.log('导出成功')
          loading.value = false;
        }).catch((e) => {
          console.log('导出失败', e)
          loading.value = false;
        })
      }, 250)
    }
  }).finally(() => {
    loading.value = false
  })
}
</script>
<style scoped></style>

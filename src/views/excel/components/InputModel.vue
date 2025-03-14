<template>
  <el-dialog v-model="dialogVisible" title="模板选择" width="800px" append-to-body @opened="handleOpen"
             @close="handleClose">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
                :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item label="类型" prop="type">
              <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
                <el-option key="0" label="报价" :value="0"/>
                <el-option key="1" label="下单" :value="1"/>
              </el-select>
            </el-form-item>
            <el-form-item label="分类" prop="category">
              <el-select v-model="queryParams.category" placeholder="请选择分类" clearable>
                <el-option v-for="dict in template_category" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="文件名" prop="name">
              <el-input v-model="queryParams.name" placeholder="文件名" clearable style="width: 240px"
                        @keyup.enter="handleQuery"/>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>
    <el-table v-loading="loading" :data="templateInfoList">
      <el-table-column label="模板名称" align="center" prop="name"/>
      <el-table-column label="模板说明" align="center" prop="description"/>
      <el-table-column label="分类" align="center" prop="category">
        <template #default="scope">
          <dict-tag :options="template_category" :value="scope.row.category"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="导入" placement="top">
            <el-button link type="primary" icon="Download" @click="handleInput(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="查看" placement="top">
            <el-button link type="primary" icon="View" @click="handleInfo(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
                @pagination="getList"/>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps} from "vue";
import {useRouter} from "vue-router";
import {getFileInfo} from "@/api/excel";
import {optionselect as getDictOptionselect} from "@/api/system/dict/type";
import {DictTypeVO} from "@/api/system/dict/type/types";
import {listTemplateInfo} from "@/api/business/templateInfo";
import {TemplateInfoVO} from "@/api/business/templateInfo/types";


const {proxy} = getCurrentInstance() as ComponentInternalInstance;

const selectModelSheetData = ref('');
const loading = ref(false)
const templateInfoList = ref<TemplateInfoVO[]>([]);

const router = useRouter();
const emit = defineEmits(['cClose']);
const props = defineProps({
  dialogVisible: {
    default: false
  }
})
const dialogVis = computed(() => props.dialogVisible);
const dialogVisible = ref();
watch(dialogVis, (n) => {
  dialogVisible.value = n;
})
const total = ref(0);
const {template_category} = toRefs<any>(proxy?.useDict('template_category'));
const showSearch = ref(true);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  status: 0,
  type: undefined,
  category: undefined
});
const queryFormRef = ref<ElFormInstance>();
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

function handleClose() {
  emit('cClose', selectModelSheetData.value);
}

async function getList() {
  loading.value = true;
  const res = await listTemplateInfo(queryParams.value);
  templateInfoList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

function handleOpen() {
  getList()
  selectModelSheetData.value = []
}

function handleInput(row) {
  if (!row.onlineFileId) {
    ElMessage.error('模板为空，无法导入该模板！')
    return;
  }
  /*if (row.version < 1) {
    ElMessage.error('模板无内容，无法导入该模板！')
    return;
  }*/
  ElMessageBox.confirm('导入模板将覆盖文件确认导入吗？', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      getModelInfo(row.onlineFileId, row.version)
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

function handleInfo(row) {
  if (!row.onlineFileId) {
    ElMessage.error('模板为空，无法预览该模板！')
    return;
  }
  /*if (row.version < 1) {
    ElMessage.error('模板无内容，无法预览该模板！')
    return;
  }*/
  router.push({path: '/excel/view', query: {id: row.onlineFileId, name: row.name}})
}
</script>

<style scoped>

</style>

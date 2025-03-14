<template>
  <el-dialog v-model="dialogVisible" title="构建选择" width="800px" append-to-body @opened="handleOpen"
             @close="handleClose">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
                :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item label="分类" prop="category">
              <el-select v-model="queryParams.category" placeholder="请选择分类" clearable @change="typeChange">
                <el-option key="0" label="标准-跟踪构件" value="01"/>
                <el-option key="1" label="非标-跟踪构件" value="11"/>
                <el-option key="2" label="标准-固定构件" value="02"/>
                <el-option key="3" label="非标-固定构件" value="12"/>
                <el-option key="4" label="标准-电气构件" value="03"/>
                <el-option key="5" label="非标-电气构件" value="13"/>
                <el-option key="6" label="标准-车棚构件" value="04"/>
                <el-option key="7" label="非标-车棚构件" value="14"/>
              </el-select>
            </el-form-item>
            <el-form-item label="构建名" prop="name">
              <el-input v-model="queryParams.name" placeholder="构建名" clearable style="width: 240px"
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
    <el-card>
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleInsert" :disabled="!ids.length"
            >插入
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table v-loading="loading" :data="templateInfoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column label="构件名称" align="center" prop="name"/>
        <el-table-column label="构件说明" align="center" prop="description"/>
        <el-table-column label="分类" align="center" prop="category">
          <template #default="scope">
            {{ getCategoryStr(scope.row.category) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="插入" placement="top">
              <el-button link type="primary" icon="Download" @click="handleInput(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
                @pagination="getList"/>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps} from "vue";
import {useRouter} from "vue-router";
import {getComponentInfoList, getComponentList, getFileInfo} from "@/api/excel";
import {TemplateInfoVO} from "@/api/business/templateInfo/types";
import {cleanLoginInfo, unlockLoginInfo} from "@/api/monitor/loginInfo";


const {proxy} = getCurrentInstance() as ComponentInternalInstance;

const selectModelSheetData = ref('');
const loading = ref(false)
const templateInfoList = ref<TemplateInfoVO[]>([]);
const ids = ref([]);
const selecteds = ref([]);

const router = useRouter();
const emit = defineEmits(['cClose']);
const props = defineProps({
  dialogVisible: {
    default: false
  },
  category: {}
})
const category = computed(() => props.category)
watch(category, () => {
  queryParams.value.category = category.value;
})
const dialogVis = computed(() => props.dialogVisible);
const dialogVisible = ref();
watch(dialogVis, (n) => {
  console.log('插入的地方vis',n)
  dialogVisible.value = n;
})
const total = ref(0);
const showSearch = ref(true);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  status: 0,
  category: undefined,
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

function typeChange() {
  console.log('标准类型', queryParams.value.type)
  console.log('构件类型', queryParams.value.categoryCode)
  /*if (queryParams.value.type == 0){

  }*/
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: TemplateInfoVO[]) => {
  selecteds.value = selection.map(item => item.name)
  ids.value = selection.map(item => item.id);
}

async function getList() {
  loading.value = true;
  const res = await getComponentInfoList(queryParams.value);
  templateInfoList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}


/** 导出按钮操作 */
const handleInsert = async () => {
  await ElMessageBox.confirm('确定插入' + JSON.stringify(selecteds.value) + "吗？", '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  const res = await getComponentList(ids.value)
  for (let item of res.data) {
    var row = item.split(',')
    selectModelSheetData.value.push(row)
  }
  dialogVisible.value = false;
}

function handleOpen() {
  if (dialogVisible.value) {
    getList()
    selectModelSheetData.value = []
  }
}

function getCategoryStr(type: any) {
  switch (type) {
    case "01":
      return '标准-跟踪构件';
    case "02":
      return '标准-固定构件';
    case "03":
      return '标准-电气构件';
    case "04":
      return '标准-车棚构件';
    case "11":
      return '非标-跟踪构件';
    case "12":
      return '非标-固定构件';
    case "13":
      return '非标-电气构件';
    case "14":
      return '非标-车棚构件';
  }
}

function handleInput(row) {
  ids.value = [row.id]
  selecteds.value = [row.name]
  handleInsert()
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
</script>

<style scoped>

</style>

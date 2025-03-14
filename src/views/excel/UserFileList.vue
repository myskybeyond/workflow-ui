<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
                :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item label="文件名" prop="name">
              <el-input v-model="queryParams.name" placeholder="文件名" clearable style="width: 240px"
                        @keyup.enter="handleQuery"/>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="queryParams.remark" placeholder="备注" clearable style="width: 240px"
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

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="dataList">
        <el-table-column label="文件名" align="center" prop="name"/>
        <el-table-column label="版本" align="center" prop="ver" width="160">
          <template #default="scope">
            <el-tag v-if="scope.row.ver>0"> V{{ scope.row.ver }}</el-tag>
            <span v-if="scope.row.ver<1">--</span>
          </template>
        </el-table-column>
        <!--      <el-table-column label="状态" align="center">保存</el-table-column>-->
        <el-table-column label="更新时间" align="center" prop="updateTime"/>
        <el-table-column label="用户" align="center" prop="updateName"/>
        <el-table-column label="备注" align="center" prop="remark" width="160"/>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看" placement="top">
              <el-button link type="primary" icon="View" @click="handleLook(scope,0)"/>
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEdit(scope,1)"/>
            </el-tooltip>
            <el-tooltip content="历史" placement="top">
              <el-button link type="primary" icon="Files" @click="handleHistory(scope.row)"/>
            </el-tooltip>
            <el-tooltip content="导出" placement="top">
              <el-button link type="primary" icon="Download" @click="handleExport(scope.row)"/>
            </el-tooltip>
<!--            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"/>
            </el-tooltip>-->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                  v-model:limit="queryParams.pageSize" @pagination="getList"/>
    </el-card>
    <!-- 添加或修改测试单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="demoFormRef" :model="form" label-width="80px">
        <el-form-item label="文件名" prop="name"
                      :rules="{ required: true, trigger: ['blur', 'change'],message: '文件名称不能为空' }">
          <el-input v-model="form.name" placeholder="请输入文件名"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="历史列表" v-model="historyVisible" width="800px" append-to-body>
      <ExcelVersionList :fileId="historyFileId"/>
    </el-dialog>
  </div>
<!--  <div style="height: 100px;width: 100px;">
    <ViewExcel :fileId="fileId" :fileName="fileName" :version="3"/>
  </div>-->
</template>

<script setup name="UserFileList" lang="ts">
import {useRouter} from "vue-router";
import ExcelVersionList from "@/views/excel/components/excelVersionList.vue";
import {createFile, delFileByVer, getFileInfo, getUserFileList} from "@/api/excel";
import {exportSheetExcel} from "@/views/excel/components/myExport2";
import {EventBus} from "@/views/excel/components/event-bus";
import ViewExcel from "@/views/excel/components/ViewExcel.vue";

const router = useRouter();
const {proxy} = getCurrentInstance() as ComponentInternalInstance;

const dataList = ref([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const fileId = ref('1789905555880677377')
const fileName = ref('258369')
const ceshiTab = ref('1')

const historyVisible = ref(false);
const historyFileId = ref('');

const queryFormRef = ref<ElFormInstance>();
const demoFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData = {
  id: undefined,
  name: undefined,
  remark: undefined,
}

const form = ref(initFormData);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  remark: undefined,
});


/** 查询测试单列表 */
const getList = async () => {
  loading.value = true;
  const res = await getUserFileList(queryParams.value);
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  demoFormRef.value?.resetFields();
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


/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加在线文档";
}

/** 修改按钮操作 */
const handleInfo = async (row?) => {
  reset();
  const _id = row?.id || ids.value[0]
  // const res = await getDemo(_id);
  // Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改测试单";
}

/** 提交按钮 */
const submitForm = () => {
  demoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      var res = await createFile(form.value).finally(() => buttonLoading.value = false);
      await getList();
      router.push({path: '/excel/info', query: {id: res.data, isHistoryStatus: 1, purview: 1}})
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?) => {
  ElMessageBox.confirm('是否确认删除文件“' + (row.name == null ? '未命名' : row.name) + '”', '删除提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      loading.value = true;
      await delFileByVer({fileId: row.id}).then(res => {
        if (res.code == 200)
          ElMessage.success('删除成功')
        else ElMessage.error('删除失败')
      }).finally(() => {
        loading.value = false
        getList()
      })
    })
}

/** 导出按钮操作 */
const handleExport = async (row) => {
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
        await exportSheetExcel(res.data.sheetData, res.data.name).then(() => {
          console.log('导出成功')
          loading.value = false;
        }).catch((e) => {
          ElMessage.warning('导出失败')
          loading.value = false;
        })
      }, 250)
    } else {
      ElMessage.warning('导出失败')
    }
  }).finally(() => {
    loading.value = false
  })
}
const handleLook = (row: any, isEdit: any) => {
  // console.log(row)
  router.push({path: '/excel/info', query: {...row.row, isHistoryStatus: isEdit, purview: 1}})
}
//修改操作
const handleEdit = (row: any, isEdit: any) => {
  router.push({path: '/excel/info', query: {...row.row, isHistoryStatus: isEdit, purview: 1}})
}
//文件历史列表
const handleHistory = (row: any) => {
  historyFileId.value = row.id
  historyVisible.value = true
}
onMounted(() => {
  getList();
});
</script>

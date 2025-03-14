<template>
  <div class="p-2">
    <el-row :gutter="20" v-loading="zipLoading">
      <!-- 树 -->
      <el-col :lg="4" :xs="24" style="">
        <el-card shadow="hover">
          <el-input v-model="categoryName" placeholder="请输入分类名称" prefix-icon="Search" clearable />
          <el-tree
            class="mt-2"
            ref="categoryTreeRef"
            node-key="id"
            :data="categoryOptions"
            :props="{ value: 'id',label: 'name', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template #default="{ node ,data }">
              <span>{{ node.label }} </span>
              <el-tag round>{{ data.num }}</el-tag>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div class="search" v-show="showSearch">
            <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
              <el-form-item label="项目" prop="projectId">
                <el-select v-model="queryParams.projectId" placeholder="请选择项目信息" clearable filterable>
                  <el-option v-for="data in projectInfoList" :key="data.id" :label="data.name" :value="data.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="订单" prop="orderId">
                <el-select v-model="queryParams.orderId" placeholder="请选择销售订单信息" clearable filterable>
                  <el-option v-for="data in orderInfoList" :key="data.id" :label="data.name" :value="data.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="文件名称" prop="name">
                <el-input v-model="queryParams.name" placeholder="请输入文件名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="发布人" prop="downloadUrl">
                <el-select v-model="queryParams.updateBy" placeholder="请选择人员" clearable filterable>
                  <el-option v-for="data in userList" :key="data.userId" :label="formatLabel(data)" :value="data.userId" />
                </el-select>
              </el-form-item>
              <el-form-item label="文件类型" prop="isOnline">
                <el-select v-model="queryParams.isOnline" placeholder="请选择文件类型">
                  <el-option key="0" label="线下" :value="0" />
                  <el-option key="1" label="线上" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="更新时间" style="width: 308px">
                <el-date-picker
                  v-model="dateRangeCreateTime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </transition>

        <el-card shadow="never">
          <template #header>
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleZip">打包下载</el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" :data="projectFileInfoList" @selection-change="handleSelectionChange" :row-key="(row)=>row.id">
            <el-table-column type="selection" width="55" align="center" :reserve-selection="true" />
            <el-table-column label="主键" align="center" prop="id" v-if="false" />
            <el-table-column label="序号" width="50px" align="center" type="index" />
            <el-table-column label="项目" align="center" prop="projectId" width="150px" show-overflow-tooltip>
              <template #default="scope">
                <span>{{ getProjectName(scope.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="订单" align="center" prop="orderId" width="200px" show-overflow-tooltip >
              <template #default="scope">
                <span>{{ getOrderName(scope.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属分类" align="center" prop="categoryId" :formatter="categoryFormat" />
            <el-table-column label="文件名称" align="center" prop="name" width="200px" show-overflow-tooltip />
            <el-table-column label="文件类型" align="center" prop="isOnline">
              <template #default="scope">
                <span v-if="scope.row.isOnline == 0"><el-tag type="warning">线下</el-tag></span>
                <span v-if="scope.row.isOnline == 1"><el-tag type="warning">线上</el-tag></span>
              </template>
            </el-table-column>
            <el-table-column label="文件版本" align="center" prop="version">
              <template #default="scope">
                <span
                  ><el-tag>V{{scope.row.version}}</el-tag></span
                >
              </template>
            </el-table-column>
            <el-table-column label="发布人" align="center" prop="updateBy">
              <template #default="scope">
                <span>{{ getUserName(scope.row.updateBy) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" width="120px">
              <template #default="scope">
                <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" align="center" prop="updateTime" width="120px">
              <template #default="scope">
                <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200px">
              <template #default="scope">
                <el-tooltip content="预览" placement="top">
                  <el-button link type="primary" icon="View" @click="onPreview(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip content="版本管理" placement="top">
                  <el-button link type="primary" icon="Menu" @click="handleVersionList(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip content="下载" placement="top">
                  <el-button
                    link
                    type="primary"
                    icon="Download"
                    @click="handleDownload(scope.row)"
                    v-hasPermi="['business:projectFileInfo:edit']"
                  ></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>
    <!-- 添加或修改项目文件信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <el-scrollbar style="height:500px;">
        <el-table v-loading="versionLoading" :data="projectFileVersionInfoList">
          <el-table-column label="文件名称" align="center" prop="name" width="200px" show-overflow-tooltip />
          <el-table-column label="文件版本" align="center" prop="version">
            <template #default="scope">
              <span
                ><el-tag>V{{scope.row.version}}</el-tag></span
              >
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="120px">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="发布人" align="center" prop="updateBy">
            <template #default="scope">
              <span>{{ getUserName(scope.row.updateBy) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="预览" placement="top">
                <el-button link type="primary" icon="View" @click="onPreviewDialog(scope.row)"></el-button>
              </el-tooltip>
              <el-tooltip content="下载" placement="top">
                <el-button link type="primary" icon="Download" @click="handleDownloadDialog(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </el-dialog>
  </div>
  <div id="luckysheet" style="display:none;"></div>
</template>

<script setup name="ProjectFileInfo" lang="ts">
import { listProjectFileInfo, getProjectFileInfo, delProjectFileInfo, addProjectFileInfo, updateProjectFileInfo ,listProjectFileVersionInfo} from '@/api/business/projectFileInfo';
import { ProjectFileInfoVO, ProjectFileInfoQuery, ProjectFileInfoForm } from '@/api/business/projectFileInfo/types';
import { CategoryInfoVO } from "@/api/business/categoryInfo/types";
import { useRouter } from "vue-router";
import { listCategoryInfoFileNum } from "@/api/business/categoryInfo";
import { ProjectInfoVO } from "@/api/business/projectInfo/types";
import { listProjectInfoAll } from "@/api/business/projectInfo";
import { OrderInfoVO } from "@/api/business/orderInfo/types";
import { listAllOrderInfo } from "@/api/business/orderInfo";
import { UserVO } from "@/api/system/user/types";
import { selectAll } from "@/api/system/user";
import { Base64 } from 'js-base64';
//引入luckyexcel
import LuckyExcel from 'luckyexcel';
import { getFileInfo } from "@/api/excel";
import { exportSheetBlob, exportSheetExcel } from "@/views/excel/components/myExport2";
//jszip 下载
import JSZip from 'jszip'
import FileSaver from 'file-saver';
import axios from 'axios';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
//分类查询vo
const categoryOptions = ref<CategoryInfoVO[]>([]);
const categoryName = ref('');
const categoryTreeRef = ref<ElTreeInstance>();
const router = useRouter();
const categoryData = ref([]);
//用户列表
const userList = ref<UserVO[]>([]);

const projectFileInfoList = ref<ProjectFileInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);

const sels = ref<ProjectFileInfoVO[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const projectFileInfoFormRef = ref<ElFormInstance>();

const projectInfoList = ref<ProjectInfoVO[]>([]);

const orderInfoList = ref<OrderInfoVO[]>([]);

const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const projectFileVersionInfoList = ref<[]>([]);

const versionLoading = ref(false);

const zipLoading = ref(false);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProjectFileInfoForm = {
  id: undefined,
  projectId: undefined,
  orderId: undefined,
  categoryId: undefined,
  name: undefined,
  downloadUrl: undefined,
  isOnline: undefined,
  actRuVariableId: undefined,
  procInstId: undefined,
  executionId: undefined,
  taskId: undefined,
  bytearrayId: undefined,
  description: undefined,
  onlineFileId: undefined,
}
const data = reactive<PageData<ProjectFileInfoForm, ProjectFileInfoQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectId: undefined,
    orderId: undefined,
    categoryId: undefined,
    name: undefined,
    downloadUrl: undefined,
    isOnline: undefined,
    actRuVariableId: undefined,
    procInstId: undefined,
    executionId: undefined,
    taskId: undefined,
    bytearrayId: undefined,
    description: undefined,
    onlineFileId: undefined,
    updateBy: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    isOnline: [
      { required: true, message: "是否在线;0:否 1:是不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目文件信息列表 */
const getList = async () => {
  loading.value = true;
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'UpdateTime');
  const res = await listProjectFileInfo(queryParams.value);
  projectFileInfoList.value = res.rows;
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
  projectFileInfoFormRef.value?.resetFields();
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

/** 多选框选中数据 */
const handleSelectionChange = (selection: ProjectFileInfoVO[]) => {
  sels.value = selection;
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

const onlineFileId = ref("");
const handleVersionList =  async (row?: ProjectFileInfoVO) => {
  versionLoading.value =true;
  dialog.visible = true;
  dialog.title = "版本管理";
  onlineFileId.value = row?.onlineFileId;
  let query = {"projectFileId":row.id};
  const  res = await listProjectFileVersionInfo(query);
  projectFileVersionInfoList.value = res.data;
  versionLoading.value = false;

}
/** 提交按钮 */
const submitForm = () => {
  projectFileInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateProjectFileInfo(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProjectFileInfo(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ProjectFileInfoVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除项目文件信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delProjectFileInfo(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}





const category = ref("90");
onMounted(() => {
  queryParams.value.category = category.value;
  getTreeSelect();
  //查询所有的项目
  getAllProjects();
  //获取所有的销售订单
  getAllOrders();
  //获取所有的用户
  getAllUsers();

  //查询列表
  getList();
});

/** 查询分类下拉树结构 */
const getTreeSelect = async () => {
  const res = await listCategoryInfoFileNum(queryParams.value);
  categoryData.value = res.data;
  categoryOptions.value = proxy?.handleTree<CategoryInfoVO>(res.data, "id", "parentId");
};

//获取所有的项目信息
const getAllProjects = async () => {
  let res =  await listProjectInfoAll();
  projectInfoList.value = res.data;
}

//获取所有的销售订单信息
const getAllOrders = async () => {
  let res =  await listAllOrderInfo();
  orderInfoList.value = res.data;
}

/** 节点单击事件 */
const handleNodeClick = (data: CategoryInfoVO) => {
  queryParams.value.categoryId = data.id;
  handleQuery()
}

/** 通过条件过滤节点  */
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.indexOf(value) !== -1
}
/** 根据名称筛选部门树 */
watchEffect(
  () => { categoryTreeRef.value?.filter(categoryName.value); },
  {
    flush: 'post' // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);
//获取所有的销售订单信息
const getAllUsers = async () => {
  let res =  await selectAll();
  userList.value = res.data;
}

const formatLabel =  (data : UserVO) => {
  return data.nickName+" "+data.userName;
}
const getProjectName = (row?:ProjectFileInfoVO ) => {
  let actions: any[] = [];
  let datas = projectInfoList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].id == ('' + row.projectId)) {
      actions.push(datas[key].name);
      return true;
    }
  })
  return actions.join('');
}

const getOrderName = (row?:ProjectFileInfoVO ) => {
  let actions: any[] = [];
  let datas = orderInfoList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].id == ('' + row.orderId)) {
      actions.push(datas[key].name);
      return true;
    }
  })
  return actions.join('');
}

const categoryFormat = (row: any, column: any, cellValue: any, index: any) =>  {
  return categoryData.value.find(data =>data.id === cellValue)?.name ?? '';
}

const getUserName = (id: number) => {
  let actions: any[] = [];
  let datas = userList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].userId == ('' +id)) {
      actions.push(datas[key].nickName);
      return true;
    }
  })
  return actions.join('');
}


/**
 * 预览文件
 * @param row
 */
const onPreview= (row?:ProjectFileInfoVO) => {
  if(row?.isOnline == 0 ) {
    window.open(import.meta.env.VITE_FILE_PREVIEW_URL+"?url=" + encodeURIComponent(Base64.encode(row.downloadUrl)));
  }else if(row?.isOnline == 1 ) {
    //仅能查看文档
    router.push({ path: '/excel/info', query: { id: row.onlineFileId, isHistoryStatus: 0, purview: 0,fileVer:row.version } })
  }
}
/** 下载按钮操作 */
const handleDownload = (row?:ProjectFileInfoVO) => {
  if(row?.isOnline == 0 ) {
    proxy?.$download.fileUrl(row.downloadUrl,row.name)
  }else if(row?.isOnline == 1 ) {
      getFileInfo({fileId: row.onlineFileId, version: row.version}).then(res => {
        window.luckysheet.destroy()
        if (res.data && res.data.sheetData && res.data.sheetData.length) {
          luckysheet.create({
            container: 'luckysheet', // 设定DOM容器的id
            lang: 'zh', // 设定表格语言
            data:res.data.sheetData,
          });
        } else {
          luckysheet.create({
            container: 'luckysheet', // 设定DOM容器的id
            lang: 'zh', // 设定表格语言
            data:[]
          });
        }
        exportSheetExcel(luckysheet.getAllSheets(),row.name);
    })
  }
}
/**
 * 预览文件
 * @param row
 */
const onPreviewDialog= (row?:ProjectFileInfoVO) => {
  if(row?.isOnline == 0 ) {
    window.open(import.meta.env.VITE_FILE_PREVIEW_URL+"?url=" + encodeURIComponent(Base64.encode(row.downloadUrl)));
  }else if(row?.isOnline == 1 ) {
    //仅能查看文档
    router.push({ path: '/excel/info', query: { id: onlineFileId.value, isHistoryStatus: 0, purview: 0,fileVer:row.version } })
  }
}
/** 下载按钮操作 */
const handleDownloadDialog = (row?:ProjectFileInfoVO) => {
  if(row?.isOnline == 0 ) {
    proxy?.$download.fileUrl(row.downloadUrl,row.name)
  }else if(row?.isOnline == 1 ) {
    getFileInfo({fileId: onlineFileId.value, version: row.version}).then(res => {
      window.luckysheet.destroy()
      if (res.data && res.data.sheetData && res.data.sheetData.length) {
        luckysheet.create({
          container: 'luckysheet', // 设定DOM容器的id
          lang: 'zh', // 设定表格语言
          data:res.data.sheetData,
        });
      } else {
        luckysheet.create({
          container: 'luckysheet', // 设定DOM容器的id
          lang: 'zh', // 设定表格语言
          data:[]
        });
      }
      exportSheetExcel(luckysheet.getAllSheets(),row.name);
    })
  }
}

/** 导出按钮操作 */
const  handleZip = async() => {
  if(!sels.value || sels.value.length == 0 ){
    proxy?.$modal.msgError("请选择项目资料数据");
  }else {
    zipLoading.value = true;
    let fileNames = [];
    const zip = new JSZip() // 创建实例对象
    for (const item of sels.value) {
      if( item.isOnline == 0 ){
        //离线文件
        const res = await axios({
          method: 'get',
          url: item.downloadUrl,
          responseType: 'blob'
        });
        const blob = new Blob([res.data], { type: 'application/octet-stream' });
        const fileName = item.name + '';
        // 创建文件用file()，创建文件夹用 floder()
        zip.file(fileName, blob, {binary: true})
      }else{
        //在线文件
        const blob = createSheetBlob(item.onlineFileId,item.version);
        if(blob == null){
          continue;
        }
        const fileName = item.name + '.xlsx';
        zip.file(fileName, blob, {binary: true})
      }
    }
    // 生成zip 文件
    zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',  // STORE: 默认不压缩， DEFLATE：需要压缩
      compressionOptions: {
        level: 9          // 压缩等级 1~9   1 压缩速度最快， 9 最优压缩方式
      }
    }).then((res: any) => {
      FileSaver.saveAs(res, 'export.zip') // 使用FileSaver.saveAs保存文件，文件名可自定义
      zipLoading.value = false;
    })
  }

}
const createSheetBlob = async( onlineFileId:any, version:any)=>{
  //获取excel文件信息
  const res = await getFileInfo({fileId: onlineFileId, version});
  window.luckysheet.destroy();
  if (res.data && res.data.sheetData && res.data.sheetData.length) {
    luckysheet.create({
      container: 'luckysheet', // 设定DOM容器的id
      lang: 'zh', // 设定表格语言
      data:res.data.sheetData,
    });
  } else {
    return null;
  }
  return exportSheetBlob(luckysheet.getAllSheets());
}
</script>

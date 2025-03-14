<template>
  <div class="p-2">
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
          <el-form-item label="发货名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="是否同步" prop="isSync">
            <el-select v-model="queryParams.isSync" placeholder="请选择文件类型">
              <el-option key="0" label="未同步" :value="0" />
              <el-option key="1" label="已同步" :value="1" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['business:projectDeliveryInfo:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['business:projectDeliveryInfo:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              v-hasPermi="['business:projectDeliveryInfo:remove']"
              >删除</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="projectDeliveryInfoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" width="50px" align="center" type="index" />
        <el-table-column label="主键" align="center" prop="id" v-if="false" />
        <el-table-column label="项目" align="center" prop="projectId" width="150px">
          <template #default="scope">
            <span>{{ getProjectName(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单" align="center" prop="orderId" width="200px">
          <template #default="scope">
            <span>{{ getOrderName(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="名称" align="center" prop="name" />
        <el-table-column label="文件版本" align="center" prop="version">
          <template #default="scope">
            <span
              ><el-tag>V{{formatVersion(scope.row.version)}}</el-tag></span
            >
          </template>
        </el-table-column>
        <el-table-column label="是否同步" align="center" prop="isSync">
          <template #default="scope">
            <span v-if="scope.row.isSync == 0"><el-tag type="warning">未同步</el-tag></span>
            <span v-if="scope.row.isSync == 1"><el-tag type="warning">已同步</el-tag></span>
          </template>
        </el-table-column>
        <el-table-column label="发布人" align="center" prop="updateBy">
          <template #default="scope">
            <span>{{ getUserName(scope.row.updateBy) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="260px">
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
            <el-tooltip content="设计" placement="top" >
              <el-button
                link
                type="primary"
                icon="Setting"
                @click="handleEditExcel(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="同步" placement="top" v-if="scope.row.isSync == 0">
              <el-button link type="primary" icon="Position" @click="handleSync(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['business:projectDeliveryInfo:edit']"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['business:projectDeliveryInfo:remove']"
              ></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改项目发货信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="projectDeliveryInfoFormRef" :model="form" :rules="rules" label-width="80px">

        <el-form-item label="项目" prop="projectId">
          <el-select v-model="form.projectId" placeholder="请选择项目信息" clearable filterable @change="getOrdersByProjectId">
            <el-option v-for="data in projectInfoList" :key="data.id" :label="data.name" :value="data.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单" prop="orderId">
          <el-select v-model="form.orderId" placeholder="请选择订单信息" clearable filterable>
            <el-option v-for="data in orderInfoFilterList" :key="data.id" :label="data.name" :value="data.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改项目文件信息对话框 -->
    <el-dialog :title="versionDialog.title" v-model="versionDialog.visible" width="800px" append-to-body>
      <el-scrollbar style="height:500px;">
        <el-table v-loading="versionLoading" :data="projectFileVersionInfoList">
          <el-table-column label="文件名称" align="center" prop="name" width="200px" show-overflow-tooltip />
          <el-table-column label="文件版本" align="center" prop="version">
            <template #default="scope">
              <span
                ><el-tag>V{{formatVersion(scope.row.version)}}</el-tag></span
              >
            </template>
          </el-table-column>

          <el-table-column label="创建时间" align="center" prop="createTime" width="120px">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="同步到流程" align="center" prop="isSync">
            <template #default="scope">
              <span v-if="scope.row.isSync == 0"><el-tag type="warning">未同步</el-tag></span>
              <span v-if="scope.row.isSync == 1"><el-tag type="warning">已同步</el-tag></span>
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



    <div id="luckysheet" style="display:none;"></div>
  </div>
</template>

<script setup name="ProjectDeliveryInfo" lang="ts">
import { listProjectDeliveryInfo, getProjectDeliveryInfo, delProjectDeliveryInfo, addProjectDeliveryInfo, updateProjectDeliveryInfo,synProjectDeliveryInfo } from '@/api/business/projectDeliveryInfo';
import { ProjectDeliveryInfoVO, ProjectDeliveryInfoQuery, ProjectDeliveryInfoForm } from '@/api/business/projectDeliveryInfo/types';
import { ProjectInfoVO } from "@/api/business/projectInfo/types";
import { listProjectInfoAll } from "@/api/business/projectInfo";
import { listAllOrderInfo } from "@/api/business/orderInfo";
import { OrderInfoVO } from "@/api/business/orderInfo/types";
import { ProjectFileInfoVO } from "@/api/business/projectFileInfo/types";
import { UserVO } from "@/api/system/user/types";
import { selectAll } from "@/api/system/user";
import { createFile, getFileInfo } from "@/api/excel";
import { addProjectFileInfo, listProjectFileVersionInfo, updateProjectFileInfo } from "@/api/business/projectFileInfo";
import { useRouter } from "vue-router";
import {  getProjectFileInfo } from '@/api/business/projectFileInfo';
import { exportSheetExcel } from "@/views/excel/components/myExport2";
import { EventBus } from "@/views/excel/components/event-bus";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const projectDeliveryInfoList = ref<ProjectDeliveryInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const projectDeliveryInfoFormRef = ref<ElFormInstance>();

const projectInfoList = ref<ProjectInfoVO[]>([]);
const orderInfoList = ref<OrderInfoVO[]>([]);

const orderInfoFilterList = ref<OrderInfoVO[]>([]);

const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);
//用户列表
const userList = ref<UserVO[]>([]);
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const versionDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const versionLoading = ref(false);

const projectFileVersionInfoList = ref<[]>([]);

const initFormData: ProjectDeliveryInfoForm = {
  id: undefined,
  projectId: undefined,
  orderId: undefined,
  name: undefined,
  isSync: undefined,
  projectFileId: undefined,
}
const data = reactive<PageData<ProjectDeliveryInfoForm, ProjectDeliveryInfoQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectId: undefined,
    orderId: undefined,
    name: undefined,
    isSync: undefined,
    projectFileId: undefined,
    createBy: undefined,
    createTime: undefined,
    updateBy: undefined,
    updateTime: undefined,
    params: {
    }
  },
  rules: {
    projectId: [
      { required: true, message: "项目不能为空", trigger: "change" }
    ],
    orderId: [
      { required: true, message: "订单不能为空", trigger: "change" }
    ],
    name: [
      { required: true, message: "名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目发货信息列表 */
const getList = async () => {
  loading.value = true;
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'UpdateTime');
  const res = await listProjectDeliveryInfo(queryParams.value);
  projectDeliveryInfoList.value = res.rows;
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
  projectDeliveryInfoFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ProjectDeliveryInfoVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加项目发货信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ProjectDeliveryInfoVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getProjectDeliveryInfo(_id);
  await getOrdersByProjectId(res.data.projectId);
  Object.assign(form.value, res.data);

  dialog.visible = true;
  dialog.title = "修改项目发货信息";
}

/** 提交按钮 */
const submitForm = () => {
  projectDeliveryInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateProjectDeliveryInfo(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        //创建在线文件信息
        const fileForm = {
          id:'',
          name:form.value.name,
          remark:form.value.remark,
          version: ''
        };
        const res = await createFile(fileForm);
        // res.data
        let proFileForm ={
          projectId:form.value.projectId,
          orderId:form.value.orderId,
          name:form.value.name,
          isOnline:1,
          description:form.value.remark,
          onlineFileId:res.data,
          version:null
        }
        //创建项目文件信息
        const fileRes = await addProjectFileInfo(proFileForm);
        form.value.projectFileId = fileRes.data;
        await addProjectDeliveryInfo(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ProjectDeliveryInfoVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除项目发货信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delProjectDeliveryInfo(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('business/projectDeliveryInfo/export', {
    ...queryParams.value
  }, `projectDeliveryInfo_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getAllProjects();
  getAllOrders();
  getAllUsers();
  getList();
});

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
//获取所有的用户信息
const getAllUsers = async () => {
  let res =  await selectAll();
  userList.value = res.data;
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

const getOrdersByProjectId = async (projectId: string) => {
  //设置销售订单为空
  form.value.orderId = "";
  const params = { projectId: projectId };
  const res =  await listAllOrderInfo(params);
  orderInfoFilterList.value = res.data;
};

const  formatVersion = (version :any)=>{
  if(!version){
    return 0;
  }
  return version;
}

const router = useRouter();
/**
 * 预览文件
 * @param row
 */
const onPreview= async(row?:any) => {
    const res = await getProjectFileInfo(row.projectFileId);
    //仅能查看文档
    router.push({ path: '/excel/info', query: { id: res.data.onlineFileId, isHistoryStatus: 0, purview: 0,fileVer:res.data.version } })
}


/** 下载按钮操作 */
const handleDownload = async(row?:any) => {
     const res = await getProjectFileInfo(row.projectFileId);
     const fileRes = await getFileInfo({fileId: res.data.onlineFileId, version: res.data.version});
     window.luckysheet.destroy();
      if (fileRes.data && fileRes.data.sheetData && fileRes.data.sheetData.length) {
        luckysheet.create({
          container: 'luckysheet', // 设定DOM容器的id
          lang: 'zh', // 设定表格语言
          data:fileRes.data.sheetData,
        });
      } else {
        proxy?.$modal.msgError("不存在可下载的数据");
        return;
      }
     exportSheetExcel(luckysheet.getAllSheets(),fileRes.data.name);
}
const onlineFile = ref({
  onlineFileId:"",
  onlineFileName:"",
  version:"",
  row:{},
  projectFile:{},
});

/** 编辑excel */
const handleEditExcel = async(row?:any) => {
  const res = await getProjectFileInfo(row.projectFileId);
  //在线文件id
  onlineFile.value.onlineFileId = res.data.onlineFileId;
  onlineFile.value.onlineFileName = res.data.name;
  onlineFile.value.version = res.data.version;
  onlineFile.value.row = row;
  onlineFile.value.projectFile = res.data;
  //创建文件版本变化监听
  //移除监听
  EventBus.$off("excelFileInfo",null);
  //增加监听
  EventBus.$on("excelFileInfo", async function(eventObj: { version: any; name: any; id: any; }) {
    //文件版本
    let version = eventObj.version;
    //文件名称
    let name = eventObj.name;
    //文件id
    let id = eventObj.id;
    if(onlineFile.value.onlineFileId == id){
      onlineFile.value.projectFile.version = version;
      onlineFile.value.projectFile.name = name;
      //更新版本信息
      await updateProjectFileInfo(onlineFile.value.projectFile);
      //更新进度文件信息
      onlineFile.value.row.name = name;
      onlineFile.value.row.version = version;
      onlineFile.value.row.isSync = 0;
      await updateProjectDeliveryInfo( onlineFile.value.row);
      await getList();
    }
  });
  //编辑文档
  router.push({ path: '/excel/info', query: { id:res.data.onlineFileId, isHistoryStatus: 1, purview: 1,fileVer:res.data.version } })
}

const onlineFileId = ref("");
const handleVersionList =  async (row?: any) => {
  const res = await getProjectFileInfo(row.projectFileId);
  versionLoading.value =true;
  versionDialog.visible = true;
  versionDialog.title = "版本管理";
  onlineFileId.value =  res.data.onlineFileId;
  let query = {"projectFileId":row.projectFileId};
  const  resVerionList = await listProjectFileVersionInfo(query);
  projectFileVersionInfoList.value = resVerionList.data;
  versionLoading.value = false;
}


/**
 * 预览文件
 * @param row
 */
const onPreviewDialog= (row?:any) => {
    //仅能查看文档
    router.push({ path: '/excel/info', query: { id: onlineFileId.value, isHistoryStatus: 0, purview: 0,fileVer:row.version } })
}
/** 下载按钮操作 */
const handleDownloadDialog = (row?:any) => {
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

//同步流程
const handleSync = async(row?:any) => {
    //同步流程信息
   let query = {id: row.id};
   const  res = await synProjectDeliveryInfo(query);
   proxy?.$modal.msgSuccess("同步成功");
   await getList();
}


</script>

<template>
  <div class="p-2">
    <div class="mb-[10px]">
      <el-card shadow="hover" v-loading="loading">
        <el-row type="flex" align="middle">
          <el-col :span="12">
            <el-descriptions
              class="margin-top"
              :title='"销售订单:  "+orderInfo.orderNo +" "+orderInfo.name'
              :column="2"
              size="large"
              style="margin-top: 10px;"
            >
              <el-descriptions-item label="所属项目:">{{ getProjectName(orderInfo.projectId) }} </el-descriptions-item>
              <el-descriptions-item label="支架类型:"> {{supportTypeFormat(orderInfo.supportType)}}</el-descriptions-item>
              <el-descriptions-item label="开始日期:">{{ parseTime(orderInfo.startTime, '{y}-{m}-{d}') }}</el-descriptions-item>
              <el-descriptions-item label="预计结束日期:">{{ parseTime(orderInfo.endTime, '{y}-{m}-{d}') }}</el-descriptions-item>
              <el-descriptions-item label="创建时间:">{{ parseTime(orderInfo.createTime, '{y}-{m}-{d}') }}</el-descriptions-item>
              <el-descriptions-item label="更新时间:">{{ parseTime(orderInfo.updateTime, '{y}-{m}-{d}') }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="8" :offset="4" style="text-align: center">
            <el-space direction="horizontal" :size="40">
              <el-space direction="vertical" :size="10">
                <span style="font-size: 15px;font-weight:bolder ">进度</span>
                <span>{{progressFormat(orderInfo.progress)}}</span>
              </el-space>
              <el-space direction="vertical" :size="10">
                <span style="font-size: 15px;font-weight:bolder ">状态</span>
                <span>{{statusFormat(orderInfo.status)}}</span>
              </el-space>
              <el-space direction="vertical" :size="13">
                <span style="font-size: 15px;font-weight:bolder ">DC总容量</span>
                <span>{{orderInfo.dc}}MWp</span>
              </el-space>
            </el-space>
          </el-col>
        </el-row>
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane label="详情" name="detail">
            <el-card shadow="hover">
              <template #header><span style="font-size: 15px;font-weight:bolder ">客户信息</span> </template>
              <el-descriptions class="margin-top" :column="3" size="large" style="margin-top: 10px;">
                <el-descriptions-item label="联系人:">{{orderInfo.contactPerson }}</el-descriptions-item>
                <el-descriptions-item label="联系电话:">{{orderInfo.contactPhone }}</el-descriptions-item>
                <el-descriptions-item label="邮箱:">{{orderInfo.contactEmail }}</el-descriptions-item>
                <el-descriptions-item label="其它:">{{orderInfo.other }}</el-descriptions-item>
                <el-descriptions-item label="采购单位:">{{orderInfo.purchaseUnit }}</el-descriptions-item>
                <el-descriptions-item label="业主单位:">{{orderInfo.ownerUnit }}</el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-card shadow="hover" style="margin-top: 20px;">
              <template #header><span style="font-size: 15px;font-weight:bolder ">销售订单信息</span>   </template>
              <el-descriptions class="margin-top" :column="1" size="large" style="margin-top: 10px;">
                <el-descriptions-item label="负责人:">{{ getUserName(orderInfo.manager) }}</el-descriptions-item>
                <el-descriptions-item label="项目地点:">{{orderInfo.location }}</el-descriptions-item>
                <el-descriptions-item label="项目内容描述:">
                  <div v-html="orderInfo.description"></div>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-card shadow="hover" style="margin-top: 20px;">
              <template #header> <span style="font-size: 15px;font-weight:bolder ">销售订单文件</span>  </template>
              <div class="search">
                <el-form :model="queryFileParams" ref="queryFileFormRef" :inline="true" label-width="68px">
                  <el-form-item label="文件名称" prop="fileName">
                    <el-input v-model="queryFileParams.name" placeholder="请输入文件名称" clearable style="width: 240px" />
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleFileQuery">搜索</el-button>
                    <el-button type="warning" icon="Download" @click="handleZip">打包下载</el-button>
                  </el-form-item>
                </el-form>
              </div>
              <el-card shadow="never">
                <el-table v-loading="fileLoading" :data="projectFileInfoList" @selection-change="handleSelectionChange" :row-key="(row)=>row.id">
                  <el-table-column type="selection" width="55" align="center" :reserve-selection="true" />
                  <el-table-column label="文件名称" align="center" prop="name" width="400px" show-overflow-tooltip />
                  <el-table-column label="分类" align="center" prop="categoryId">
                    <template #default="scope">
                      <span>{{ getCategoryName(scope.row.categoryId) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="文件版本" align="center" prop="version">
                    <template #default="scope">
                      <el-tag>V{{versionFormat(scope.row.version)}}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="上传人" align="center" prop="updateBy">
                    <template #default="scope">
                      <span>{{ getUserName(scope.row.updateBy) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="更新时间" align="center" prop="updateTime">
                    <template #default="scope">
                      <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
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
                          v-hasPermi="['business:projectInfo:remove']"
                        ></el-button>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
                <pagination
                  v-show="fileTotal>0"
                  :total="fileTotal"
                  v-model:page="queryFileParams.pageNum"
                  v-model:limit="queryFileParams.pageSize"
                  @pagination="getFileList"
                />
              </el-card>
            </el-card>

            <el-card shadow="hover" style="margin-top: 20px;">
              <template #header> <span style="font-size: 15px;font-weight:bolder ">操作日志</span>  </template>
              <el-card shadow="never">
                <el-table v-loading="logLoading" :data="operLogList">
                  <el-table-column label="序号" width="50px" align="center" type="index" />
                  <el-table-column label="操作类型" align="center" prop="operatorType">
                    <template #default="scope">
                      <dict-tag :options="project_oper_log_type" :value="scope.row.operatorType" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作员" align="center" prop="createBy">
                    <template #default="scope">
                      <span>{{ getUserName(scope.row.createBy) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="执行结果" align="center" prop="result">
                    <template #default="scope">
                      <span v-if="scope.row.result == 0">成功</span>
                      <span v-if="scope.row.result == 1">失败</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作时间" align="center" prop="createTime">
                    <template #default="scope">
                      <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="说明" align="center" prop="description" />
                </el-table>
                <pagination
                  v-show="logTotal>0"
                  :total="logTotal"
                  v-model:page="queryLogParams.pageNum"
                  v-model:limit="queryLogParams.pageSize"
                  @pagination="getOperLogList"
                />
              </el-card>
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="评论" name="comment">
            <business-comment :obj="commentVo" />
          </el-tab-pane>
          <el-tab-pane label="库存" name="inventory">
            <div class="p-2">
              <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
                <div class="search" v-show="showSearch">
                  <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
                    <el-form-item label="品名" prop="PName">
                      <el-input v-model="queryParams.PName" placeholder="请输入品名" clearable style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="料号" prop="PartNo">
                      <el-input v-model="queryParams.PartNo" placeholder="请输入料号" clearable style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="规格" prop="Spec" label-width="100px">
                      <el-input v-model="queryParams.Spec" placeholder="请输入规格" clearable style="width: 240px" />
                    </el-form-item>
                    <el-form-item label="材质" prop="Material" label-width="100px">
                      <el-input v-model="queryParams.Material" placeholder="请输入材质" clearable style="width: 240px" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </transition>

              <el-card shadow="never">
                <template #header>
                  <el-row :gutter="10" class="mb8">
                    <right-toolbar v-model:showSearch="showSearch" @queryTable="getInventoryList"></right-toolbar>
                  </el-row>
                </template>

                <el-table v-loading="inventoryloading" :data="inventoryList">
                  <el-table-column label="序号" type="index" width="50px" />
                  <el-table-column label="料号" align="center" prop="partNo" />
                  <el-table-column label="品名" align="center" prop="pname" />
                  <el-table-column label="规格" align="center" prop="spec" />
                  <el-table-column label="材质" align="center" prop="material" />
                  <el-table-column label="长度" align="center" prop="length" />
                  <el-table-column label="存储地点" align="center" prop="stoLocation" />
                  <el-table-column label="库存单位名称" align="center" prop="unitName" />
                  <el-table-column label="数量" align="center" prop="num" />
                  <el-table-column label="通用项目库存可用量" align="center" prop="commonNum" />
                  <el-table-column label="其它项目库存可用量" align="center" prop="otherNum">
                    <template v-slot="scope">
                      <el-link type="primary" @click="handleOtherDetail(scope.row)">{{scope.row.otherNum}}</el-link>
                    </template>
                  </el-table-column>
                </el-table>

                <pagination
                  v-show="inventoryTotal>0"
                  :total="inventoryTotal"
                  v-model:page="queryParams.pageNum"
                  v-model:limit="queryParams.pageSize"
                  @pagination="getInventoryList"
                />
              </el-card>

              <!-- 添加或修改消息历史记录信息对话框 -->
              <el-dialog title="其它项目库存列表" v-model="inventorydialog.visible" width="900px" append-to-body>
                <el-table v-loading="loading" :data="otherInventoryList">
                  <el-table-column label="序号" type="index" width="50px" />
                  <el-table-column label="销售订单编码" align="center" prop="proNo" width="120px" show-overflow-tooltip />
                  <el-table-column label="销售订单名称" align="center" prop="proName" width="150px" show-overflow-tooltip />
                  <el-table-column label="规格" align="center" prop="spec" />
                  <el-table-column label="材质" align="center" prop="material" />
                  <el-table-column label="长度" align="center" prop="length" />
                  <el-table-column label="存储地点" align="center" prop="stoLocation" />
                  <el-table-column label="库存单位名称" align="center" prop="unitName" width="120px" />
                  <el-table-column label="数量" align="center" prop="num" />
                </el-table>
                <template #footer>
                  <div class="dialog-footer">
                    <el-button @click="cancel">取 消</el-button>
                  </div>
                </template>
              </el-dialog>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
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
<script setup name="OrderDetail" lang="ts">
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import {  getOrderInfo } from '@/api/business/orderInfo';
import { getProjectInfo, listProjectInfoAll } from "@/api/business/projectInfo";
import {
  listProjectFileInfo,
  getProjectFileInfo,
  delProjectFileInfo,
  addProjectFileInfo,
  updateProjectFileInfo,
  listProjectFileVersionInfo
} from "@/api/business/projectFileInfo";
import { listCategoryInfoNum } from "@/api/business/categoryInfo";
import { selectAll } from "@/api/system/user";
import { useRouter } from "vue-router";
import { listLogInfo } from "@/api/business/operLog";
import { ProjectFileInfoVO } from "@/api/business/projectFileInfo/types";
import { UserVO } from "@/api/system/user/types";
import { CategoryInfoVO } from '@/api/business/categoryInfo/types';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { order_support_type ,project_oper_log_type } = toRefs<any>(proxy?.useDict('order_support_type', 'project_oper_log_type'));
const activeName = ref('detail')
const loading = ref(true);
//订单id
const orderId = ref();
//项目id
const projectId = ref();
const router = useRouter();
//销售订单信息
const orderInfo = ref({});
//文件列表
const projectFileInfoList = ref<ProjectFileInfoVO[]>([]);
//所有分类信息
const categoryList = ref<CategoryInfoVO[]>([]);
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const projectFileVersionInfoList = ref<[]>([]);

const versionLoading = ref(false);
const commentVo = ref({
  projectId:"",
  orderId:""
});

import defAva from '@/assets/images/profile.jpg';
import { ProjectInfoVO } from "@/api/business/projectInfo/types";
import { Base64 } from 'js-base64';
import { getFileInfo } from "@/api/excel";
import { exportSheetBlob, exportSheetExcel } from "@/views/excel/components/myExport2";
import { InventoryQuery, InventoryVO } from "@/api/business/inventory/types";
import { listOtherInventory, proListInventory } from "@/api/business/inventory";
import JSZip from "jszip";
import axios from "axios";
import FileSaver from "file-saver";
//文件查询params
const queryFileParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderId:orderId.value ,
  name: undefined,
})

const handleClick = (tab: TabsPaneContext, event: Event) => {
}

onMounted(async() => {
  //获取路由中的销售订单id
  orderId.value = router.currentRoute.value.query.orderId;
  //查看项目详情
  await getOrderDetail();
  //获取项目列表
  await getAllProjects();
  //查询文件列表
  await getFileList();
  //查询用户信息
  await getAllUsers();
  //查询分类列表
  await getCategoryList();
  //获取操作日志信息
  await getOperLogList();
  //查询库存列表
  await getInventoryList();


});
/** 查询项目信息详情 */
const getOrderDetail = async () => {
  loading.value = true;
  const res = await getOrderInfo(orderId.value);
  Object.assign(orderInfo.value, res.data);
  commentVo.value.orderId = orderId.value;
  commentVo.value.projectId = orderInfo.value.projectId;
  loading.value = false;
}

/**
 * 获取支架类型
 * @param proType
 */
const supportTypeFormat = (supType: string) => {

  return proxy?.selectDictLabel(order_support_type.value, supType);
}

/**
 * 状态变更
 */
const statusFormat =  (status : number) => {
  if(status == 0){
    return "待执行";
  }else if(status == 1){
    return "执行中";
  }else if(status == 2){
    return "已完成";
  }else if(status == 3){
    return "已终止";
  }else if(status == 4){
    return "暂缓";
  } else{
    return "执行中";
  }
}

const progressFormat =  (progress : any) => {
    return progress+"%";
}

//项目列表
const projectInfoList = ref<ProjectInfoVO[]>([]);
//获取所有的项目信息
const getAllProjects = async () => {
  let res =  await listProjectInfoAll();
  projectInfoList.value = res.data;
}

const getProjectName = (projectId?: any) => {
  let actions: any[] = [];
  let datas = projectInfoList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].id == ('' + projectId)) {
      actions.push(datas[key].name);
      return true;
    }
  })
  return actions.join('');
}


/** 搜索文件按钮操作 */
const handleFileQuery = () => {
  queryFileParams.value.pageNum = 1;
  getFileList();
}
//文件加载页面
const fileLoading = ref(true);
//文件列表总数
const fileTotal = ref(0);
/** 查询文件信息列表 */
const getFileList = async () => {
  fileLoading.value = true;
  queryFileParams.value.orderId = orderId.value;
  const res = await listProjectFileInfo(queryFileParams.value);
  projectFileInfoList.value = res.rows;
  fileTotal.value = res.total;
  fileLoading.value = false;
}
//获取所有的用户信息
const userList = ref<UserVO[]>([]);

const mentionList = ref([]);
const getAllUsers = async () => {
  let res =  await selectAll();
  userList.value = res.data;
  if( userList.value){
    for(let i =0 ;i< userList.value.length; i++){
      let avt = userList.value[i].avatar ;
      if(userList.value[i].avatar == null ||userList.value[i].avatar == ""){
        avt = defAva;
      }
       let mention = {
         userId: userList.value[i].userId,
         userName: userList.value[i].nickName,
         userAvatar: avt
       }
      mentionList.value.push(mention);
    }
  }
}




//获取所有用户信息
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

const getCategoryList = async () => {
  let res =  await listCategoryInfoNum();
  categoryList.value = res.data;
}


//获取分类名称
const getCategoryName = (id: number) => {
  let actions: any[] = [];
  let datas = categoryList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].id == ('' +id)) {
      actions.push(datas[key].name);
      return true;
    }
  })
  return actions.join('');
}

//文件加载页面
const logLoading = ref(true);
//文件列表总数
const logTotal = ref(0);
//文件列表
const operLogList = ref([]);

//文件查询params
const queryLogParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderId:orderId.value

})

/** 查询文件信息列表 */
const getOperLogList = async () => {
  logLoading.value = true;
  queryLogParams.value.orderId = orderId.value;
  const res = await listLogInfo(queryLogParams.value);
  operLogList.value = res.rows;
  logTotal.value = res.total;
  logLoading.value = false;
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


//---库存分页查询
const showSearch = ref(true);
const data = reactive<PageData<{}, InventoryQuery>>({
  form: {

  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    OrgCode: undefined,
    ProNo: undefined,
    ProName: undefined,
    PName: undefined,
    PartNo: undefined,
    Spec: undefined,
    Material: undefined,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);
const inventoryList = ref<InventoryVO[]>([]);
const inventorydialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const inventoryloading = ref(false);

const inventoryTotal = ref(0);

const otherInventoryList = ref([]);
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getInventoryList();
}

const getInventoryList = async () => {
  inventoryloading.value = true;
  console.log("1122112");
  queryParams.value.ProNo = orderInfo.value.orderNo;
  const res = await proListInventory(queryParams.value);
  inventoryList.value = res.rows;
  inventoryTotal.value = res.total;
  inventoryloading.value = false;
}


const cancel = () => {
  inventorydialog.visible = false;
}

const handleOtherDetail= async (row?: InventoryVO) => {
  otherInventoryList.value = [];
  const _partNo = row?.partNo ;
  let query ={"PartNo": _partNo,"ProNo":"HD001,"+orderInfo.value.orderNo};
  const res = await listOtherInventory(query);
  otherInventoryList.value  =res.data;
  inventorydialog.visible = true;
}




//所有未选择的文件信息
const sels = ref<ProjectFileInfoVO[]>([]);
const zipLoading = ref(false);

/** 多选框选中数据 */
const handleSelectionChange = (selection: ProjectFileInfoVO[]) => {
  sels.value = selection;
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

const versionFormat =  (version : any) => {
  if(!version){
    return 0;
  }else{
    return version;
  }
}
</script>
<style lang="scss" scoped>
.user-card {
  display: flex;
  .user-content {
    flex: 1;
    margin-left: 16px;
    .user-info {
      .username {
        display: flex;
        align-items: center;
        text-decoration: none;
        .name {
          max-width: 10rem;
          font-weight: 500;
          font-size: 15px;
          color: #252933;
          line-height: 32px;
          margin-right: 4px;
        }
      }
    }
    .social-info {
      margin-bottom: 10px;
      a {
        text-decoration: none;
      }
      a:not(:first-child) {
        margin-left: 18px;
      }
      a span:last-child {
        margin-left: 3px;
        color: #9499a0;
      }
    }
  }
}
</style>

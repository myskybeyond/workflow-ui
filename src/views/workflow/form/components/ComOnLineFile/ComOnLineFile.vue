<template>
  <div v-if="showCreate">
    <el-button type="primary" :icon="Plus" plain @click="showDiaLog" style="width:160px;" :disabled="disabledVal ||  fieldReadonlyVal"
    >添加</el-button
    >
    <el-button type="primary" link :icon="Search" @click="showFileList" style="width:100px;" :disabled="disabledVal ||  fieldReadonlyVal"
    >选择历史文件</el-button
    >
  </div>
  <div v-if="!showCreate">
    <el-space direction="horizontal" :size="10">
      <div></div>
      <div style="font-size:16px;color: #606266" class="item-content">
        <el-icon><Checked /></el-icon>
        <el-link @click="toOnlineExcel"
          >{{quoteForm.name}} <el-tag type="warning">V{{versionFormat(quoteForm.version)}}</el-tag></el-link
        >
      </div>
      <div v-if="!(disabledVal ||  fieldReadonlyVal)">
        <el-tag type="danger" v-if="onlineFileStatus == 0">未编辑</el-tag>
        <el-tag type="danger" v-if="onlineFileStatus == 1">已修改未发布</el-tag>
        <el-tag type="success" v-if="onlineFileStatus == 2">已发布</el-tag>
      </div>
      <div class="item-content">
        <el-space direction="horizontal" :size="8">
          <!--          <el-tooltip content="查看在线文档" placement="top">-->
          <!--            <el-icon :size="20" color="#409efc" @click="toOnlineExcel" v-if="disabledVal ||  fieldReadonlyVal"><Document /></el-icon>-->
          <!--          </el-tooltip>-->
          <el-tooltip content="修改文档名称" placement="top">
            <el-icon :size="20" color="#409efc" @click="showDiaLog" v-if="!(disabledVal ||  fieldReadonlyVal)"><Edit /></el-icon>
          </el-tooltip>
          <el-tooltip content="编辑在线文档" placement="top">
            <el-icon :size="20" color="#409efc" @click="toOnlineExcel" v-if="!(disabledVal ||  fieldReadonlyVal)"><Document /></el-icon>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-icon :size="20" color="#409efc" @click="del" v-if="!(disabledVal ||  fieldReadonlyVal)"><Delete /></el-icon>
          </el-tooltip>
        </el-space>
      </div>
    </el-space>
  </div>

  <el-dialog :title="quoteDialog.title" v-model="quoteDialog.visible" width="500px" append-to-body>
    <el-form ref="formRef" :model="quoteForm" :rules="quoteRules" label-width="120px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="quoteForm.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input type="textarea" v-model="quoteForm.remark" placeholder="请输入描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog :title="historyDialog.title" v-model="historyDialog.visible" width="800px" append-to-body>
    <div class="search">
      <el-form :model="queryFileParams" ref="queryFileFormRef" :inline="true" label-width="68px">
        <el-form-item label="文件名称" prop="fileName">
          <el-input v-model="queryFileParams.name" placeholder="请输入文件名称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleFileQuery">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card shadow="never">
      <el-table v-loading="fileLoading" :data="projectFileInfoList" highlight-current-row>
        <el-table-column width="20">
          <template #default="scope">
            <el-radio :label="scope.row.id" v-model="selectVal"></el-radio>
          </template>
        </el-table-column>
        <el-table-column label="序号" width="50px" align="center" type="index" />
        <el-table-column label="文件名称" align="center" prop="name" width="400px" />
        <el-table-column label="文件版本" align="center" prop="version">
          <template #default="scope">
            <el-tag>V{{versionFormat(scope.row.version)}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
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
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleComplete">确 定</el-button>
        <el-button @click="historyCancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
//创建excel的api
import {createFile, editFileInfo} from "@/api/excel";
//引入事件总线
import {EventBus} from "@/views/excel/components/event-bus";
import { Plus,Search } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { taskListProjectFileInfo ,getProjectFileInfo } from "@/api/business/projectFileInfo";
import { ProjectFileInfoVO } from "@/api/business/projectFileInfo/types";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
//声明emit 事件
const emit = defineEmits(['update:modelValue']);
//默认显示报价单创建功能
const showCreate = ref(true);
const formRef = ref<ElFormInstance>();
//新增报价dialog
const  quoteDialog = reactive<DialogOption>({
  visible: false,
  title:''
});

const  historyDialog = reactive<DialogOption>({
  visible: false,
  title:''
});
//报价表单
const quoteForm = ref({
  id:'',
  name: '',
  remark: '',
  version: ''
});
const quoteRules =ref({
  name: [
    { required: true, message: "名称不能为空", trigger: "blur" }
  ]
});

//设置创建属性
//Object as PropType<{ onlineFileId: string, name: string , version: number }>
//字符串连接顺序:onlineFileId,name,version,de
//值结构为 onlineFileId,name,version,remark
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    default: ''
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  fieldReadonly:{
    type: Boolean,
    required: false,
    default: false
  },
  limitCategory:{
    type: String,
    required: false,
    default: ''
  }
})
//设置提交的数据
const modelValues = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
});

//声明禁用属性
const disabledVal = computed({
  get: () => props.disabled,
  set: (val) => {
  }
});
//声明整体表单禁用属性
const fieldReadonlyVal = computed({
  get: () => props.fieldReadonly,
  set: (val) => {
  }
});

const limitCategoryVal = computed({
  get: () => props.limitCategory,
  set: (val) => {
  }
});
const taskId =ref("");

onMounted(() => {
  //监听事件
  openListener();
  //存在值 初始化信息
  if(modelValues.value){
    init();
  }
  taskId.value = router.currentRoute.value.query.taskId;
});

//在线文件状态 0:初始  1:已修改未发布 2:已发布
const onlineFileStatus =ref(0);

//监听excel修改的变化
const openListener  = () => {
  //监听excel文件更新事件
  EventBus.$on("excelFileInfo", function(eventObj: { version: any; name: any; id: any; }) {
    //文件版本
    let version = eventObj.version;
    //文件名称
    let name = eventObj.name;
    //文件id
    let id = eventObj.id;
    if(quoteForm.value.id == id){
      modelValues.value = id +","+name+","+version+","+quoteForm.value.remark+","+limitCategoryVal.value;
      //更新form
      quoteForm.value.name = name;
      quoteForm.value.version = version;
      //修改在线文件状态为已发布
      onlineFileStatus.value = 2;
    }
  });

  //监听在线文件 已保存未发布的状态
  EventBus.$on("excelFileSave", function(eventObj: { version: any; name: any; id: any; }) {
    //文件版本
    let version = eventObj.version;
    //文件名称
    let name = eventObj.name;
    //文件id
    let id = eventObj.id;
    if(quoteForm.value.id == id) {
      //修改在线文件状态为已保存 未发布
      onlineFileStatus.value = 1;
    }
  });
}

//展示报价dialog
const showDiaLog=  () => {
  if(quoteForm.value.id){
    quoteDialog.title ="编辑清单";
  }else {
    quoteDialog.title ="新增清单";
  }
  quoteDialog.visible = true;
}



/** 取消按钮 */
const cancel = () => {
  //重置报价表单
  // quoteForm.value = {
  //   id:'',
  //   name: '',
  //   remark: '',
  //   version: ''
  // }
  quoteDialog.visible = false;
}


/** 创建报价文件 */
const submit = async () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if(!quoteForm.value.id){
        //id 不存在
        const res = await createFile(quoteForm.value);
        quoteForm.value.id = res.data;
        //展示创建页面
        showCreate.value = false;
      }else {
        //更新文件信息
        await editFileInfo({name: quoteForm.value.name, id: quoteForm.value.id});
      }
      //字符串连接顺序:onlineFileId,name,version
      modelValues.value = quoteForm.value.id+ ","+ quoteForm.value.name+","+ quoteForm.value.version+","+quoteForm.value.remark+","+limitCategoryVal.value;
      quoteDialog.visible = false;
      //消息
      proxy?.$modal.msgSuccess("保存成功");
    }
  });
}

//监测传入的值
watch(modelValues, () => {
  init();
})

//初始化页面方法
const init = () => {
  nextTick(() => {
    const selectedValue = modelValues.value;
    if(selectedValue){
      showCreate.value = false;
      let params = selectedValue.split(",");
      quoteForm.value = {
        id: params[0],
        name: params[1],
        remark: params[3]?params[3]:"",
        version: params[2]
      }
    }else {
      //展示创建按钮
      showCreate.value = true;
      quoteForm.value = {
        id:'',
        name: '',
        remark: '',
        version: ''
      }
    }
  })
}

//声明路由参数
const router = useRouter();
//去编辑在线的excel
const toOnlineExcel = () =>{
  if(disabledVal.value ||  fieldReadonlyVal.value){
    //仅能查看文档
    router.push({ path: '/excel/info', query: { id: quoteForm.value.id, isHistoryStatus: 0, purview: 0,fileVer:quoteForm.value.version } })
  }else{
    //编辑文档
    router.push({ path: '/excel/info', query: { id:quoteForm.value.id, isHistoryStatus: 1, purview: 1,fileVer:quoteForm.value.version } })
  }
}

//删除文件信息
const del = () =>{
  //字符串连接顺序:onlineFileId,name,version
  modelValues.value = "";
  //报价form
  quoteForm.value = {
    id:'',
    name: '',
    remark: '',
    version: ''
  }
  //清除选择标记
  selectVal.value = "";
  //展示创建操作
  showCreate.value =true;
}


const versionFormat =  (version : any) => {
  if(!version){
    return 0;
  }else{
    return version;
  }
}

//文件查询params
const queryFileParams = ref({
  pageNum: 1,
  pageSize: 10,
  isOnline:1,
  categoryId:limitCategoryVal.value,
  name: ""
})
//文件加载页面
const fileLoading = ref(true);
//文件列表总数
const fileTotal = ref(0);
//文件列表
const projectFileInfoList = ref<ProjectFileInfoVO[]>([]);

/** 查询文件信息列表 */
const getFileList = async () => {
  fileLoading.value = true;
  const res = await taskListProjectFileInfo(queryFileParams.value);
  projectFileInfoList.value = res.rows;
  fileTotal.value = res.total;
  fileLoading.value = false;
}
/** 搜索文件按钮操作 */
const handleFileQuery = () => {
  queryFileParams.value.pageNum = 1;
  getFileList();
}
const selectVal= ref('');
//展示历史文件列表
const showFileList=  () => {
  historyDialog.title ="历史文件";
  queryFileParams.value ={
    pageNum: 1,
    pageSize: 10,
    isOnline:1,
    categoryId:limitCategoryVal.value,
    name: "",
    taskId:taskId.value
  };
  getFileList();
  historyDialog.visible =true;
}
//完成
const handleComplete = async() =>{
  if(!selectVal.value){
    proxy?.$modal.msgError("请选择历史文件信息");
    return;
  }
  //选择数据完成了，需要重新切换数据
  let res =  await getProjectFileInfo(selectVal.value);
  let onlinefileId =  res.data.onlineFileId;
  let fileName = res.data.name;
  let version ="";
  if(res.data.version){
    version = res.data.version;
  }
  let description = "";
  if(res.data.description){
    description = res.data.description;
  }

  //初始化数据
  modelValues.value = onlinefileId+ ","+ fileName+","+version+","+ description+","+limitCategoryVal.value;
  //取消展示历史信息列表
  historyDialog.visible = false;
  //清除选择标记
  selectVal.value = "";
  showCreate.value = false;
}

const historyCancel  = () =>{
  //清除选择标记
  selectVal.value = "";
  //取消展示历史信息列表
  historyDialog.visible = false;
}



function formCreateValidate (rule,value,callback){
  //todo 验证
  if('form-create' === value){
    callback()
  }else{
    callback('请输入`form-create`')
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
</style>

<template>
  <div class="flex gap-3">
    <el-tag v-if="modelValues" :closable="!(disabledVal ||  fieldReadonlyVal)" @close="handleClose">
      {{ getSysUserName(modelValues)}}
    </el-tag>
    <el-button type="primary" plain icon="Plus" @click="handleOpen" :disabled="disabledVal ||  fieldReadonlyVal">选择人员</el-button>
    <!-- 选择用户 -->
    <el-dialog :title="dialog.title" width="60%" v-model="dialog.visible" append-to-body>
      <el-row type="flex" :gutter="20" v-if="fieldLimitDeptVal!='[]'">
        <span style="font-weight: bold;">限制部门:</span>
        <div class="flex gap-2">
          <el-tag v-for="deptId in limitDept">
            {{ getDeptName(deptId) }}
          </el-tag>
        </div>
      </el-row>
      <el-row type="flex" :gutter="20" v-if="isManagerVal">
        <span style="font-weight: bold;">仅可选择部门负责人</span>
      </el-row>
      <el-row type="flex" :gutter="20">
        <!--部门数据-->
        <el-col :span="7">
          <el-card shadow="never" style="height: 100%">
            <template v-slot:header>
              <span>部门列表</span>
            </template>
            <div class="head-container">
              <el-input v-model="deptName" placeholder="请输入部门名称" clearable prefix-icon="Search" style="margin-bottom: 20px" />
              <el-tree
                v-loading="loadingTreeData"
                :data="deptOptions"
                :props="deptProps"
                :expand-on-click-node="false"
                :highlight-current="true"
                :filter-node-method="filterNode"
                :current-node-key="currentNodekey"
                node-key="id"
                ref="departTree"
                :default-expanded-keys="deptDefaultExpandedKeys"
                @node-click="handleNodeClick"
              />
            </div>
          </el-card>
        </el-col>
        <el-col :span="17">
          <div style="width: 260px; margin: 0 5px 5px 0; display: flex;">
            <el-input prefix-icon="Search" v-model="queryParams.userName" placeholder="用户账号" clearable />
            <el-button style="margin-left: 5px;" type="primary" icon="Search" @click="getUserList()">搜索</el-button>
          </div>
          <el-table
            v-loading="loading"
            ref="multipleTable"
            height="600"
            :data="userTableList"
            highlight-current-row
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column width="30">
              <template #default="scope">
                <el-radio :label="(scope.row.userId+'')" v-model="modelValues">{{ "" }}</el-radio>
              </template>
            </el-table-column>
            <el-table-column label="用户账号" align="center" prop="userName" />
            <el-table-column label="用户昵称" align="center" prop="nickName" />
            <el-table-column label="部门" align="center" prop="deptName" />
          </el-table>
          <pagination :total="userTotal" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getUserList" />
        </el-col>
      </el-row>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleUserComplete">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { UserVO } from "@/api/system/user/types";
import { selectAll ,listUser, deptTreeSelect,filterListUser } from "@/api/system/user";
import { listDept  } from "@/api/system/dept";
import { ref } from "vue";
import { DeptVO } from "@/api/system/dept/types";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const  deptDefaultExpandedKeys =ref([]);
//用户列表
const userList = ref<UserVO[]>([]);
//dialog
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
//查询参数
const queryParams = ref({
  deptId: undefined,
  userName: undefined,
  pageSize:10
});
//用户信息列表
const userTableList = ref([]);
//用户条数
const userTotal = ref(0);
//列表加载
const loading = ref(false);
//树节点加载
const loadingTreeData = ref(false);
//部门名称
const deptName = ref("");
//部门data
const deptOptions = ref([]);
//用户信息列表
const currentNodekey = ref("");
//deptprops
const  deptProps = reactive({
    children: "children",
    label: "label"
});
//声明emit 事件
const emit = defineEmits(['update:modelValue']);
//设置创建属性
//字符串连接顺序:projectId,projectName
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
  limitDept: {
    type: Array,
    required: false,
    default: []
  },
  isManager:{
    type: Boolean,
    required: false,
    default: false
  },
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

//声明限制部门
const fieldLimitDeptVal = computed({
  get: () => props.limitDept,
  set: (val) => {
  }
});

//声明是否仅选择负责人
const isManagerVal = computed({
  get: () => props.isManager,
  set: (val) => {
  }
});

/** 多选框选中数据 */
const handleSelectionChange = (selection: any[]) => {
  modelValues.value = selection.map(item => item.id)+'';
}


onMounted(() => {
  //获取所有的项目
  getAllUsers();
  //获取所有的部门信息
  getAllDepts();
});
//获取所有的销售订单信息
const getAllUsers = async () => {
  let res =  await selectAll();
  userList.value = res.data;
}

/**
 * 关闭标签
 */
const handleClose = () =>{
  modelValues.value = "";
}

/**
 * 根据id查询用户名称
 * @param id
 */
const getSysUserName = (id: string) => {
  let actions: any[] = [];
  let datas = userList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].userId == ('' + id)) {
      actions.push(datas[key].nickName);
      return true;
    }
  })
  return actions.join('');
}
const cancel=()=>{
  dialog.visible = false;
  modelValues.value = "";
}

/** 查询用户列表 */
const getUserList=async () => {
  loading.value = true;
  if(isManagerVal.value){
    queryParams.value.isManager =true;
  }
  if(fieldLimitDeptVal.value){
    queryParams.value.deptIds =fieldLimitDeptVal.value;
  }

  filterListUser(queryParams.value).then(response => {
     userTableList.value = response.rows;
     userTotal.value = response.total;
    //this.toggleSelection(this.checkedUsers);
  }).finally(() => loading.value = false);
}

/** 通过条件过滤节点  */
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
// 节点单击事件
const handleNodeClick= (data :any) => {
  if( data.id == 0){
    queryParams.value.deptId ="";
  }else {
    queryParams.value.deptId = data.id;
  }
  getUserList();
}
/**
 * 查询部门下拉树结构
 */
const getDeptOptions = async()=> {
  if (!deptOptions.value || deptOptions.value.length <= 0) {
   loadingTreeData.value = true;
     deptOptions.value = [];
     const data= { id: 0, label: '顶级节点', children: [] };
    await deptTreeSelect().then(response => {
      data.children = response.data;
      deptOptions.value.push(data);
      getLevelOneFirstAndLevelTwoFirstIds(response.data);
    }).finally(() => loadingTreeData.value = false);
  }
}
//打开dialog
const handleOpen =() =>{
  getDeptOptions();
  getUserList();
  dialog.visible = true;
}

const handleUserComplete =() =>{
  dialog.visible = false;

}
//部门tree
const departTree = ref<ElTreeInstance>();
/** 根据名称筛选部门树 */
watchEffect(
  () => { departTree.value?.filter(deptName.value); },
  {
    flush: 'post' // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);

const deptList = ref<DeptVO[]>([]);
const getAllDepts = async () => {
  let res =  await listDept();
  deptList.value = res.data;
}
const getDeptName = (deptId:any ) => {
  if(!deptId){
    return "";
  }
  let actions: any[] = [];
  let datas = deptList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].deptId == ('' + deptId)) {
      actions.push(datas[key].deptName);
      return true;
    }
  })
  return actions.join(',');
}


const getLevelOneFirstAndLevelTwoFirstIds = (deptTreeData: any) =>{
  deptDefaultExpandedKeys.value = [];
  deptDefaultExpandedKeys.value.push(0);
  if(deptTreeData && deptTreeData.length > 0) {
    deptDefaultExpandedKeys.value.push(deptTreeData[0].id);
    if(deptTreeData[0].children) {
      deptDefaultExpandedKeys.value.push(deptTreeData[0].children[0].id);
    }
  }
}
</script>

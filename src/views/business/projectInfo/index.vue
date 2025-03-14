<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入项目名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="项目编号" prop="projectNo">
            <el-input v-model="queryParams.projectNo" placeholder="请输入项目编号" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="type">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option key="0" label="待执行" value="0" />
              <el-option key="1" label="执行中" value="1" />
              <el-option key="3" label="暂缓" value="3" />
              <el-option key="2" label="已完成" value="2" />
              <el-option key="4" label="已终止" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="项目类型" prop="type">
            <el-select v-model="queryParams.type" placeholder="请选择项目类型" clearable>
              <el-option v-for="dict in project_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="采购单位" prop="purchaseUnit">
            <el-input v-model="queryParams.purchaseUnit" placeholder="请输入采购单位" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="业主单位" prop="ownerUnit">
            <el-input v-model="queryParams.ownerUnit" placeholder="请输入业主单位" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="时间" style="width: 308px">
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['business:projectInfo:add']">新增</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" v-model:columns="columns"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="projectInfoList" @selection-change="handleSelectionChange">
        <el-table-column label="序号" width="50px" align="center" type="index" />
        <el-table-column label="主键" align="center" prop="id" v-if="false" />
        <el-table-column label="项目编号" align="center" prop="projectNo" width="150px" v-if="columns[0].visible" />
        <el-table-column label="项目类型" align="center" prop="type" width="80px" v-if="columns[1].visible">
          <template #default="scope">
            <dict-tag :options="project_type" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="项目名称" align="center" prop="name" width="200px" v-if="columns[2].visible"  show-overflow-tooltip />
        <el-table-column label="DC总容量(MWp)" align="center" prop="dc" width="140px" v-if="columns[3].visible" />
        <el-table-column label="客户类型" align="center" prop="customerType" width="100px" v-if="columns[4].visible">
          <template #default="scope">
            <dict-tag :options="customer_type" :value="scope.row.customerType" />
          </template>
        </el-table-column>
        <el-table-column label="采购单位" align="center" prop="purchaseUnit" width="120px" :show-overflow-tooltip="true" v-if="columns[5].visible" />
        <el-table-column label="业主单位" align="center" prop="ownerUnit" width="120px" :show-overflow-tooltip="true" v-if="columns[6].visible" />
        <el-table-column label="项目地点" align="center" prop="location" width="120px" :show-overflow-tooltip="true" v-if="columns[7].visible" />
        <el-table-column label="联系人" align="center" prop="contactPerson" width="120px" v-if="columns[8].visible" />
        <el-table-column label="联系电话" align="center" prop="contactPhone" width="120px" v-if="columns[9].visible" />
        <el-table-column label="邮箱" align="center" prop="contactEmail" width="120px" v-if="columns[10].visible" />
        <el-table-column label="支架类型" align="center" prop="supportType" width="100px" v-if="columns[11].visible">
          <template #default="scope">
            <dict-tag :options="support_type" :value="scope.row.supportType" />
          </template>
        </el-table-column>
        <el-table-column label="开始日期" align="center" prop="startTime" width="100px" v-if="columns[12].visible">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预计结束日期" align="center" prop="endTime" width="120px" v-if="columns[13].visible">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目负责人" align="center" prop="manager" width="140px" v-if="columns[14].visible">
          <template #default="scope">
            <span>{{ getSysUserName(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" v-if="columns[15].visible">
          <template #default="scope">
            <span v-if="scope.row.status == 0">待执行</span>
            <span v-if="scope.row.status == 1">执行中</span>
            <span v-if="scope.row.status == 2">已完成</span>
            <span v-if="scope.row.status == 3">暂缓</span>
            <span v-if="scope.row.status == 4">已终止</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="120px" v-if="columns[16].visible">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="120px" v-if="columns[17].visible">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120px">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-if="isAdmin()||handlePermission(scope.row)  "></el-button>
            </el-tooltip>
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" icon="View" @click="toDetail(scope.row)" v-hasPermi="['business:projectInfo:detail']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改项目信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <el-scrollbar style="height:800px;">
        <el-form ref="projectInfoFormRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="项目类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择项目类型">
              <el-option v-for="dict in project_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目编号" prop="projectNo">
            <el-input v-model="form.projectNo" placeholder="请输入项目编号" />
          </el-form-item>
          <el-form-item label="采购单位" prop="purchaseUnit">
            <el-input v-model="form.purchaseUnit" placeholder="请输入采购单位" />
          </el-form-item>
          <el-form-item label="客户类型" prop="customerType">
            <el-select v-model="form.customerType" placeholder="请选择客户类型">
              <el-option v-for="dict in customer_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="业主单位" prop="ownerUnit">
            <el-input v-model="form.ownerUnit" placeholder="请输入业主单位" />
          </el-form-item>
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="项目地点" prop="location">
            <el-input v-model="form.location" placeholder="请输入项目地点" />
          </el-form-item>
          <el-form-item label="联系人" prop="contactPerson">
            <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
          </el-form-item>
          <el-form-item label="电话" prop="contactPhone">
            <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="邮箱" prop="contactEmail">
            <el-input v-model="form.contactEmail" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="其它" prop="other">
            <el-input v-model="form.other" type="textarea" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="支架类型" prop="supportType">
            <el-select v-model="form.supportType" placeholder="请选择支架类型">
              <el-option v-for="dict in support_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="DC总容量" prop="dc">
            <el-input v-model="form.dc" placeholder="请输入DC总容量">
              <template #append>MWp</template>
            </el-input>
          </el-form-item>
          <el-form-item label="开始日期" prop="startTime">
            <el-date-picker clearable v-model="form.startTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择开始日期"> </el-date-picker>
          </el-form-item>
          <el-form-item label="预计结束日期" prop="endTime">
            <el-date-picker clearable v-model="form.endTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择预计结束日期"> </el-date-picker>
          </el-form-item>
          <el-form-item label="项目负责人" prop="manager">
            <el-select v-model="form.manager" filterable placeholder="请选择">
              <el-option v-for="item in userList" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目内容描述" prop="description">
            <editor v-model="form.description" :height="200" />
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态">
              <el-option key="0" label="待执行" :value="0" />
              <el-option key="1" label="执行中" :value="1" />
              <el-option key="3" label="暂缓" :value="3" />
              <el-option key="2" label="已完成" :value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="文件" prop="relaFileInfo">
            <file-upload v-model="form.relaFileInfo" :file-size="50" :fileType='["docx","doc", "xls", "ppt", "txt", "pdf","xlsx"]' />
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ProjectInfo" lang="ts">
import { isAdmin } from '@/utils/permission';
import { listProjectInfo, getProjectInfo, delProjectInfo, addProjectInfo, updateProjectInfo } from '@/api/business/projectInfo';
import { ProjectInfoVO, ProjectInfoQuery, ProjectInfoForm } from '@/api/business/projectInfo/types';
//查询所有的用户信息
import { selectAll } from '@/api/system/user';
import { UserVO } from "@/api/system/user/types";
import useUserStore from '@/store/modules/user';
import { useRouter } from "vue-router";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { customer_type, support_type, project_type } = toRefs<any>(proxy?.useDict('customer_type', 'support_type', 'project_type'));

const projectInfoList = ref<ProjectInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const projectInfoFormRef = ref<ElFormInstance>();

//用户列表
const userList = ref<UserVO[]>([]);

//const columns =ref([{"label":'项目编号'},{"label":'项目类型'},{"label":'项目名称'}]);

const columns = ref<FieldOption[]>([
  { key: 0, label: `项目编号`, visible: true,children: [] },
  { key: 1, label: `项目类型`, visible: true,children: [] },
  { key: 2, label: `项目名称`, visible: true,children: [] },
  { key: 3, label: `DC总容量`, visible: true,children: [] },
  { key: 4, label: `客户类型`, visible: false,children: [] },
  { key: 5, label: `采购单位`, visible: false,children: [] },
  { key: 6, label: `业主单位`, visible: false,children: [] },
  { key: 7, label: `项目地点`, visible: true,children: [] },
  { key: 8, label: `联系人`, visible: false,children: [] },
  { key: 9, label: `联系电话`, visible: false,children: [] },
  { key: 10, label: `邮箱`, visible: false,children: [] },
  { key: 11, label: `支架类型`, visible: true,children: [] },
  { key: 12, label: `开始日期`, visible: true,children: [] },
  { key: 13, label: `预计结束日期`, visible: true,children: [] },
  { key: 14, label: `项目负责人`, visible: true,children: [] },
  { key: 15, label: `状态`, visible: true,children: [] },
  { key: 16, label: `创建时间`, visible: false,children: [] },
  { key: 17, label: `更新时间`, visible: false,children: [] },
])
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProjectInfoForm = {
  id: undefined,
  projectNo: undefined,
  type: undefined,
  name: undefined,
  dc: undefined,
  customerType: undefined,
  purchaseUnit: undefined,
  ownerUnit: undefined,
  location: undefined,
  contactPerson: undefined,
  contactPhone: undefined,
  contactEmail: undefined,
  other: undefined,
  supportType: undefined,
  startTime: undefined,
  endTime: undefined,
  manager: undefined,
  description: undefined,
  status: undefined,
}
const data = reactive<PageData<ProjectInfoForm, ProjectInfoQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectNo: undefined,
    type: undefined,
    name: undefined,
    purchaseUnit: undefined,
    ownerUnit: undefined,
    params: {
      createTime: undefined,
    }
  },
  rules: {
    id: [
      { required: true, message: "主键不能为空", trigger: "blur" }
    ],
    projectNo: [
      { required: true, message: "项目编号不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "类型不能为空", trigger: "change" }
    ],
    name: [
      { required: true, message: "项目名称不能为空", trigger: "blur" }
    ],
    customerType: [
      { required: true, message: "客户类型不能为空", trigger: "change" }
    ],
    contactPerson: [
      { required: true, message: "联系人不能为空", trigger: "blur" }
    ],
    contactPhone: [
      { required: true, message: "联系电话不能为空", trigger: "blur" }
    ],
    contactEmail: [
      { required: true, message: "邮箱不能为空", trigger: "blur" }
    ],
    supportType: [
      { required: true, message: "支架类型不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ], //;0:待执行 1:执行中 2:已完成
    purchaseUnit: [
      { required: true, message: "采购单位不能为空", trigger: "blur" }
    ],
    dc: [
      { required: true, message: "DC总容量不能为空", trigger: "blur" }
    ],
    startTime: [
      { required: true, message: "开始日期不能为空", trigger: "change" }
    ],
    manager:  [
      { required: true, message: "项目负责人不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目信息列表 */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime');
  const res = await listProjectInfo(queryParams.value);
  projectInfoList.value = res.rows;
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
  projectInfoFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: ProjectInfoVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
const userStore = useUserStore();
/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  //设置当前用户为默认的项目负责人
  form.value.manager = userStore.userId;
  form.value.status = 0;
  dialog.visible = true;
  dialog.title = "添加项目信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ProjectInfoVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getProjectInfo(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改项目信息";
}

/** 提交按钮 */
const submitForm = () => {
  projectInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateProjectInfo(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProjectInfo(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ProjectInfoVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除项目信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delProjectInfo(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('business/projectInfo/export', {
    ...queryParams.value
  }, `projectInfo_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
  //获取所有的用户信息
  getAllUsers();
});

//获取所有的用户信息
const getAllUsers = async () => {
  let res =  await selectAll();
  userList.value = res.data;
}

const getSysUserName = (row?: ProjectInfoVO) => {
  let actions: any[] = [];
  let datas = userList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].userId == ('' + row.manager)) {
      actions.push(datas[key].nickName);
      return true;
    }
  })
  return actions.join('');
}
//路由限制
const router = useRouter();
const toDetail = (row?: ProjectInfoVO) => {
  router.push({path: '/business/projectInfo/detail', query: { projectId: row?.id}});
}


/** 权限验证 */
const handlePermission =  (row?: ProjectInfoVO) => {
    const manager =  row.manager;
    const createBy = row.createBy;
    if(userStore.userId == manager || userStore.userId == createBy){
      return true;
    }else{
      return false;
    }
}
</script>

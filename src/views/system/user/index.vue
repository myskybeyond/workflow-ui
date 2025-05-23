<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="4" :xs="24" style="">
        <el-card shadow="hover">
          <el-input v-model="deptName" placeholder="请输入部门名称" prefix-icon="Search" clearable />
          <el-tree
            class="mt-2"
            ref="deptTreeRef"
            node-key="id"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div class="mb-[10px]" v-show="showSearch">
            <el-card shadow="hover">
              <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="68px">
                <el-form-item label="用户名称" prop="userName">
                  <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="手机号码" prop="phonenumber">
                  <el-input
                    v-model="queryParams.phonenumber"
                    placeholder="请输入手机号码"
                    clearable
                    style="width: 240px"
                    @keyup.enter="handleQuery"
                  />
                </el-form-item>

                <el-form-item label="状态" prop="status">
                  <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 240px">
                    <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="创建时间" style="width: 308px;">
                  <el-date-picker
                    v-model="dateRange"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleQuery" icon="Search">搜索</el-button>
                  <el-button @click="resetQuery" icon="Refresh">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </transition>

        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button type="primary" plain @click="handleAdd()" v-has-permi="['system:user:add']" icon="Plus">新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" plain @click="handleUpdate()" :disabled="single" v-has-permi="['system:user:add']" icon="Edit">
                  修改
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" plain @click="handleDelete()" :disabled="multiple" v-has-permi="['system:user:delete']" icon="Delete">
                  删除
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-dropdown class="mt-[1px]">
                  <el-button plain type="info">
                    更多
                    <el-icon class="el-icon--right"><arrow-down /></el-icon
                  ></el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="importTemplate" icon="Download">下载模板</el-dropdown-item>
                      <el-dropdown-item @click="handleImport" icon="Top"> 导入数据</el-dropdown-item>
                      <el-dropdown-item @click="handleExport" icon="Download"> 导出数据</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns" :search="true"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="用户编号" align="center" key="userId" prop="userId" v-if="columns[0].visible" />
            <el-table-column label="用户名称" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
            <el-table-column label="用户姓名" align="center" key="nickName" prop="nickName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
            <el-table-column
              label="部门"
              align="center"
              key="deptName"
              prop="deptName"
              v-if="columns[3].visible"
              :show-overflow-tooltip="true"
            />
            <el-table-column label="手机号码" align="center" key="phonenumber" prop="phonenumber" v-if="columns[4].visible" width="120" />
            <el-table-column label="状态" align="center" key="status" v-if="columns[5].visible">
              <template #default="scope">
                <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
              </template>
            </el-table-column>

            <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[6].visible" width="160">
              <template #default="scope">
                <span>{{ scope.row.createTime }}</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" fixed="right" width="180" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-tooltip content="修改" placement="top" v-if="scope.row.userId !== 1">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top" v-if="scope.row.userId !== 1">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"></el-button>
                </el-tooltip>

                <el-tooltip content="重置密码" placement="top" v-if="scope.row.userId !== 1">
                  <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"></el-button>
                </el-tooltip>

                <el-tooltip content="分配角色" placement="top" v-if="scope.row.userId !== 1">
                  <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                </el-tooltip>

                <el-tooltip content="第三方账号" placement="top" v-if="scope.row.userId !== 1">
                  <el-button link type="primary" @click="handleNavigate(scope.row)" v-hasPermi="['system:user:edit']">
                    <svg-icon icon-class="thirdAccount" />
                  </el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog ref="formDialogRef" :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body @close="closeDialog">
      <el-form :model="form" :rules="rules" ref="userFormRef" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户姓名" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户姓名" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="form.deptIds"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                :render-after-expand="false"
                placeholder="请选择归属部门"
                check-strictly
                multiple
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{
                  dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == '1'"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == '1'"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel()">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload">
          <i-ep-upload-filled />
        </el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="text-center el-upload__tip">
            <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据</div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User" lang="ts">
import api from "@/api/system/user"
import { UserForm, UserQuery, UserVO } from '@/api/system/user/types';
import { treeselect } from "@/api/system/dept";
import { DeptVO } from "@/api/system/dept/types";
import { RoleVO } from "@/api/system/role/types";
import { PostVO } from "@/api/system/post/types";
import { to } from "await-to-js";
import { globalHeaders } from "@/utils/request";
import { passwordValidator, validatePassword } from "@/utils/validate";
//todo 下周来了就得查所有涉及部门名称展示的页面都有哪些 可以从接口里反查
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sys_normal_disable, sys_user_sex } = toRefs<any>(proxy?.useDict('sys_normal_disable', 'sys_user_sex'));

const userList = ref<UserVO[]>();
const loading = ref(true);
const showSearch = ref(true)
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const deptName = ref('');
const deptOptions = ref<DeptVO[]>([]);
const initPassword = ref<String>('');
const postOptions = ref<PostVO[]>([]);
const roleOptions = ref<RoleVO[]>([]);
/*** 用户导入参数 */
const upload = reactive<ImportOption>({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
})
// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `用户编号`, visible: false,children: [] },
  { key: 1, label: `用户名称`, visible: true,children: [] },
  { key: 2, label: `用户姓名`, visible: true,children: [] },
  { key: 3, label: `部门`, visible: true,children: [] },
  { key: 4, label: `手机号码`, visible: true,children: [] },
  { key: 5, label: `状态`, visible: true,children: [] },
  { key: 6, label: `创建时间`, visible: true,children: [] }
])


const deptTreeRef = ref<ElTreeInstance>();
const queryFormRef = ref<ElFormInstance>();
const userFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();
const formDialogRef = ref<ElDialogInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: UserForm = {
  userId: undefined,
  deptId: undefined,
  userName: '',
  nickName: undefined,
  password: '',
  phonenumber: undefined,
  email: undefined,
  sex: undefined,
  status: "0",
  remark: '',
  postIds: [],
  roleIds: []
}
const data = reactive<PageData<UserForm, UserQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: '',
    phonenumber: '',
    status: '',
    deptId: ''
  },
  rules: {
    userName: [{ required: true, message: "用户名称不能为空", trigger: "blur" }, { min: 2, max: 20, message: "用户名称长度必须介于 2 和 20 之间", trigger: "blur" }],
    nickName: [{ required: true, message: "用户姓名不能为空", trigger: "blur" }],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs<PageData<UserForm, UserQuery>>(data)

/** 通过条件过滤节点  */
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
/** 根据名称筛选部门树 */
watchEffect(
  () => { deptTreeRef.value?.filter(deptName.value); },
  {
    flush: 'post' // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);

/** 查询部门下拉树结构 */
const getTreeSelect = async () => {
  const res = await api.deptTreeSelect();
  deptOptions.value = res.data;
};

/** 查询用户列表 */
const getList = async () => {
  loading.value = true;
  const res = await api.listUser(proxy?.addDateRange(queryParams.value, dateRange.value));
  loading.value = false;
  userList.value = res.rows;
  total.value = res.total;
}

/** 节点单击事件 */
const handleNodeClick = (data: DeptVO) => {
  queryParams.value.deptId = data.id;
  handleQuery()
}


/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
const resetQuery = () => {
  dateRange.value = ['', '']
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  queryParams.value.deptId = undefined;
  deptTreeRef.value?.setCurrentKey(undefined);
  handleQuery();
}

/** 删除按钮操作 */
const handleDelete = async (row?: UserVO) => {
  const userIds = row?.userId || ids.value;
  const [err] = await to(proxy?.$modal.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？') as any);
  if (!err) {
    await api.delUser(userIds);
    await getList();
    proxy?.$modal.msgSuccess("删除成功");
  }
}

/** 用户状态修改  */
const handleStatusChange = async (row: UserVO) => {
  let text = row.status === "0" ? "启用" : "停用"
  try {
    await proxy?.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗?');
    await api.changeUserStatus(row.userId, row.status);
    proxy?.$modal.msgSuccess(text + "成功");
  } catch (err) {
    row.status = row.status === "0" ? "1" : "0";
  }
}
/** 跳转角色分配 */
const handleAuthRole = (row: UserVO) => {
  const userId = row.userId;
  router.push("/system/user-auth/role/" + userId);
}

/** 重置密码按钮操作 */
const handleResetPwd = async (row: UserVO) => {
  const defaultPass = initPassword.value;
  const [err, res] = await to(ElMessageBox.prompt('请输入"' + row.userName + '"的新密码', "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputValidator: passwordValidator,
    inputValue: defaultPass
  }))
  if (!err) {
    await api.resetUserPwd(row.userId, res.value);
    proxy?.$modal.msgSuccess("修改成功，新密码是：" + res.value);
  }
}

/** 选择条数  */
const handleSelectionChange = (selection: UserVO[]) => {
  ids.value = selection.map((item) => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 导入按钮操作 */
const handleImport = () => {
  upload.title = "用户导入";
  upload.open = true;
}
/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download("system/user/export", {
    ...queryParams.value,
  }, `user_${new Date().getTime()}.xlsx`);
};
/** 下载模板操作 */
const importTemplate = () => {
  proxy?.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
}

/**文件上传中处理 */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
}
/** 文件上传成功处理 */
const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
}

/** 提交上传文件 */
function submitFileForm() {
  uploadRef.value?.submit();
}

/** 初始化部门数据 */
const initTreeData = async () => {
  // 判断部门的数据是否存在，存在不获取，不存在则获取
  if (deptOptions.value === undefined) {
    const { data } = await treeselect();
    deptOptions.value = data;
  }
}


/** 重置操作表单 */
const reset = () => {
  form.value = { ...initFormData };
  userFormRef.value?.resetFields();
}
/** 取消按钮 */
const cancel = () => {
  dialog.visible = false;
  reset();
}

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  const { data } = await api.getUser();
  dialog.visible = true;
  dialog.title = "新增用户";
  await initTreeData();
  postOptions.value = data.posts;
  roleOptions.value = data.roles;
  form.value.password = initPassword.value.toString();
}
/** 修改按钮操作 */
const handleUpdate = async (row?: UserForm) => {
  reset();
  const userId = row?.userId || ids.value[0]
  const { data } = await api.getUser(userId)
  dialog.visible = true;
  dialog.title = "修改用户";
  await initTreeData();
  Object.assign(form.value, data.user);
  postOptions.value = data.posts;
  roleOptions.value = data.roles;
  form.value.postIds = data.postIds;
  form.value.deptIds = data.deptIds;
  form.value.roleIds = data.roleIds;
  form.value.password = "";
}

/** 提交按钮 */
const submitForm = () => {
  userFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.userId ? await api.updateUser(form.value) : await api.addUser(form.value);
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  })
}


/**
 * 关闭用户弹窗
 */
const closeDialog = () => {
  dialog.visible = false;
  resetForm();
}

/**
 * 重置表单
 */
const resetForm = () => {
  userFormRef.value?.resetFields();
  userFormRef.value?.clearValidate();

  form.value.id = undefined;
  form.value.status = '1';
};
/**
 * 跳转到应用管理->应用用户管理
 */
const handleNavigate = (row: UserVO)=> {
  const _userName = row?.userName;
  proxy?.$router.push({ path: '/SocialInfo', query: {userName: _userName}})
};
onMounted(() => {
  getTreeSelect() // 初始化部门数据
  getList() // 初始化列表数据
  proxy?.getConfigKey("sys.user.initPassword").then(response => {
    initPassword.value = response.data;
  });
});
</script>

<style lang="scss" scoped></style>

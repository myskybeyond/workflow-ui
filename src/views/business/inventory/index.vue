<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="组织名称" prop="OrgCode">
            <el-select v-model="queryParams.OrgCode" placeholder="请选择组织名称" clearable style="width: 240px">
              <el-option v-for="dict in yongyou_org" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="销售订单编码" prop="ProNo" label-width="100px">
            <el-input v-model="queryParams.ProNo" placeholder="请输入销售订单编码" clearable style="width: 240px" />
          </el-form-item>
          <el-form-item label="销售订单名称" prop="ProName" label-width="100px">
            <el-input v-model="queryParams.ProName" placeholder="请输入销售订单名称" clearable style="width: 240px" />
          </el-form-item>
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
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="inventoryList">
        <el-table-column label="序号" type="index" width="50px" />
        <el-table-column label="料号" align="center" prop="partNo" />
        <el-table-column label="品名" align="center" prop="pname" />
        <el-table-column label="规格" align="center" prop="spec" />
        <el-table-column label="材质" align="center" prop="material" />
        <el-table-column label="长度" align="center" prop="length" />
        <el-table-column label="存储地点" align="center" prop="stoLocation" />
        <el-table-column label="库存单位名称" align="center" prop="unitName" />
        <el-table-column label="数量" align="center" prop="num" />
        <el-table-column label="其它项目库存可用量" align="center" prop="otherNum">
          <template v-slot="scope">
            <el-link type="primary" @click="handleOtherDetail(scope.row)">{{scope.row.otherNum}}</el-link>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加或修改消息历史记录信息对话框 -->
    <el-dialog title="其它项目库存列表" v-model="dialog.visible" width="900px" append-to-body>
      <el-table v-loading="loading" :data="otherInventoryList">
        <el-table-column label="序号" type="index" width="50px" />
        <el-table-column label="销售订单编码" align="center" prop="proNo" width="120px" />
        <el-table-column label="销售订单名称" align="center" prop="proName" width="150px" />
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
</template>

<script setup name="InventoryInfo" lang="ts">
import { listInventory , listOtherInventory} from '@/api/business/inventory';
import { InventoryVO, InventoryQuery } from '@/api/business/inventory/types';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const {  yongyou_org } = toRefs<any>(proxy?.useDict( 'yongyou_org'));
const inventoryList = ref<InventoryVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();

const otherInventoryList = ref([]);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
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


const getList = async () => {
  loading.value = true;
  const res = await listInventory(queryParams.value);
  inventoryList.value = res.rows;
  total.value = res.total;
  loading.value = false;
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

onMounted(() => {
  getList();
});

/** 修改按钮操作 */
const handleOtherDetail= async (row?: InventoryVO) => {
  otherInventoryList.value = [];
  const _partNo = row?.partNo ;
  let query ={"PartNo": _partNo,"ProNo":"HD001"};
  const res = await listOtherInventory(query);
  otherInventoryList.value  =res.data;
  dialog.visible = true;
}

const cancel = () => {

  dialog.visible = false;
}
</script>

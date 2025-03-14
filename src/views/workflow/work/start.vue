<template>
  <div class="app-container">
    <el-card class="box-card" v-loading="loading">
      <template #header>
        <span class="clearfix">发起流程</span>
      </template>
      <el-row>
        <el-col :span="18" :offset="3">
          <div class="form-conf" v-if="formOpen">
            <form-render :form-conf="formData" ref="formRenderRef" />
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="18" :offset="3">
          <div class="form-copy-setting">
            <b class="form-copy-setting_label">抄送人</b>
            <el-tag
              style="margin: 0 5px;"
              :key="index"
              v-for="(item, index) in copyUser"
              closable
              :disable-transitions="false"
              @close="handleClose(item)"
            >
              {{ item.nickName }}
            </el-tag>
            <el-button class="button-new-tag" type="primary" icon="Plus" size="small" circle @click="onSelectCopyUsers" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="10" justify="center">
        <el-col :span="1.5">
          <el-button icon="CircleCheck" type="primary" @click="submit">提交</el-button>
        </el-col>
      </el-row>
    </el-card>
    <select-dept-user
      ref="showSelectedTableRef"
      title="添加抄送人"
      key="添加抄送人"
      :show-user-panel="userData.open"
      user-data-type="copy"
      :checked-users="userMultipleSelection"
      @selectedUserIds="selectedUserIds"
      @openOrClose="openOrClose"
    />
  </div>
</template>

<script lang="ts" setup>
import { getProcessForm, startProcessByDefKey } from "@/api/workflow/work/process";
import { useRoute } from "vue-router";
import FormRender from "@/views/workflow/form/form-render.vue";
import SelectDeptUser from "@/views/workflow/components/selectDeptUser.vue";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

const formOpen = ref(false);
const definitionId = route.query.definitionId;
const deployId = route.params.deployId;
const procInsId = route.query.procInsId;
const definitionKey = route.query.definitionKey;
const formData = ref({});
const loading = ref(true);
const copyUser = ref([]);
const userData = ref({
  title: "",
  type: "",
  open: false
});
const userMultipleSelection = ref([]);
const copyUserIds = ref();
const formRenderRef = ref<InstanceType<typeof FormRender>>();

const initData = async () => {
  loading.value = true;
  const res = await getProcessForm({
    definitionId: definitionId,
    deployId: deployId,
    procInsId: procInsId,
    definitionKey: definitionKey
  });
  formData.value = res.data;
  formOpen.value = true;
  loading.value = false;
};

const submit = async () => {
  try {
    loading.value = true;
    await formRenderRef.value?.validateForm();
    const data = formRenderRef.value?.getFormValue();
    if (data && definitionKey) {
      // 启动流程并将表单数据加入流程变量
      await startProcessByDefKey(definitionKey, { variables: data, copyUserIds: copyUserIds.value }).then(res => {
        loading.value = false;
        proxy?.$modal.msgSuccess(res.msg);
        proxy?.$tab.closeOpenPage({
          path: "/work/own"
        });
      });
    }
  } catch (error) {
    loading.value = false;
  }
};
const openOrClose = (val) => {
  userData.value.open = val;
};
const selectedUserIds = (val1, val2) => {
  userMultipleSelection.value = val2;
  if (val2) {
    let userIds = val2.map(k => k.userId);
    // 设置抄送人ID信息
    copyUser.value = val2;
    copyUserIds.value = userIds instanceof Array ? userIds.join(",") : userIds;
    userData.value.open = false;
  }
};
// 关闭标签
const handleClose = (tag) => {
  let userObj = userMultipleSelection.value.find(item => item.userId === tag.id);
  userMultipleSelection.value.splice(userMultipleSelection.value.indexOf(userObj), 1);
  copyUser.value = userMultipleSelection.value;
  // 设置抄送人ID
  if (copyUser && copyUser.value.length > 0) {
    const val = copyUser.value.map(item => item.id);
    copyUserIds.value = val instanceof Array ? val.join(",") : val;
  } else {
    copyUserIds.value = "";
  }
};
const onSelectCopyUsers = () => {
  userMultipleSelection.value = copyUser.value;
  userData.value.open = true;
};
onMounted(() => {
  initData();
});

onActivated(() => {
  // 调用时机为首次挂载
  // 以及每次从缓存中被重新插入时
});
</script>

<style lang="scss" scoped>
.form-conf {
  margin: 5px auto;
  width: 80%;
  padding: 0 15px;
}

.form-copy-setting {
  margin: 0 auto;
  width: 80%;
  padding-left: 90px;
  &_label {
    padding-right: 10px;
  }
}
</style>

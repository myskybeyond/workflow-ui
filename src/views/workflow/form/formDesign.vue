<template>
  <div id="app" class="p-2">
    <fc-designer ref="designerRef" :style="{ height: dynamicHeight + 'px' }">
      <template #handle>
        <el-button plain round size="small" type="primary" @click="saveForm()">保存表单</el-button>
      </template>
    </fc-designer>
  </div>
</template>

<script setup name="formDesign" lang="ts">
import { updateForm, getForm } from "@/api/workflow/form";
import { DesignFormForm } from "@/api/workflow/form/types";
import { useRoute } from "vue-router";
import FcDesigner from "@form-create/designer";
import {  UserSelectRule }  from "@/views/workflow/form/components/UserSelect/UserSelectTs"
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const queryParam = route.query.formId;

const parsedDesignData = ref<DesignFormForm>();

const screenWidth = ref(window.innerHeight); // 假设获取屏幕宽度

const dynamicHeight = computed(() => {
  return screenWidth.value - 84;
});


const updateFormObj: DesignFormForm = {
  formId: undefined,
  formName: undefined,
  content: undefined,
  remark: undefined,
  rule: undefined,
  option: undefined
};

const data = reactive<DesignFormForm>({
  ...updateFormObj
});

const designerRef = ref<any>();

const saveForm = async () => {
  const rule = designerRef.value?.getRule();
  const option = designerRef.value?.getOption();
  const formCof = {
    option: option,
    rule: rule
  };
  // console.log('保存到数据库' + JSON.stringify(formCof));
  data.content = JSON.stringify(formCof);
  await updateForm(data);
  proxy?.$modal.msgSuccess("保存成功");
  // 关闭当前标签页并返回上个页面
  proxy?.$tab.closeOpenPage({ path: "/process/form" });
};

const renderDesign = async (_formId?: any) => {
  data.formId = _formId;
  const res = await getForm(_formId);
  Object.assign(data, res.data);
  parsedDesignData.value = JSON.parse(<string>data.content);
  data.rule = parsedDesignData.value?.rule;
  data.option = parsedDesignData.value?.option;

  designerRef.value?.setRule(data.rule)
  designerRef.value?.setOption(data.option)
};

const registerCustomComponent = ()=>{
  //注册人员选择rule
  designerRef.value?.addComponent(UserSelectRule);

}


const addCustomComponent = () => {

  //定义人员选择组件菜单
  const UserSelectButton ={
    icon: UserSelectRule.icon,
    name: UserSelectRule.name,
    label: UserSelectRule.label
  }

  //增加菜单
  designerRef.value?.addMenu({
    title:'业务组件-基础',
    name:'business-Base',
    list:[
      UserSelectButton,
    ]
  });
//增加菜单
  designerRef.value?.addMenu({
    title:'业务组件-在线表单',
    name:'business-onlineForm',
    list:[
    ]
  });


}
onMounted(() => {
  renderDesign(queryParam);
  //注册组件
  registerCustomComponent();
  //创建菜单
  addCustomComponent();
});
</script>
<style scoped>
._fc-designer {
}
:deep(.el-container) {
}
:deep(.el-aside) {
  background: #ffffff;
}
:deep(._fc-l) {
  width: 300px;
}
</style>

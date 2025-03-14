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
//报价组件
import {  QuotationRule }  from "@/views/workflow/form/components/quotation/QuotationTs"
import {  TechOrderRule }  from "@/views/workflow/form/components/techOrder/TechOrderTs"
import {  RefineRule }  from "@/views/workflow/form/components/refine/RefineTs"
import {  ProjectSelectRule }  from "@/views/workflow/form/components/ProjectSelect/ProjectSelectTs"
import {  OrderSelectRule }  from "@/views/workflow/form/components/OrderSelect/OrderSelectTs"
import {  UserSelectRule }  from "@/views/workflow/form/components/UserSelect/UserSelectTs"
import {  BusiFileUploadRule }  from "@/views/workflow/form/components/BusiFileUpload/BusiFileUploadTs"
import {  BusiImageUploadRule }  from "@/views/workflow/form/components/BusiImageUpload/BusiImageUploadTs"
import {  ComOnLineFileRule }  from "@/views/workflow/form/components/ComOnLineFile/ComOnLineFileTs"
import {  DeliverRule }  from "@/views/workflow/form/components/Deliver/DeliverTs"
import {  BomRule }  from "@/views/workflow/form/components/Bom/BomTs"
import {  ExpectedDateRule }  from "@/views/workflow/form/components/ExpectedDate/ExpectedDateTs"
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

const regsterCustomComponent = ()=>{
  //注册报价组件
  designerRef.value?.addComponent(QuotationRule);
  //注册下单组件
  designerRef.value?.addComponent(TechOrderRule);
  //注册细化组件
  designerRef.value?.addComponent(RefineRule);
  //注册项目选择rule
  designerRef.value?.addComponent(ProjectSelectRule);
  //注册销售订单选择rule
  designerRef.value?.addComponent(OrderSelectRule);
  //注册人员选择rule
  designerRef.value?.addComponent(UserSelectRule);
  //注册文件上传rule
  designerRef.value?.addComponent(BusiFileUploadRule);
  //注册图片上传rule
  designerRef.value?.addComponent(BusiImageUploadRule);
  //注册通用在线文件上传组件
  designerRef.value?.addComponent(ComOnLineFileRule);
  //注册发货组件
  designerRef.value?.addComponent(DeliverRule);
  //注册清单组件
  designerRef.value?.addComponent(BomRule);
  //注册期望日期组件
  designerRef.value?.addComponent(ExpectedDateRule);

}


const addCustomComponent = () => {

  //定义报价组件菜单
  const quotationButton ={
    icon: QuotationRule.icon,
    name: QuotationRule.name,
    label: QuotationRule.label
  }
  //定义下单组件菜单
  const techOrderButton ={
    icon: TechOrderRule.icon,
    name: TechOrderRule.name,
    label: TechOrderRule.label
  }
  //定义细化组件菜单
  const refineButton ={
    icon: RefineRule.icon,
    name: RefineRule.name,
    label: RefineRule.label
  }
  //定义项目选择组件菜单
  const ProjectSelectButton ={
    icon: ProjectSelectRule.icon,
    name: ProjectSelectRule.name,
    label: ProjectSelectRule.label
  }
  //定义销售订单选择组件菜单
  const OrderSelectButton ={
    icon: OrderSelectRule.icon,
    name: OrderSelectRule.name,
    label: OrderSelectRule.label
  }
  //定义人员选择组件菜单
  const UserSelectButton ={
    icon: UserSelectRule.icon,
    name: UserSelectRule.name,
    label: UserSelectRule.label
  }
  //定义业务文件上传组件菜单
  const BusiFileUploadButton ={
    icon: BusiFileUploadRule.icon,
    name: BusiFileUploadRule.name,
    label: BusiFileUploadRule.label
  }
  //定义业务图片上传组件菜单
  const BusiImageUploadButton ={
    icon: BusiImageUploadRule.icon,
    name: BusiImageUploadRule.name,
    label: BusiImageUploadRule.label
  }
  //定义通用在线文件上传组件菜单
  const ComOnLineFileRuleButton ={
    icon: ComOnLineFileRule.icon,
    name: ComOnLineFileRule.name,
    label: ComOnLineFileRule.label
  }
  //定义发货菜单
  const DeliverRuleButton ={
    icon: DeliverRule.icon,
    name: DeliverRule.name,
    label: DeliverRule.label
  }

  //定义材料菜单
  const BomRuleButton ={
    icon: BomRule.icon,
    name: BomRule.name,
    label: BomRule.label
  }

  //定义期望日期
  const ExpectedDateButton ={
    icon: ExpectedDateRule.icon,
    name: ExpectedDateRule.name,
    label: ExpectedDateRule.label
  }

  //增加菜单
  designerRef.value?.addMenu({
    title:'业务组件-基础',
    name:'business-Base',
    list:[
      ProjectSelectButton,
      OrderSelectButton,
      UserSelectButton,
      BusiFileUploadButton,
      BusiImageUploadButton,
      ExpectedDateButton
    ]
  });
//增加菜单
  designerRef.value?.addMenu({
    title:'业务组件-在线表单',
    name:'business-onlineForm',
    list:[
      quotationButton,
      techOrderButton,
      refineButton,
      ComOnLineFileRuleButton,
      DeliverRuleButton,
      BomRuleButton
    ]
  });


}
onMounted(() => {
  renderDesign(queryParam);
  //注册组件
  regsterCustomComponent();
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

<template>
  <div id="app" class="p-2">
    <!--    <div class="_fc-t-header">-->
    <!--      <div class="_fc-t-menu">-->
    <!--        <el-button size="small" @click="setJson"> 导入JSON</el-button>-->
    <!--        <el-button size="small" @click="setOption"> 导入Options</el-button>-->
    <!--        <el-button size="small" type="primary" @click="showJson">生成JSON</el-button>-->
    <!--        <el-button size="small" type="success" @click="showOption">生成Options</el-button>-->
    <!--        <el-button size="small" type="danger" @click="showTemplate">生成组件</el-button>-->
    <!--        <el-button size="small" @click="changeLocale">中英切换</el-button>-->
    <!--      </div>-->
    <!--    </div>-->
    <fc-designer ref="designer" height="850px">
      <template #handle>
        <el-button plain round size="small" type="primary" @click="saveForm()">保存表单</el-button>
      </template>
    </fc-designer>
  </div>
</template>

<script setup lang="ts" name="formDesign">
import { updateForm, getForm } from "@/api/workflow/form";
import { DesignFormForm } from "@/api/workflow/form/types";
import { useRoute } from "vue-router";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const queryParam = route.query.formId;

let parsedDesignData = ref<DesignFormForm>();

const updateFormObj: DesignFormForm = {
  formId: undefined,
  formName: undefined,
  content: undefined,
  remark: undefined,
  rule: undefined,
  option: undefined
};

const setJson = () => {
  proxy?.$refs.designer.setRule([{
    "type": "select",
    "field": "leave_type",
    "title": "请假类型",
    "info": "",
    "effect": { "fetch": "" },
    "$required": false,
    "options": [{ "label": "病假", "value": 1 }, { "label": "事假", "value": 2 }],
    "_fc_drag_tag": "select",
    "hidden": false,
    "display": true
  }, {
    "type": "inputNumber",
    "field": "leave_days",
    "title": "请假天数",
    "info": "",
    "$required": false,
    "props": { "min": 0.1, "max": 7, "step": 0.1, "stepStrictly": true },
    "_fc_drag_tag": "inputNumber",
    "hidden": false,
    "display": true
  }, {
    "type": "input",
    "field": "ramark",
    "title": "请假事由",
    "info": "",
    "$required": false,
    "props": { "type": "textarea" },
    "_fc_drag_tag": "input",
    "hidden": false,
    "display": true
  }]);
};

const setOption = () => {
  proxy?.$refs.designer.setOption({
    "form": {
      "labelPosition": "right",
      "size": "small",
      "labelWidth": "125px",
      "hideRequiredAsterisk": false,
      "showMessage": true,
      "inlineMessage": false
    },
    "submitBtn": {
      "show": true,
      "innerText": "提交"
    },
    "resetBtn": {
      "show": true,
      "innerText": "重置"
    }
  });
};

const showJson = () => {

};

const showOption = () => {

};

const saveForm = async () => {
  const rule = proxy?.$refs.designer.getRule();
  const option = proxy?.$refs.designer.getOption();
  const formCof = {
    option: option,
    rule: rule
  };
  // console.log('保存到数据库' + JSON.stringify(formCof));
  updateFormObj.content = JSON.stringify(formCof);
  await updateForm(updateFormObj);
  proxy?.$modal.msgSuccess("保存成功");
  // 关闭当前标签页并返回上个页面
  proxy?.$tab.closeOpenPage({ path: "/process/form" });
};

const renderDesign = async () => {
  const res = await getForm(updateFormObj.formId);
  Object.assign(updateFormObj, res.data);
  parsedDesignData.value = JSON.parse(<string>updateFormObj.content);
  proxy?.$refs.designer.setRule(parsedDesignData.value?.rule);
  proxy?.$refs.designer.setOption(parsedDesignData.value?.option);
};

onMounted(() => {
  updateFormObj.formId = queryParam;
  renderDesign();
});
</script>

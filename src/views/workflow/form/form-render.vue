<template>
  <div class="p-2">
    <FormCreate :rule="rules" :option="options" v-model="formData" v-model:api="fApi"></FormCreate>
  </div>
</template>

<script setup lang="ts">
//导入 form-create
import formCreate from "@form-create/element-ui";
import { ref } from "vue";
import { bool } from "vue-types";
//获取 formCreate 组件
// const FormCreate = formCreate.$form();
const fApi = ref({});
const props = defineProps<{ formConf: {}}>();
const emits = defineEmits(['submit']);

const formData = ref({ "filed1": "222", "filed2": [1], "filed3": 2, "filed4": "16:38:54", "filed6": 3 });
const options = ref({
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
  },
  //表单提交事件
  onSubmit: function(formData: any) {
    alert(JSON.stringify(formData));
  }
});
let rules = ref([]);
const renderForm = (formData: any) => {
  rules.value = formData.rule;
  formData.option.onSubmit = function(formData: any) {
    emits('submit', formData);
  };
  // console.log(formData.option)
  options.value = formData.option;
}
onMounted(() => {
  renderForm(props.formConf);
});
defineExpose({
  childMethod: () => {
    console.log('子组件的方法被调用了');
  },
  validateForm: () => {
    return fApi.value.validate((valid: any) => {
      const _typeValid = typeof valid;
      if(_typeValid === 'boolean') {
        return valid;
      }else {
        return false;
      }
    })
  },
  getFormValue: () => {
    return fApi.value.formData();
  }
});
</script>

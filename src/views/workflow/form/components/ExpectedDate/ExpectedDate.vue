<template>
  <div>
    <el-date-picker v-model="modelValues" type="date" placeholder="请选择日期" :disabled="disabledVal ||  fieldReadonlyVal" />
  </div>
</template>

<script setup lang="ts">

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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
</script>

<style lang="scss" scoped></style>

<template>
  <div>
    <image-upload
      v-model="fileValue"
      :file-size="fileSizeVal"
      :fileType="fileTypeVal"
      :limit="limitVal"
      :disabled="disabledVal ||  fieldReadonlyVal"
    />
  </div>
</template>

<script setup lang="ts">

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
  fileSize:{
    type: Number,
    required: false,
    default: 50
  },
  fileType:{
    type: Array,
    required: false,
    default:  () =>{
      return  ["png", "jpg", "jpeg"];
    }
  },
  limit:{
    type: Number,
    required: false,
    default: 5
  },
  limitCategory:{
    type: String,
    required: false,
    default: ''
  }
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
//声明文件大小值
const fileSizeVal = computed({
  get: () => props.fileSize,
  set: (val) => {
  }
});
//声明文件类型
const fileTypeVal = computed({
  get: () => props.fileType,
  set: (val) => {
  }
});
//声明上传文件数量
const limitVal = computed({
  get: () => props.limit,
  set: (val) => {
  }
});
const limitCategoryVal = computed({
  get: () => props.limitCategory,
  set: (val) => {
  }
});
const fileValue = ref("");
//监测传入的值
watch(fileValue, () => {
  if(fileValue){
    emit('update:modelValue', fileValue.value+",HDCA"+limitCategoryVal.value)
  }
})
onMounted(() => {
  //存在值 初始化信息
  if(modelValues.value){
    init();
  }
});
const init = () => {
  //存在上传文件内容
  //处理尾部数据
  let arr = modelValues.value.split(",");
  let nArr=[];
  for(let i=0;i< arr.length; i++){
    if(!arr[i].includes("HDCA")){
      nArr.push(arr[i]);
    }
  }
  fileValue.value= nArr.join(',');
}
</script>

<style lang="scss" scoped></style>

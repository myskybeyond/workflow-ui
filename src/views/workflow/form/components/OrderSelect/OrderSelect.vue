<template>
  <div>
    <el-select
      v-model="dataForm.id"
      placeholder="请选择销售订单信息"
      clearable
      filterable
      :disabled="disabledVal ||  fieldReadonlyVal"
      @change="valChange"
    >
      <el-option v-for="data in orderInfoList" :key="data.id" :label="data.name" :value="data.id" />
    </el-select>
  </div>
</template>

<script setup lang="ts">

import { myOrderList } from "@/api/business/orderInfo";
import { OrderInfoVO } from "@/api/business/orderInfo/types";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const orderInfoList = ref<OrderInfoVO[]>([]);
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
  status:{
    type: Array,
    required: false,
    default: []
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

//声明整体表单禁用属性
const statusVal = computed({
  get: () => props.status,
  set: (val) => {
  }
});


//dataForm
const dataForm = ref({
  id:"",
  name:""
});

onMounted(() => {
  //获取所有的项目
  getAllOrders();
  //存在值 初始化信息
  if(modelValues.value){
     init();
  }
});


//监测传入的值
// watch(modelValues, () => {
//    init();
// })

//初始化页面方法
const init = () => {
  nextTick(() => {
    const selectedValue = modelValues.value;
    if(selectedValue){
      let params = selectedValue.split(",");
      dataForm.value.id = params[0];
      dataForm.value.name = params[1];
    }
  })
}

//数据变化
const valChange = (val: string) =>{
  //查找name 值
  dataForm.value.id = val;
  dataForm.value.name ="";
  orderInfoList.value.forEach((item) => {
    if (item.id === val) {
      dataForm.value.name = item.name
      return
    }
  })
  modelValues.value = dataForm.value.id+","+dataForm.value.name;
}


//获取所有的销售订单信息
const getAllOrders = async () => {
  let query={};
  if(statusVal.value){
    query ={"statusArr":statusVal.value};
  }
  let res =  await myOrderList(query);
  orderInfoList.value = res.data;
}
</script>

<style lang="scss" scoped></style>

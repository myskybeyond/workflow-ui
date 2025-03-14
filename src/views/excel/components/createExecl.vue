<template>
  <el-dialog v-model="dialogVisValue" @close="closeDialog" width="500" title="新建在线文档">
    <el-form ref="cresteForm" :model="form" label-width="auto">
      <el-form-item prop="fileName" label="文件名称" :rules="{ required: true, trigger: ['blur', 'change'],message: '文件名称不能为空' }">
        <el-input type="text" v-model="form.fileName"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="onSubmit">确认</el-button>
        <el-button @click="dialogVisValue = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import {defineProps, defineEmits} from 'vue';
import {useRouter} from 'vue-router';


const router = useRouter();

const cresteForm = ref<ElFormInstance>();
// 定义子组件发出的事件
const emit = defineEmits(['cClose']);
const props = defineProps({
  dialogVisible: {
    default: true
  }
})
const dialogVis = computed(() => props.dialogVisible);
const dialogVisValue = ref();
watch(dialogVis, (n, o) => {
  dialogVisValue.value = n;
})
const closeDialog = () => {
  form.value = {
    fileName: undefined,
    file: undefined,
    url: undefined
  }
  emit('cClose');
}

const form = ref({
  fileName: undefined,
  file: undefined,
  url: undefined
})
const handleFileChange = (event: Event) => {
  /*const inputElement = event.target as HTMLInputElement;
  if (inputElement.files) {
    console.log('文件', event, inputElement.files[0])
    form.value.file = inputElement.files[0]
    if (!form.value.fileName && inputElement.files[0].name)
      form.value.fileName = inputElement.files[0].name
  }*/
};
const onSubmit = () => {
  cresteForm.value?.validate((valid) => {
    if (valid) {
      router.push({path: '/excel/info', query: {...form.value}})
    } else {
      return false
    }
  })
}
</script>

<style scoped></style>

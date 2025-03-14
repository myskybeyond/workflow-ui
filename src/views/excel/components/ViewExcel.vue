<template>
  <div id="luckysheetInfo"></div>
</template>

<script setup>
import {ref, defineEmits, defineProps} from "vue";
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {getFileInfo} from "@/api/excel";

const route = useRoute();
const excelInitData = ref({})
const loding = ref(false);

const props = defineProps({
  fileId: {default: undefined},
  fileName: {default: undefined},
  version: {default: undefined}
});

const option = ref({
  container: 'luckysheetInfo', //luckysheet is the container id
  showinfobar: false,
  lang: useStorage('language', 'zh_CN').value === 'zh_CN' ? 'zh' : 'en',
  showtoolbarConfig: {print: false},
  data: undefined,
})
onMounted(() => {
  console.log('接收到的参数====', route.query)
  initData(route.query)
  // excelInitData.value.fileId = '1789905555880677377'
  if (excelInitData.value.fileId) {
    loadFile();
  } else if (props.fileId) {
    excelInitData.value = {
      fileId: props.fileId,
      fileName: props.fileName,
      version: props.version
    }
    loadFile()
  }
})
const loadFile = async () => {
  loding.value = true
  await getFileInfo({fileId: excelInitData.value.fileId, version: excelInitData.value.version}).then(res => {
    if (res.data && res.data.name) {
      excelInitData.value.fileName = res.data.name
      excelInitData.value.version = res.data.ver
    }
    if (res.data && res.data.sheetData && res.data.sheetData.length) {
      window.luckysheet.destroy()
      option.value.data = res.data.sheetData
      // eslint-disable-next-line no-undef
      luckysheet.create(option.value)
    }
  }).finally(() => {
    loding.value = false
  })
}

function initData(data) {
  if (data) {
    excelInitData.value = {
      fileId: data.id,
      fileName: data.name,
      version: data.version
    }
  }
}
</script>

<style scoped>
#luckysheetInfo {
  margin: 0px;
  padding: 0px;
  position: absolute;
  width: 100%;
  left: 0px;
  top: 0px;
  bottom: 0px;
}
</style>

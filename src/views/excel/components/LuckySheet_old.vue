<template>
  <div>
    <div style="position: absolute; top: 0">
      <input id="uploadBtn" type="file" @change="loadExcel"/>

      <span>Or Load remote xlsx file:</span>

      <el-button @click="test" v-loading.fullscreen.lock="loding">测试按钮2</el-button>
      <el-button @click="showCreateExcel" v-loading.fullscreen.lock="loding">新建文档</el-button>
      <el-button @click="saveSheet(1)" v-loading.fullscreen.lock="loding">保存</el-button>
      <el-button @click="saveSheet(2)" v-loading.fullscreen.lock="loding">发布</el-button>
      <el-button @click="undoFun">撤销</el-button>
      <el-button @click="moreDraw.visible = true">修订记录</el-button>
      <el-button @click="testFun">测试按钮</el-button>
    </div>
    <div id="luckysheet"></div>
    <div v-show="isMaskShow" id="tip">Loading...</div>
    <el-dialog v-model="tipDialog.visible" :title="tipDialog.title" width="30%">
      <span>{{ tipDialog.message }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleConfirm(1)">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
    <!--    <el-drawer v-model="arrayList" size="200" title="修订记录">
          <el-table :data="editSheetMap">
            <el-table-column />
          </el-table>
        </el-drawer>-->
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import LuckyExcel from 'luckyexcel'
import {exportSheetExcel} from './myExport.js'
import {exportExcel} from './export.js'
import {getLanguage} from '@/lang';
import {addFile, addString, getString} from "@/api/test";
import useAppStore from "@/store/modules/app";
import {addNew, editFile} from "@/api/excel";


const isMaskShow = ref(false)
const selected = ref('')
const jsonData = ref({})
const loding = ref(false);
const appStore = useAppStore()

const fileName = ref('');
const fileId = ref();
const statusType = ref(-1);//文件状态 0：临时保存 1：保存 2：发布

const moreDraw = ref({
  visible: false,
})

const tipDialog = ref({
  visible: false,
  saveFile: true,
  title: '提示',
  message: '保存对此文件的修改？',
  isRouterSwitch: false,
})

const isEditSheetMap = ref({});//sheet是否修改记录{sheetID:boolen}//用于跳转前提示
const editSheetMap = ref({});//sheet修改记录map {sheetID:[{},{}]}//用于历史记录展示
const editSheetArray = ref([]);//单个sheet修改记录
const lastSheet = ref();

const router = useRouter();

const datas = ref();
const localurl = '//localhost:9999'
/*const allowUndo = ref(false);//允许一次操作
//历史页面配置
const optionHi = ref({
  container: 'luckysheet', //luckysheet is the container id
  showinfobar: false,
  lang: useStorage('language', 'zh_CN').value === 'zh_CN' ? 'zh' : 'en',
  data: undefined,
  showtoolbar: false,
  showstatisticBar: false,
  cellRightClick: false,
  sheetRightClick: false,
  hook: {
    cellUpdateBefore: function (r, c, value) {//todo 禁止修改的效果不是很好 后面再做优化
      if (value.bg && value.bg === '#f6b26b') {
        allowUndo.value = true;
      } else {
        return false;
      }
    },cellUpdated: function (r, c, oldValue, value) {
      console.log('单元格更新1', r, c, value, oldValue)
      console.log('单元格更新2', value.m)

      console.log('单元格更新3', editSheetMap.value)
    }
  }
})*/
const option = ref({
  container: 'luckysheet', //luckysheet is the container id
  showinfobar: false,
  lang: useStorage('language', 'zh_CN').value === 'zh_CN' ? 'zh' : 'en',
  showtoolbarConfig: {print: false},
  /*allowUpdate: true,
  loadUrl:  'http:'+localurl + "/load/66387108081a50013ff9478c",
  loadSheetUrl:  'http:'+localurl + "/loadSheet/66387108081a50013ff9478c",
  updateUrl: "ws://"+localurl + "/ws/" + Math.round(Math.random() * 100) + "/66387108081a50013ff9478c",*/
  cellRightClickConfig: {
    customs: [{
      title: '插入跟踪构件',
      onClick: function (clickEvent, event, params) {
        console.log('function test click', clickEvent, event, params)
      }
    }, {
      title: '插入固定构件',
      onClick: function (clickEvent, event, params) {
        console.log('function test click', clickEvent, event, params)
      }
    }, {
      title: '插入电气构件',
      onClick: function (clickEvent, event, params) {
        console.log('function test click', clickEvent, event, params)
      }
    }, {
      title: '插入车棚构件',
      onClick: function (clickEvent, event, params) {
        console.log('function test click', clickEvent, event, params)
      }
    },]
  },
  data: undefined,
  hook: {
    cellAllRenderBefore: function (data, sheet, ctx) {
      // console.log('渲染单元格前', data,sheet)
      if (lastSheet.value !== sheet.index) {//表格不相等 切换了表格 判断上个表格是否保存
        if (isEditSheetMap.value[lastSheet.value]) {
          //提示是否保存
          showConfirm(false)
        }
      }
      lastSheet.value = sheet.index;
    },
    /*sheetActivate:function (sheet){
      console.log('激活工作表前',sheet)
    },*/
    updated: function (operate) {
      console.log('更新内容', operate)
      // if (operate.type === 'datachange'||operate.type === 'imageCtrl') {
      isEditSheetMap.value[operate.sheetIndex] = true
      if (!editSheetMap.value[operate.sheetIndex])
        editSheetMap.value[operate.sheetIndex] = [];

      editSheetMap.value[operate.sheetIndex].push({
        'sheetIndex': operate.sheetIndex,
        'type': operate.type,
        'range': operate.range,
        'time': Date.now()
      })
      // editSheetArray.value.push({'sheetIndex': operate.sheetIndex, 'type': operate.type, 'range': operate.range})
      // }
    },
    /*rangePasteBefore: function (range, data) {
      console.log("黏贴前", range, data)
      const regex = /<body(.*?)body>/;
      const match = data.match(regex);
      if (match && match[1]) {
        const bodyContent = match[1];
        const charCount = bodyContent.length;
        console.log(`<body>到</body>中间有${charCount}个字符`);
      } else {
        console.log('没有找到<body>到</body>之间的内容');
      }
      // if (data.length > 10000)
      //   return false;
    },*/
  },
})
const showCreateExcel = () => {
  ElMessageBox.prompt('请输入文件名', 'Tip', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern:
      /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/,
    inputErrorMessage: '无效的文件名',
  })
    .then(({value}) => {
      createExcel(value)
      ElMessage.success(`文件名:${value}`)
    })
    .catch((e) => {
      ElMessage.error(`Input canceled ${e}`)
    })
}
const createExcel = (fileN) => {
  refresEditRecord()
  fileName.value = fileN;
  window.luckysheet.destroy()
  option.value.data = [{
    "name": "Cell",
    "index": "sheet_01",
    "order": 0,
    "status": 1,
    "celldata": [{"r": 0, "c": 0, "v": {"v": 1, "m": "1", "ct": {"fa": "General", "t": "n"}}}]
  }, {"name": "Data2", "index": "sheet_02", "order": 1, "status": 0}, {
    "name": "Picture",
    "index": "sheet_03",
    "order": 2,
    "status": 0
  }]
  // eslint-disable-next-line no-undef
  luckysheet.create(option.value)
}
const loadExcel = (evt) => {
  const files = evt.target.files
  if (files == null || files.length == 0) {
    alert('No files wait for import')
    return
  }

  let name = files[0].name
  let suffixArr = name.split('.'),
    suffix = suffixArr[suffixArr.length - 1]
  if (suffix !== 'xlsx') {
    alert('Currently only supports the import of xlsx files')
    return
  }
  // console.log('语言类型', getLanguage, getLanguage == 'zh_CN' ? 'zh' : 'en', useStorage('language', 'zh_CN').value)
  LuckyExcel.transformExcelToLucky(files[0], function (exportJson, luckysheetfile) {
    if (exportJson.sheets == null || exportJson.sheets.length == 0) {
      alert('Failed to read the content of the excel file, currently does not support xls files!')
      return
    }
    console.log('exportJson==', exportJson.sheets)
    jsonData.value = exportJson
    fileName.value = exportJson.info.name;
    window.luckysheet.destroy()
    option.value.data = exportJson.sheets;
    // option.value.title= exportJson.info.name;
    // option.value.userInfo= exportJson.info.name.creator;
    window.luckysheet.create(option.value)
  })
}
/**
 * 保存sheet
 * @param type 0:临时 1:保存 2：发布
 */
const saveSheet = async (type) => {
  loding.value = true;
  // eslint-disable-next-line no-undef
  const data = luckysheet.getAllSheets()
  // console.log(data[0].data)
  // console.log(data[0].celldata)
  var fileJson = [];
  for (const item in data) {
    var paramsItem = {
      'celldata': item.celldata,
      'config': item.config,
      'images': item.images,
      'name': item.name,
      'order': item.order,
      'status': item.status,
      'index': item.index
    }
    fileJson.push(paramsItem)
  }
  if (fileId.value)
    await editFile({fileJson, type, 'fileName': fileName.value, 'editHistory': editSheetMap}).then(res => {
      // fileId.value = res.data
      if (type !== 0)
        ElMessage.success(type === 1 ? "保存成功" : "发布成功");
      statusType.value = type;
      refresEditRecord()
    }).catch(e => {
      ElMessage.error(e);
    }).finally(loding.value = false)
  else
    await addNew({fileJson, type, 'fileName': fileName.value, 'editHistory': editSheetMap}).then(res => {
      // fileId.value = res.data
      if (type !== 0)
        ElMessage.success(type === 1 ? "保存成功" : "发布成功");
      statusType.value = type;
      refresEditRecord()
    }).catch(e => {
      ElMessage.error(e);
    }).finally(loding.value = false)

}
const selectExcel = (evt) => {
  const value = selected.value
  const name = evt.target.options[evt.target.selectedIndex].innerText

  if (value == '') {
    return
  }
  isMaskShow.value = true

  LuckyExcel.transformExcelToLuckyByUrl(value, name, (exportJson, luckysheetfile) => {
    if (exportJson.sheets == null || exportJson.sheets.length == 0) {
      alert('Failed to read the content of the excel file, currently does not support xls files!')
      return
    }
    console.log('exportJson==', exportJson.sheets)
    jsonData.value = exportJson

    isMaskShow.value = false
    window.luckysheet.destroy()
    option.value.data = exportJson.sheets;
    // option.value.title= exportJson.info.name;
    // option.value.userInfo= exportJson.info.name.creator;
    window.luckysheet.create(option.value)
  })
}
const openMore = () => {

}
const test = async () => {
  /*window.luckysheet.destroy();//下载网络数据
  option.value.data = datas.value;
  const data = await getString()
  console.log("数据类型可能有点问题", JSON.parse(data.msg), datas.value)

  option.value.data = JSON.parse(data.msg);
  // option.value.title= exportJson.info.name;
  // option.value.userInfo= exportJson.info.name.creator;
  window.luckysheet.create(option.value)*/
}
const testFun = () => {
  /*// eslint-disable-next-line no-undef  //todo 更新sheet的方法只有在特定版本中才有 在线引入版本不支持
  console.log('数据内容手动增加内容', jsonData.value.sheets)

  window.luckysheet.updataSheet({'data':jsonData.value.sheets,'success': (res) => {
    console.log('更新sheet返回结果', res)
  }})
  // eslint-disable-next-line no-undef
  luckysheet.refresh()*/
}
const undoFun = () => {
  window.luckysheet.undo()
}
const isCollapse = computed(() => !appStore.sidebar.opened);
watch(isCollapse, () => {
  // eslint-disable-next-line no-undef
  if (option.value.data)
    nextTick(() => {
      setTimeout(() => {
        // eslint-disable-next-line no-undef
        luckysheet.resize()
      }, 250)
    })
})
const testData = ref([]);
const downloadExcel = async () => {//todo 加loding
  loding.value = true;
  //todo 使用保存部分内容的方式保存和还原页面
  console.log(123321)
  // console.log(JSON.stringify(luckysheet.getAllSheets()))
  // eslint-disable-next-line no-undef
  const data = luckysheet.getAllSheets()
  console.log(data[0].data)
  console.log(data[0].celldata)
  testData.value[0] = {
    'data': data[0].data,
    'config': data[0].config,
    'images': data[0].images,
    'name': data[0].name,
    'order': data[0].order,
    'status': data[0].status,
    'index': data[0].index,
  }
  console.log(123321)
  loding.value = false;

  window.luckysheet.destroy()
  option.value.data = testData;
  window.luckysheet.create(option.value)

  /*const value = selected.value;;

  if(value.length==0){
      alert("Please select a demo file");
      return;
  }

  var elemIF = document.getElementById("Lucky-download-frame");
  if(elemIF==null){
      elemIF = document.createElement("iframe");
      elemIF.style.display = "none";
      elemIF.id = "Lucky-download-frame";
      document.body.appendChild(elemIF);
  }
  elemIF.src = value;*/
  // eslint-disable-next-line no-undef
  /*await exportSheetExcel(luckysheet.getAllSheets(), '123321').then(()=>{
    console.log('123321-----1')
    loding.value = false;
  }).catch(()=>{
    console.log('123321-----2')
    loding.value = false;
  })*/
  /*setTimeout(() => {
    // eslint-disable-next-line no-undef
    exportExcel(luckysheet.getAllSheets(), '123321').then(()=>{
     // exportSheetExcel(luckysheet.getAllSheets(), '123321').then(()=>{
      console.log('123321-----1')
      loding.value = false;
    }).catch(()=>{
      console.log('123321-----2')
      loding.value = false;
    })
  }, 2000)*/
  /*setTimeout(async () => {
    // eslint-disable-next-line no-undef
    const worker = new Worker(new URL('./export.js', import.meta.url));
    worker.onmessage = (e) => {
      // 处理从Worker返回的结果
      console.log('Result from worker:', e.data);
      worker.terminate();
    };
    worker.postMessage({ /!* 数据 *!/ });
    console.log('123321-----2')
    loding.value = false;
  }, 2000)*/

  // exportExcel(luckysheet.getAllSheets(), '下载')
  /*// eslint-disable-next-line no-undef
  console.log(luckysheet.getAllSheets())
  datas.value = luckysheet.getAllSheets();
  // option.value.data = undefined;
  console.log('数据222222',datas)
  // const file = convertStringToFile(datas.value, 'output.json')

  // await addFile(file).then(res => {
  // }).catch(er => {
  // })
  // window.luckysheet.destroy()*/
  // eslint-disable-next-line no-undef
  /*LuckyExcel.transformExcelToLuckyByUrl(luckysheet.getAllSheets(), name, (exportJson, luckysheetfile) => {
    if (exportJson.sheets == null || exportJson.sheets.length == 0) {
      alert('Failed to read the content of the excel file, currently does not support xls files!')
      return
    }
    console.log('exportJson==', exportJson.sheets)
    jsonData.value = exportJson

    isMaskShow.value = false
    window.luckysheet.destroy()
    option.value.data= exportJson.sheets;
    // option.value.title= exportJson.info.name;
    // option.value.userInfo= exportJson.info.name.creator;
    window.luckysheet.create(option.value)
  })*/
  // eslint-disable-next-line no-undef

}
const convertStringToFile = (strData, fileName) => {
  const blob = new Blob([JSON.stringify(strData)], {type: 'text/plain;charset=utf-8'}); // 创建一个Blob对象

  // 使用 File 构造函数来创建文件对象
  const file = new File([blob], fileName, {type: 'text/plain;charset=utf-8'});


  const url = window.URL.createObjectURL(blob); // 创建一个指向Blob的URL

  // 创建一个a标签用于下载
  const link = document.createElement('a');
  link.href = url;
  link.download = 'example.txt'; // 设置文件名
  link.style.display = 'none'; // 隐藏a标签
  document.body.appendChild(link); // 将a标签添加到DOM中
  link.click(); // 模拟点击a标签以触发下载
  document.body.removeChild(link); // 下载完成后从DOM中移除a标签
  window.URL.revokeObjectURL(url); // 释放Blob URL占用的内存

  return file;
}
// !!! create luckysheet after mounted
onMounted(() => {
  // eslint-disable-next-line no-undef
  // luckysheet.create(option.value)
})
const nextPath = ref();
// eslint-disable-next-line no-undef
onBeforeRouteLeave((to, from, next) => {
  const route = useRoute();
  console.log('路由路径', route)
  if (tipDialog.value.saveFile && getAllEditState()) {
    showConfirm(true);
    next(false); // 临时阻止导航，等待用户确认
    nextPath.value = to
  } else {
    refresEditRecord()
    window.luckysheet.destroy()
    next();
  }
})
/**
 * 获取所有已修改
 * @returns {boolean}
 */
const getAllEditState = () => {
  for (const item in isEditSheetMap.value) {
    if (isEditSheetMap.value[item])
      return true;
  }
  return false;
}
/**
 * 刷新重置修改记录
 * @type {{}}
 */
const refresEditRecord = () => {
  isEditSheetMap.value = {};
  editSheetMap.value = {};
}
const showConfirm = (isRouterSwitch) => {
  tipDialog.value.visible = true; // 显示弹窗
  tipDialog.value.isRouterSwitch = isRouterSwitch;
}
//提示弹窗 确认
const handleConfirm = (type) => {
  tipDialog.value.saveFile = true
  tipDialog.value.visible = false; // 隐藏弹窗
  saveSheet(type)
}
//提示弹窗 取消
const handleCancel = () => {//todo 导航栏显示刷新有问题
  tipDialog.value.saveFile = false
  tipDialog.value.visible = false; // 隐藏弹窗
  if (tipDialog.value.isRouterSwitch)
    router.push(nextPath.value);
}
//文件保存部分
const showSaveDialog = () => {

}
</script>

<style scoped>
#luckysheet {
  margin: 0px;
  padding: 0px;
  position: absolute;
  width: 100%;
  left: 0px;
  top: 30px;
  bottom: 0px;
}

#uploadBtn {
  font-size: 16px;
}

#tip {
  position: absolute;
  z-index: 1000000;
  left: 0px;
  top: 0px;
  bottom: 0px;
  right: 0px;
  background: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-size: 40px;
  align-items: center;
  justify-content: center;
  display: flex;
}
</style>

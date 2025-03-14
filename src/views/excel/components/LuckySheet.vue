<template>
  <div>
    <div class="container1">
      <div class="fixed-width1" style="padding-left: 10px">
        <el-button v-if="purview==1&&editMode==1" link type="primary" ref="loadBut">导入</el-button>
        <el-button @click="exportFile" link type="primary">导出</el-button>
      </div>
      <div class="text-center1" style="font-size: 24pt;cursor: pointer;" @click="showCreateExcel">
        {{ excelInitData.fileName }}
      </div>
      <div class="fixed-width2" style="margin-right: 10px">
        <el-button ref="insertBut" v-if="purview==1&&editMode==1" link type="primary" class="text"
                   style="margin-right: 10px">插入
        </el-button>

        <span style="color: gray;font-size: 10px">
            版本状态：
          </span>
        <el-tooltip content="查看修订记录">
          <el-tag @click="showHistory" style="cursor: pointer;margin-right: 10px"> {{ getStatusStr() }}</el-tag>
        </el-tooltip>
        <el-button @click="cacheFile(true)" v-if="editMode==1" link v-loading.fullscreen.lock="loding"
                   type="primary">保存
        </el-button>
        <el-button @click="outDialog= true" v-if="editMode==1" link v-loading.fullscreen.lock="loding"
                   type="primary">发布
        </el-button>
      </div>
    </div>
    <div id="luckysheet"></div>
    <el-popover
      ref="insertPopoverRef"
      :virtual-ref="insertBut"
      trigger="hover"
      title="选择要插入的数据"
      virtual-triggering
      width="200px"
      v-if="purview"
    >
      <div style="text-align: center">
        <p>
          <el-button link type="primary" @click="showInsertData('01')">插入跟踪构件</el-button>
        </p>
        <p>
          <el-button link type="primary" @click="showInsertData('02')">插入固定构件</el-button>
        </p>
        <p>
          <el-button link type="primary" @click="showInsertData('03')">插入电气构件</el-button>
        </p>
        <p>
          <el-button link type="primary" @click="showInsertData('04')">插入车棚构件</el-button>
        </p>
      </div>
    </el-popover>
    <el-popover ref="loadPopoverRef" :virtual-ref="loadBut" trigger="hover" title="选择导入方式" virtual-triggering
                width="150px" v-if="purview">
      <div style="text-align: left">
        <p>
          <el-upload :auto-upload="false" :on-change="onFileSelectChange" :show-file-list="false" accept=".xlsx">
            <el-button link type="primary">导入本地文件</el-button>
          </el-upload>
        </p>
        <p>
          <el-button link type="primary" @click="inputDialog = true;">导入模板</el-button>
        </p>
        <p>
          <el-button link type="primary" @click="historyDialog = true">导入历史版本</el-button>
        </p>
      </div>
    </el-popover>
    <InputModel :dialogVisible="inputDialog" @cClose="inputCallback"/>
    <InsertData :dialogVisible="insertDialog" :category="insertType" @cClose="insertCallback"/>
    <InputHistory :dialogVisible="historyDialog" :fileId="excelInitData.fileId" @cClose="inputCallback"/>
    <el-dialog v-model="outDialog" width="500" append-to-body destroy-on-close title="发布提示"
               @closed="outDialogClose">
      <span>{{ (tipDialog.isRouterSwitch ? tipDialog.message : '') + '发布之后将生成新版本，是否确认发布?' }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="outCancel">取 消</el-button>
          <el-button type="primary" @click="outSubmitForm(1)">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, defineProps, unref} from 'vue'
import LuckyExcel from 'luckyexcel'
import useAppStore from "@/store/modules/app";
import {addNew, editFile, getFileCache, getFileInfo, editFileInfo, cancelSave} from "@/api/excel";
import {useRouter, useRoute} from 'vue-router';
import LuckySheetHistory from "@/views/excel/components/LuckySheetHistory.vue";
import {exportSheetExcel} from './myExport2.js'
import {exportExcel} from './export.js'
import InputModel from "@/views/excel/components/InputModel.vue";
import InsertData from "@/views/excel/components/InsertData.vue";
import InputHistory from "@/views/excel/components/InputHistory.vue";
import {EventBus} from "@/views/excel/components/event-bus";

const router = useRouter();
const route = useRoute();
const loding = ref(false);
const appStore = useAppStore()
const insertPopoverRef = ref();
const loadPopoverRef = ref();
const insertBut = ref();
const loadBut = ref();
const loadPopoverVis = ref(false);

//导入模板弹框
const inputDialog = ref(false);
//插入数据
const insertDialog = ref(false);
const insertType = ref(0);
//导入历史版本
const historyDialog = ref(false);
//退出页面提示
const outDialog = ref(false);

const purview = ref(1);//用户权限 0:查看 1：编辑
const editMode = ref(1);//编辑模式 0:查看 1：编辑
const excelInitData = ref({//文件基本信息
  fileName: undefined,
  fileId: undefined,
  version: undefined,
})
const props = defineProps({
  fileId: undefined,
  fileName: undefined,
  isHistoryStatus: undefined,
  purview: undefined,
  url: undefined,//创建文件或仅做展示的在线文档地址
  file: undefined,//input 上传的文件本体（新建文件以导入方式）
});

const tipDialog = ref({
  title: '提示',
  message: '文件有修改记录是否发布？',
  isRouterSwitch: false,//下一个动作是否是切换路由
  isRouterPass: false
})

const isHaveOffLineCache = ref(false);//是否含有离线的缓存//用于跳转前提示
const isHaveOnLineCache = ref(false);//是否包含在线缓存
const editSheetMap = ref({});//sheet修改记录map {sheetID:[{},{}]}
const editList = ref([]);
// const lastSheet = ref();//当前最后一个sheet页面

var autoSave;//自动保存事件
//普通页面配置
const option = ref({
  container: 'luckysheet', //luckysheet is the container id
  showinfobar: false,
  lang: useStorage('language', 'zh_CN').value === 'zh_CN' ? 'zh' : 'en',
  showtoolbarConfig: {print: false},
  data: undefined,
  hook: {
    cellAllRenderBefore: function (data, sheet, ctx) {
      // console.log('渲染单元格前', data,sheet)
      /*if (lastSheet.value !== sheet.index) {//表格不相等 切换了表格 判断上个表格是否保存
       f (isHaveOffLineCache.value[lastSheet.value]) {//去除了切换sheet保存提示
         //提示是否保存
         showConfirm(false)
       }
      }
      lastSheet.value = sheet.index;*/
    },
    updated: function (operate) {
      console.log('更新内容', operate)
      if (editMode.value == 1) {//编辑模式才自动保存
        tipDialog.value.isRouterPass = false
        isHaveOffLineCache.value = true
        // editList.value.push(operate)
        if (operate.type === 'datachange') {//数据变化才会记录到修改历史中 其他修改记录并保存本地缓存状态
          if (!editSheetMap.value[operate.sheetIndex])
            editSheetMap.value[operate.sheetIndex] = [];

          editSheetMap.value[operate.sheetIndex].push({
            'sheetIndex': operate.sheetIndex,
            r: operate.range[0].row,
            c: operate.range[0].column
          })
        }
        // 不操作之后延时10秒保存一次
        if (autoSave) clearTimeout(autoSave)
        autoSave = setTimeout(function () {
          cacheFile(false)
        }, 3 * 1000)
      }
    },
  },
})

function onFileSelectChange(value) {
  loadPopoverVis.value = false;
  const files = value.raw
  if (files == null || files.length == 0) {
    alert('No files wait for import')
    return
  }

  let name = files.name
  let suffixArr = name.split('.'),
    suffix = suffixArr[suffixArr.length - 1]
  if (suffix !== 'xlsx') {
    alert('Currently only supports the import of xlsx files')
    return
  }
  LuckyExcel.transformExcelToLucky(files, function (exportJson, luckysheetfile) {
    if (exportJson.sheets == null || exportJson.sheets.length == 0) {
      alert('Failed to read the content of the excel file, currently does not support xls files!')
      return
    }
    // console.log('exportJson==', exportJson.sheets)
    // excelInitData.value.fileName = exportJson.info.name;
    window.luckysheet.destroy()
    option.value.data = exportJson.sheets;
    window.luckysheet.create(option.value)
    generateLoadExcelHistory();
  })
}

/**
 * 导入模板回调
 * @param value
 */
function inputCallback(value) {
  console.log('导入模板=', value)
  inputDialog.value = false;
  historyDialog.value = false;
  if (value && value.length > 0) {
    // eslint-disable-next-line no-undef
    window.luckysheet.destroy()
    option.value.data = value
    // eslint-disable-next-line no-undef
    luckysheet.create(option.value)
    generateLoadExcelHistory();
  }
}

/**
 * 插入数据回调
 * @param value
 */
function insertCallback(value) {
  console.log('插入构件返回值', value)
  insertDialog.value = false;
  if (value.length) {
    // eslint-disable-next-line no-undef
    var ranges = luckysheet.getRange()
    console.log('位置', ranges)
    if (ranges.length) {
      var rowindex = ranges[0].row[0]
      // eslint-disable-next-line no-undef
      luckysheet.insertRow(rowindex, {number: value.length})
    }
  }
  if (value.length && ranges.length) {
    var row = ranges[0].row
    var col = ranges[0].column
    console.log('要插入内容的单元格为', row[0], col[0])
    var rowi = row[0]
    var coli = col[0]
    for (let i = 0; i < value.length; i++) {
      for (let position = 0; position < value[i].length; position++) {
        if (value[i][position]) {
          // eslint-disable-next-line no-undef
          luckysheet.setCellValue(rowi + i, coli + position, value[i][position], {isRefresh: false})
        }
      }
    }
  }
  // eslint-disable-next-line no-undef
  luckysheet.refresh();
  // insertDialog.value = false
}

function showInsertData(type) {
  console.log('选择了要插入的数据类型', type, insertDialog.value)
  insertType.value = type
  insertDialog.value = true
}

/**
 * 跳转修订记录页面
 */
function showHistory() {
  router.push({path: '/excel/history', query: {...excelInitData.value, purview: purview.value}})
}

/**
 * 保存文档
 */

const showCreateExcel = () => {
  if (editMode.value == 1)
    ElMessageBox.prompt('请输入文件名', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPattern:
        /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/,
      inputErrorMessage: '无效的文件名',
    })
      .then(({value}) => {
        addFileName(value)
      })
      .catch((e) => {
        if (!excelInitData.value.fileName)
          addFileName("未命名");
      })
}
const addFileName = (value) => {
  loding.value = true
  editFileInfo({name: value, id: excelInitData.value.fileId}).then(res => {
    if (res.code == 200)
      excelInitData.value.fileName = value;
  }).finally(() => {
    loding.value = false;
  })
}
const createExcel = (fileN) => {
  refresOFFLineEditRecord()
  excelInitData.value.fileName = fileN;
  window.luckysheet.destroy()
  option.value.data = [{
    "name": "sheet1",
    "index": "sheet_01",
    "order": 0,
    "status": 1,
  }]
  // eslint-disable-next-line no-undef
  luckysheet.create(option.value)
  isHaveOffLineCache.value = true;
}

/**
 * 生成导入文件历史记录
 */
function generateLoadExcelHistory() {
  var sheets = window.luckysheet.getAllSheets()
  if (sheets)
    for (const sheet of sheets) {
      if (sheet.celldata)
        for (const cell of sheet.celldata) {
          if (!editSheetMap.value[sheet.index])
            editSheetMap.value[sheet.index] = [];

          editSheetMap.value[sheet.index].push({
            'sheetIndex': sheet.index,
            r: [cell.r, cell.r],
            c: [cell.c, cell.c]
          })
        }
    }
  console.log('生成的修改历史', editSheetMap.value)
}

function outCancel() {
  outDialog.value = false;
  if (tipDialog.value.isRouterSwitch) {
    tipDialog.value.isRouterPass = true;
    router.push(nextPath.value);
  }
}

function outDialogClose() {
  tipDialog.value.isRouterSwitch = false
}

async function outSubmitForm(type) {
  outDialog.value = false;
  //取消自动缓存没有执行的
  if (autoSave) clearTimeout(autoSave)
  loding.value = true;
  // eslint-disable-next-line no-undef
  const data = luckysheet.getAllSheets()
  var fileJson = [];
  for (const item in data) {
    var paramsItem = {
      ...data[item]
    }
    paramsItem.data = null
    fileJson.push(paramsItem)
  }
  // 将变量转换为JSON字符串
  var jsonString = JSON.stringify(fileJson);
// 获取JSON字符串的长度
  var size = jsonString.length;
// 20MB的字节数
  var bytesIn20MB = 5 * 1024 * 1024;
  console.log('文件大小', size)
  if (size > bytesIn20MB) {
    ElMessage.error("文件内容过多,请精简后再次尝试！")
    loding.value = false
    return
  }
  await editFile({
    fileJson,
    type,
    'fileName': excelInitData.value.fileName,
    'editHistory': editSheetMap.value,
    fileId: excelInitData.value.fileId
  }).then(res => {
    if (type !== 0)
      ElMessage.success("发布成功");
    EventBus.$emit('excelFileInfo', {
      version: excelInitData.value.version + 1,
      name: excelInitData.value.fileName,
      id: excelInitData.value.fileId
    });
    refresOFFLineEditRecord()
    isHaveOnLineCache.value = false;
    if (tipDialog.value.isRouterSwitch)
      router.push(nextPath.value);
  }).catch(e => {
    // ElMessage.error(e);
    // ElMessage.error("保存失败");
  }).finally(() => {
    loding.value = false
    if (!tipDialog.value.isRouterSwitch) {
      excelInitData.value.version = undefined;
      loadFile()
    }
  })
}

/**
 * 保存sheet
 * @param type 0:临时 1:保存
 */
const saveSheet = async (type) => {
  ElMessageBox.confirm((tipDialog.value.isRouterSwitch ? tipDialog.value.message : '') + '发布之后将生成新版本，是否确认发布', '发布提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      //取消自动缓存没有执行的
      if (autoSave) clearTimeout(autoSave)
      loding.value = true;
      // eslint-disable-next-line no-undef
      const data = luckysheet.getAllSheets()
      var fileJson = [];
      for (const item in data) {
        var paramsItem = {
          ...data[item]
        }
        paramsItem.data = null
        fileJson.push(paramsItem)
      }
      await editFile({
        fileJson,
        type,
        'fileName': excelInitData.value.fileName,
        'editHistory': editSheetMap.value,
        fileId: excelInitData.value.fileId
      }).then(res => {
        if (type !== 0)
          ElMessage.success("发布成功");
        EventBus.$emit('excelFileInfo', {
          version: excelInitData.value.version + 1,
          name: excelInitData.value.fileName,
          id: excelInitData.value.fileId
        });
        refresOFFLineEditRecord()
        isHaveOnLineCache.value = false;
        if (tipDialog.value.isRouterSwitch)
          router.push(nextPath.value);
      }).catch(e => {
        // ElMessage.error(e);
        // ElMessage.error("保存失败");
      }).finally(() => {
        loding.value = false
        if (!tipDialog.value.isRouterSwitch) {
          excelInitData.value.version = undefined;
          loadFile()
        }
      })
    })
    .catch((e) => {
      // cleanCache()
      /*if (tipDialog.value.isRouterSwitch) {
        tipDialog.value.isRouterPass = true;
        router.push(nextPath.value);
      }*/
    })
}
const cacheFile = async (isShowTip) => {
  // console.log('缓存提交', editSheetMap.value)
  // editSheetMap.value = {}//todo 打开注释将无法记录修改记录历史 忘记为什么加这样一段代码了 暂时注释掉
  // eslint-disable-next-line no-undef
  //取消未执行的定时保存任务
  if (autoSave) clearTimeout(autoSave)
  const data = luckysheet.getAllSheets()
  var fileJson = [];
  for (const item in data) {
    var paramsItem = {
      ...data[item]
    }
    paramsItem.data = null
    fileJson.push(paramsItem)
  }
  console.log('文件大小', 1)
  // 将变量转换为JSON字符串
  var jsonString = JSON.stringify(fileJson);
// 获取JSON字符串的长度
  var size = jsonString.length;
// 20MB的字节数
  var bytesIn20MB = 5 * 1024 * 1024;
  console.log('文件大小', size)
  if (size > bytesIn20MB) {
    ElMessage.error("文件内容过多,请精简后再次尝试！")
    return
  }
  await editFile({
    fileJson,
    type: 0,
    'fileName': excelInitData.value.fileName,
    'editHistory': editSheetMap.value,
    fileId: excelInitData.value.fileId
  }).then(res => {
    refresOFFLineEditRecord()
    isHaveOnLineCache.value = true
    if (isShowTip)
      ElMessage.success('保存成功')
    EventBus.$emit('excelFileSave', {
      version: excelInitData.value.version,
      name: excelInitData.value.fileName,
      id: excelInitData.value.fileId
    });
  }).catch(e => {
    ElMessage.error(e);
  }).finally(loding.value = false)
}

const openMore = () => {

}

function testLogData(data) {
  setTimeout(() => {
    console.log('测试延时打印数据', data, data.range[0].column[0])
  }, 100)
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
  // eslint-disable-next-line no-undef
  var sheetdata = luckysheet.getAllSheets()
  window.luckysheet.destroy()
  option.value.data = sheetdata
  window.luckysheet.create(option.value)
  console.log('转换前', sheetdata)
  // eslint-disable-next-line no-undef
  // luckysheet.refreshFormula()
  // console.log('刷新公式')
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
  // 使用保存部分内容的方式保存和还原页面
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
}

/**
 * 导出文件
 */
async function exportFile() {
  // eslint-disable-next-line no-undef
  console.log('导出内容', luckysheet.getAllSheets())
  loding.value = true;
  setTimeout(async () => {
    // await exportExcel(luckysheet.getAllSheets(), excelInitData.value.fileName).then(() => {
    // eslint-disable-next-line no-undef
    await exportSheetExcel(luckysheet.getAllSheets(), excelInitData.value.fileName).then(() => {
      console.log('123321-----1')
      loding.value = false;
    }).catch((e) => {
      console.log('123321-----2', e)
      loding.value = false;
    })
  }, 250)
}

function getStatusStr() {
  var statusStr = ''
  if (excelInitData.value.version)
    statusStr = statusStr + "V" + excelInitData.value.version
  else statusStr = '未发布'
  if (isHaveOffLineCache.value || isHaveOnLineCache.value) {
    statusStr = statusStr + '(已修改)'
  }
  return statusStr
}

onMounted(() => {
  console.log('接收到的参数', route.query)
  initData(route.query)
  // excelInitData.value.fileId = '1789905555880677377'
  if (excelInitData.value.fileId) {
    if (editMode.value == 1) {//修改模式默认加载最新版本文档，删除版本号可以加载最新版本文档
      excelInitData.value.version = undefined
      loadFileCache();
    } else {
      loadFile();
    }
  }
})
/**
 * 加载在线缓存文件
 * @returns {Promise<void>}
 */
const loadFileCache = async () => {
  loding.value = true

  await getFileCache({fileId: excelInitData.value.fileId}).then(res => {
    loding.value = false
    if (res.data && res.data.name) {
      excelInitData.value.fileName = res.data.name
      excelInitData.value.version = res.data.ver
    }
    if (res.data != null && res.data.sheetData && res.data.sheetData.length) {
      ElMessageBox.confirm('当前文件有未发布修改是否从未发布修改继续编辑', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          refresOFFLineEditRecord()
          isHaveOnLineCache.value = true;
          tipDialog.value.isRouterPass = false;
          window.luckysheet.destroy()
          option.value.data = res.data.sheetData
          // eslint-disable-next-line no-undef
          luckysheet.create(option.value)
        })
        .catch((e) => {
          cleanCache();
          loadFile();
        })
    } else {
      loadFile();
    }
  }).catch(e => {
    loding.value = false
  }).finally(() => {
    if (!excelInitData.value.fileName || excelInitData.value.fileName == '未命名') {
      showCreateExcel();
    }
  })
}
/**
 * 清理缓存
 */
const cleanCache = async () => {
  await cancelSave({fileId: excelInitData.value.fileId}).then(res => {
    isHaveOnLineCache.value = false;
  }).catch(e => {
  })
}
const loadFile = async () => {
  loding.value = true
  await getFileInfo({fileId: excelInitData.value.fileId, version: excelInitData.value.version}).then(res => {
    if (res.data && res.data.name) {
      excelInitData.value.fileName = res.data.name
      excelInitData.value.version = res.data.ver
    }
    if (res.data && res.data.sheetData && res.data.sheetData.length) {
      refresOFFLineEditRecord()
      isHaveOnLineCache.value = false;
      window.luckysheet.destroy()
      option.value.data = res.data.sheetData
      // eslint-disable-next-line no-undef
      luckysheet.create(option.value)
    } else {
      createExcel(excelInitData.value.fileName)
    }
  }).finally(() => {
    loding.value = false
  })
}
const initData = (data) => {
  if (data) {
    excelInitData.value = {
      fileId: data.id,
      fileName: data.name,
      version: data.fileVer
    }
    editMode.value = data.isHistoryStatus
    purview.value = data.purview
  }
  refresOFFLineEditRecord()
  isHaveOnLineCache.value = false;
}

const nextPath = ref();
// eslint-disable-next-line no-undef
onBeforeRouteLeave((to, from, next) => {
  // const route = useRoute();
  console.log('路由路径', to, from, next)
  if (to.path.includes('/excel/view')) {
    next();
  }
  if (!tipDialog.value.isRouterPass && editMode.value == 1 && getAllEditState()) {
    showConfirm(true);
    next(false); // 临时阻止导航，等待用户确认
    nextPath.value = to
  } else {
    window.luckysheet.destroy()
    next();
  }
})
/**
 * 获取所有已修改 后台和本地
 * @returns {boolean}
 */
const getAllEditState = () => {
  // console.log('修改功能', editMode)
  if (isHaveOffLineCache.value)
    return true;
  if (isHaveOnLineCache.value)
    return true;
  return false;
}
/**
 * 刷新重置本地修改记录
 * @type {{}}
 */
const refresOFFLineEditRecord = () => {
  isHaveOffLineCache.value = false;
  editSheetMap.value = {};
  editList.value = [];
}
const showConfirm = (isRouterSwitch) => {
  tipDialog.value.isRouterSwitch = isRouterSwitch;
  // saveSheet(1)
  outDialog.value = true;
}

function data2File(fileData) {
  // eslint-disable-next-line no-undef
  const blob = new Blob([JSON.stringify(fileData)], {type: 'text/plain;charset=utf-8'}); // 创建一个Blob对象
  // 使用 File 构造函数来创建文件对象
  const file = new File([blob], 'dataFile', {type: 'text/plain;charset=utf-8'});
  return file;
}
</script>

<style scoped>
#luckysheet {
  margin: 0px;
  padding: 0px;
  position: absolute;
  width: 100%;
  left: 0px;
  top: 40px;
  bottom: 0px;
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

.container1 {
  height: 40px;
  display: flex;
  justify-content: space-between; /* 两端对齐，使第一个和第三个元素分别靠向两端 */
  align-items: center; /* 垂直居中 */
  /*box-sizing: border-box; !* 确保内边距和边框不影响总宽度 *!*/
}

.fixed-width1 {
  width: 150px; /* 固定宽度 */
  min-width: 149px;
  max-width: 151px;
  text-align: start; /* 文本居中，虽然在这个例子中不直接用于文本，但可用于其他内容 */
}

.fixed-width2 {
  width: 280px; /* 固定宽度 */
  min-width: 279px;
  max-width: 281px;
  text-align: end; /* 文本居中，虽然在这个例子中不直接用于文本，但可用于其他内容 */
}

.text-center1 {
  flex-grow: 1; /* 允许这个元素根据剩余空间增长 */
  text-align: center; /* 文本居中 */
  overflow: hidden; /* 隐藏溢出的文本 */
  text-overflow: ellipsis; /* 显示省略号以表示文本被截断 */
  white-space: nowrap; /* 防止文本换行 */
}
</style>

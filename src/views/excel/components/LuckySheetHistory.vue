<template xmlns="http://www.w3.org/1999/html">
  <div>
    <div class="container1">
      <div class="text-center1" style="font-size: 24pt;cursor: pointer;margin-left: 10px">
        {{ excelInitData.fileName }}
      </div>
      <div class="fixed-width2" style="margin-right: 10px">
        <span style="color: gray;font-size: 10px">
            版本状态：
          </span>
          <el-tag @click="isShowHistoryList=!isShowHistoryList" style="cursor: pointer;"> V{{ excelInitData.version }}</el-tag>
      </div>
    </div>
    <div id="luckysheet"></div>
    <el-drawer v-model="isShowHistoryList" size="200">
      <template #header="{ titleId, titleClass }">
        <el-tooltip class="box-item" effect="dark" content="数据修订记录仅对单元格数据修改记录、展示，其他版本不在本列表中！" placement="left">
          <h4 :id="titleId" :class="titleClass">
            数据修订记录<el-icon><QuestionFilled /></el-icon>
          </h4>
        </el-tooltip>
      </template>
      <div v-for="(item, index) in cellHisList" @click="handleVersion(item.ver)" style="cursor: pointer;">
        <el-tag> V{{ item.ver }}</el-tag>
        <div>
          <span style="font-size: 10pt;color: gray;margin-top: 3px">{{ item.updateTime }}</span>
        </div>
        <div class="container" style="margin-bottom: 10px">
          <div :style="getItemBackColor(item)"></div>
          <span style="font-size: 10pt;color: gray">{{ item.userName }}</span>
        </div>
        <el-divider />
      </div>
    </el-drawer>
    <el-drawer v-model="isShowRowHistory" size="300" title="行修改记录" direction="btt">
      <div :style="{width:heandeList.length*100+'px'}">
        <el-table :data="rowHisList" border>
          <el-table-column v-for="(item,index) in rowHisList[0]" :label="heandeList[index]" align="center" width="100">
            <template #default="scope">
              <el-tag v-if="index===0" @click="handleVersion(scope.row[scope.cellIndex])" style="cursor: pointer;">
                V{{ scope.row[scope.cellIndex] }}
              </el-tag>
              <span v-if="index!==0" :style="getFontColor(scope.cellIndex,scope.$index)">{{
                  scope.row[scope.cellIndex]
              }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
    <div class="floating-button-container">
      <el-button circle icon="DArrowLeft" v-loading.fullscreen.lock="loding" @click="isShowHistoryList=!isShowHistoryList" />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted,} from 'vue'
import LuckyExcel from 'luckyexcel'
import useAppStore from "@/store/modules/app";
import {
  addNew,
  editFile,
  getFileCache,
  getFileInfo,
  editFileInfo,
  cancelSave,
  getEditHistoryInfo,
  getEditHistoryInfoByRow
} from "@/api/excel";
import {useRouter, useRoute} from 'vue-router';
import ScrollPane from "@/layout/components/TagsView/ScrollPane.vue";

const router = useRouter();
const route = useRoute();
const loding = ref(false);
const appStore = useAppStore()

const cellHisList = ref();//记录单元格的修改记录
const rowHisList = ref();//具体行的修改记录
const backColor = ref("#f6b26b");//背景颜色

const lastSheetIndex = ref('');
const isShowHistoryList = ref(true);//历史记录列表
const isShowRowHistory = ref(false);//行历史记录列表
const purview = ref(1);//用户权限 0:查看 1：编辑
const excelInitData = ref({//文件基本信息
  fileName: '',
  fileId: undefined,
  statusType: -1,//文件状态 0：临时保存 1：保存 2：发布
  version: 1,
})
const heandeList = ref([]);
const allowUndo = ref(false);//允许一次操作

const isLoadOk = ref(false);//是否加载页面结束
//历史页面配置
const option = ref({
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
      if (value.bg && value.bg === backColor.value) {
        allowUndo.value = true;
      } else {
        return false;
      }
    },
    /* cellAllRenderBefore: function (data, sheet, ctx) {
       // console.log('渲染单元格前', data,sheet)
       if (lastSheetIndex.value != sheet.index) {
         console.log('渲染单元格前')
         lastSheetIndex.value = sheet.index;
         isLoadOk.value = false;
       }
     },*/
    sheetActivate: function (sheet) {
      // console.log('sheetActivate', sheet)
      setcolorNumber.value = 0
      loding.value = true;
      setBackColor();
    },
    rangeSelect: function (sheet, range) {
      // console.log('框选或者设置选区后触发', isLoadOk.value, sheet, range)
      if (lastSheetIndex.value != sheet.index) {
        isLoadOk.value = false;
      } else {
        isLoadOk.value = true;
      }
      lastSheetIndex.value = sheet.index;
      if (isLoadOk.value)
        getRowHistory(sheet.index, range[0].row);
    }
  }
})

function getFontColor(c, r) {
  var color = '#000000'
  if (r < 1)
    return {color}
  var newValue = getValue(c, r)
  var oldValue = getValue(c, r - 1)
  if (newValue != oldValue)
    return {color: '#ff0000'}
  else return {
    color
  }
}

function getValue(c, r) {
  if (rowHisList.value[r] && rowHisList.value[r][c])
    return rowHisList.value[r][c]
  else return '';
}

/**
 * 获取行历史记录
 */
async function getRowHistory(sheetIndex, row) {
  isShowRowHistory.value = false;
  await getEditHistoryInfoByRow({fileId: excelInitData.value.fileId, sheetIndex, row: row[0]}).then(res => {
    if (res.code == 200 && res.data) {
      rowHisList.value = res.data.dataList
      heandeList.value = res.data.heandeList
      // for (const key in res.data) {
      //
      //   console.log('接口反馈', key, res.data[key])
      // }
      isShowRowHistory.value = true;
    }
  })
};

function logScope(data) {
  console.log('打印', data)
}

const setcolorNumber = ref(0);

var autoShowBack;//自动保存事件

/**
 * 设置背景颜色
 */
function setBackColor() {
  if (autoShowBack) clearTimeout(autoShowBack)
  autoShowBack = setTimeout(function () {
    // eslint-disable-next-line no-undef
    var sheetIndex = luckysheet.getSheet().index
    // console.log('当前sheet',sheetIndex)
    setcolorNumber.value = setcolorNumber.value + 1
    for (let cellHisListKey in cellHisList.value) {
      if (cellHisList.value[cellHisListKey].ver == excelInitData.value.version) {//不能完全匹配
        for (const cell in cellHisList.value[cellHisListKey].newEdit[sheetIndex]) {
          var cellIndex = cellHisList.value[cellHisListKey].newEdit[sheetIndex][cell];
          // eslint-disable-next-line no-undef
          luckysheet.setCellValue(cellIndex[1], cellIndex[0], {bg: backColor.value}, {
            isRefresh: false
          })
        }
      }
    }
    if (setcolorNumber.value < 2)
      setBackColor()
    else {
      // console.log('设置单元格修改标记结束')
      // eslint-disable-next-line no-undef
      luckysheet.refresh();
      isLoadOk.value = true;
      loding.value = false;
    }
  }, 1 * 1000)
}

function getItemBackColor(item) {
  if (item.ver == excelInitData.value.version)
    return {
      width: '10px', /* 小圆点宽度 */
      height: '10px', /* 小圆点高度 */
      "background-color": backColor.value, /* 红色背景 */
      "border-radius": '50%', /* 使其成为一个圆形 */
      "margin-right": '10px',
      "margin-top": '3px'
    }
  else return {}
}

function handleVersion(ver) {

  isLoadOk.value = false;
  excelInitData.value.version = ver
  loadFile()
}

const testFun = () => {
  /*// eslint-disable-next-line no-undef  //todo 更新sheet的方法只有在特定版本中才有 在线引入版本不支持
  console.log('数据内容手动增加内容', jsonData.value.sheets)

  window.luckysheet.updataSheet({'data':jsonData.value.sheets,'success': (res) => {
    console.log('更新sheet返回结果', res)
  }})
  // eslint-disable-next-line no-undef
  luckysheet.refresh()*/
  console.log('点击了按钮')
  // eslint-disable-next-line no-undef
  // luckysheet.setCellValue(0, 0, {"bg": "#f6b26b"})
  // 设置第二个工作表的"B2"和"C4:D5"范围的单元格背景为红色
  // eslint-disable-next-line no-undef
  luckysheet.setRangeFormat("bg", backColor.value, {range: ["A2", "C4"]})//todo 切换sheet时设置
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

const getStatusStr = (type) => {

  return
}
onMounted(() => {
  // console.log('接收到的参数', route.query)
  initData(route.query)
  // excelInitData.value.fileId = '1789905555880677377'
  if (excelInitData.value.fileId) {
    loadFile();
    loadHistoryList();
  }
})

async function loadHistoryList() {
  await getEditHistoryInfo({fileId: excelInitData.value.fileId}).then(res => {
    if (res.code == 200)
      cellHisList.value = res.data
  })
}

const loadFile = async () => {
  loding.value = true
  await getFileInfo({fileId: excelInitData.value.fileId, version: excelInitData.value.version}).then(res => {
    if (res.data && res.data.name) {
      excelInitData.value.fileName = res.data.name
    }
    if (res.data && res.data.sheetData && res.data.sheetData.length) {
      window.luckysheet.destroy()
      option.value.data = res.data.sheetData
      // eslint-disable-next-line no-undef
      luckysheet.create(option.value)
    } else {
      ElMessage.warning("没有加载到历史记录")
    }
  }).finally(() => {
    loding.value = false
    setcolorNumber.value = 0
    setBackColor();
  })
}
const initData = (data) => {
  if (data) {
    excelInitData.value = {
      fileId: data.fileId,
      fileName: data.fileName,
      // statusType: data.statusType,
      version: data.version
    }
    purview.value = data.purview
  }
}
</script>

<style scoped>
.floating-button-container {
  position: fixed;
  bottom: 20px; /* 距离底部的距离 */
  right: 20px; /* 距离右边的距离 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  z-index: 1999; /* 确保按钮在其他内容之上 */
}

#luckysheet {
  margin: 0px;
  padding: 0px;
  position: absolute;
  width: 100%;
  left: 0px;
  top: 40px;
  bottom: 0px;
}

.container {
  display: flex; /* 使用Flexbox布局 */
  align-items: center; /* 垂直居中子元素 */
  /*justify-content: center; !* 水平居中子元素（如果需要） *!*/
  /* 其他样式，如宽度、高度、边框等 */
  /*width: 200px; !* 示例宽度 *!*/
  /*height: 100px; !* 示例高度 *!*/
  /*border: 1px solid #ccc; !* 示例边框 *!*/
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
  width: 150px; /* 固定宽度 */
  min-width: 149px;
  max-width: 151px;
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

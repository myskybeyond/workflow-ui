<template>
  <div style="background-color: #eff1f4">
    <div style="width: 100%;background-color: white; display: flex;align-items: center;">
      <img :src="userStore.avatar" class="user-avatar" style="margin:20px 10px 20px 30px"/>
      <div style="flex: 3">
        <h3 style="margin: 0 0 0 0">您好,{{ userStore.nickname }},祝你开心每一天！</h3>
        <div style="margin-top: 10px;font-size: 10px;color: gray;"><span>{{ userStore.posts }}</span></div>
      </div>
      <div class="shuju">
        <el-tooltip content="项目总数">
          <div style="font-size: 10px;color: gray;display: inline-block;">项目
            <el-icon color="#409EFF">
              <Warning/>
            </el-icon>
          </div>
        </el-tooltip>
        <div style="margin-top: 10px;font-weight: bold;font-size: 25px">{{ allProjectNumber }}</div>
      </div>
      <el-divider direction="vertical"/>
      <div class="shuju">
        <el-tooltip content="销售订单总数">
          <div style="font-size: 10px;color: gray;display: inline-block;">销售订单
            <el-icon color="#409EFF">
              <Warning/>
            </el-icon>
          </div>
        </el-tooltip>
        <div style="margin-top: 10px;font-weight: bold;font-size: 25px">{{ allOrderNumber }}</div>
      </div>
      <div style="width: 100px"/>
    </div>
    <el-row style="margin: 10px 10px 0px 10px" gutter="20">
      <el-col :span="6">
        <el-card style="position: relative;height: 90px">
          <div color="gray" style="font-size: 10px">本周新增项目数量</div>
          <div style="float: right;">
            <el-tooltip content="本周（周一至今）新增项目数量">
              <el-icon color="gray">
                <Warning/>
              </el-icon>
            </el-tooltip>
          </div>
          <div class="juzhong">{{ weekProjectNumber }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="position: relative;height: 90px">
          <div color="gray" style="font-size: 10px">本月新增订单数量</div>
          <div style="float: right;">
            <el-tooltip content="本月（本月一号至今）新增订单数量">
              <el-icon color="gray">
                <Warning/>
              </el-icon>
            </el-tooltip>
          </div>
          <div class="juzhong">{{ monthOrderNumber }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="position: relative;height: 90px">
          <div color="gray" style="font-size: 10px">本月完成报价任务数量</div>
          <div style="float: right;">
            <el-tooltip content="本月（本月一号至今）完成报价任务数量">
              <el-icon color="gray">
                <Warning/>
              </el-icon>
            </el-tooltip>
          </div>
          <div class="juzhong">{{ offerNumber }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="position: relative;height: 90px">
          <div color="gray" style="font-size: 10px">本月完成下单任务数量</div>
          <div style="float: right;">
            <el-tooltip content="本月（本月一号至今）完成下单任务数量">
              <el-icon color="gray">
                <Warning/>
              </el-icon>
            </el-tooltip>
          </div>
          <div class="juzhong">{{ orderNumber }}
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row gutter="10" style="margin: 10px 5px 0 5px">
      <el-col :span="14">
        <el-card style="position: relative;height: 100%">
          <el-button style="z-index: 999;position: absolute;top: 20px;right: 20px;" type="primary" link
                     @click="handleShenqingMore(0)">
            更多
          </el-button>
          <el-tabs v-model="daibanTab" @tab-click="handleClick">
            <el-tab-pane :label="daibanLabel" name="1">
              <DaiBan @backData="daibanBack"/>
            </el-tab-pane>
            <el-tab-pane :label="chaosongLabel" name="2">
              <ChaoSong @backData="chaosongBack"/>
            </el-tab-pane>
            <el-tab-pane label="我的办理" name="3">
              <BanLi @backData="banliBack"/>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card style="position: relative;height: 100%">
          <template #header>
            <span style="font-weight: bold;font-size: 15px">消息({{ messageNumber }})</span>
            <el-button style="float: right;" type="primary" link @click="handleXiaoxi" v-hasPermi="['business:mysmg:query']">
              更多
            </el-button>
            <el-button style="float: right;padding-right: 20px" type="primary" link @click="handleAll">
              全部已读
            </el-button>
          </template>
          <XiaoXi :reload="reloadData" @backData="xiaoxiBack"/>
        </el-card>
      </el-col>
    </el-row>
    <el-card style="position: relative;margin: 10px 10px 0 10px">
      <template #header>
        <span style="font-weight: bold;font-size: 15px">下单进度跟踪</span>
      </template>
      <JinDu />
    </el-card>
    <el-card style="position: relative;margin: 10px ">
      <template #header>
        <span style="font-weight: bold;font-size: 15px">报价进度跟踪</span>
      </template>
      <BaoJia/>
    </el-card>
  </div>
</template>

<script setup name="GeRen" lang="ts">
import {initWebSocket} from '@/utils/websocket';
import useUserStore from "@/store/modules/user";
import DaiBan from "@/components/Index/DaiBan.vue";
import ChaoSong from "@/components/Index/ChaoSong.vue";
import BanLi from "@/components/Index/BanLi.vue";
import XiaoXi from "@/components/Index/XiaoXi.vue";
import {markAllRead} from "@/api/business/smsInfo";
import BaoJia from "@/components/Index/BaoJia.vue";
import {getIndexNumbers, getprojectFlwRelationList} from "@/api/Index";
import {checkPermi} from "@/utils/permission";

const daibanTab = ref('1')
const shenqingTab = ref('1')
const daibanLabel = ref('待办')
const daibanNumber = ref(0)
const chaosongLabel = ref('我的抄送')
const messageNumber = ref(0)
const xiangmuNumber = ref(0)
const allOrderNumber = ref(0)
const monthOrderNumber = ref(0)
const allProjectNumber = ref(0)
const weekProjectNumber = ref(0)
const offerNumber = ref(0)
const orderNumber = ref(0)
const renwuNumber = ref(0)

const reloadData = ref('')

const router = useRouter();
const userId = useUserStore().userId;

const userStore = useUserStore();
onMounted(() => {
  let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
  initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + "/resource/websocket");
  getIndexNumber();
});

function handleClick(tab, event: Event) {
  console.log(tab, event)
}
async function getIndexNumber() {
  await getIndexNumbers().then((res) => {
    allOrderNumber.value = res.data.allOrderNumber;
    monthOrderNumber.value = res.data.monthOrderNumber;
    allProjectNumber.value = res.data.allProjectNumber;
    weekProjectNumber.value = res.data.weekProjectNumber;
    offerNumber.value = res.data.offerNumber;
    orderNumber.value = res.data.orderNumber;
  }).finally(() => {
  });
}

/**
 * 我的申请更多
 */
function handleShenqingMore(type: number) {
  if (daibanTab.value === '1') {
    if (!checkPermi(['workflow:process:todoList'])){
      ElMessage.error("没有权限")
      return
    }
    router.push({
      path: "/work/todo",
    });
  } else if (daibanTab.value === '2') {
    if (!checkPermi(['workflow:process:copyList'])){
      ElMessage.error("没有权限")
      return
    }
    router.push({
      path: "/work/copy",
    });
  } else {
    if (!checkPermi(['workflow:process:finishedList'])){
      ElMessage.error("没有权限")
      return
    }
    router.push({
      path: "/work/finished",
    });
  }
}

function daibanBack(value: number) {
  daibanLabel.value = `待办(${value})`
  daibanNumber.value = value
}

function chaosongBack(value: number) {
  chaosongLabel.value = `我的抄送(${value})`
}


function banliBack(value: number) {
  renwuNumber.value = value
}

function xiaoxiBack(value: number) {
  messageNumber.value = value
}

async function handleAll() {
  await ElMessageBox.confirm("是否确认设置为全部已读？", '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await markAllRead(userId);
  reloadData.value = new Date().getTime()
  ElMessage.success('设置全部已读成功')
}

async function handleXiaoxi() {
  router.push({
    path: "/myMsg",
  });
}

</script>

<style scoped lang="scss">

.user-avatar {
  cursor: pointer;
  width: 60px;
  height: 60px;
  border-radius: 30px;
}

.alignment-container {
  width: 50%;
  padding: 8px;
}

.shuju {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.juzhong {
  font-weight: bold;
  font-size: 25px;
  position: absolute;
  top: 50%;
  left: 50%;
  padding-top: 20px;
  transform: translate(-50%, -50%);
}
</style>

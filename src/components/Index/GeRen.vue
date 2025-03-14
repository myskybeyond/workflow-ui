<template>
  <div style="background-color: #eff1f4">
    <div style="width: 100%;background-color: white; display: flex;align-items: center;">
      <img :src="userStore.avatar" class="user-avatar" style="margin:20px 10px 20px 30px"/>
      <div style="flex: 3">
        <h3 style="margin: 0 0 0 0">您好,{{ userStore.nickname }},祝你开心每一天！</h3>
        <div style="margin-top: 10px;font-size: 10px;color: gray;"><span>{{ userStore.posts }}</span></div>
      </div>
      <div class="shuju">
        <div style="font-size: 10px;color: gray;">待办</div>
        <div style="margin-top: 10px;font-weight: bold;font-size: 25px">{{ daibanNumber }}</div>
      </div>
      <el-divider direction="vertical"/>
      <div class="shuju">
        <div style="font-size: 10px;color: gray;">我的项目</div>
        <div style="margin-top: 10px;font-weight: bold;font-size: 25px">{{ xiangmuNumber }}</div>
      </div>
      <el-divider direction="vertical"/>
      <div class="shuju">
        <div style="font-size: 10px;color: gray;">已办任务</div>
        <div style="margin-top: 10px;font-weight: bold;font-size: 25px">{{ renwuNumber }}</div>
      </div>
      <div style="width: 100px"></div>
    </div>
    <div style="width: 100%;display: flex;justify-content: space-between;">
      <div class="alignment-container">
        <el-card style="position: relative;height: 350px;">
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
          </el-tabs>
        </el-card>
        <el-card style="margin-top: 10px;position: relative;height: 350px">
          <el-button style="z-index: 999;position: absolute;top: 20px;right: 20px;" type="primary" link
                     @click="handleShenqingMore(1)">
            更多
          </el-button>
          <el-tabs v-model="shenqingTab" @tab-click="handleClick">
            <el-tab-pane label="我的申请" name="1">
              <ShenQing />
            </el-tab-pane>
            <el-tab-pane label="我的办理" name="2">
              <BanLi @backData="banliBack"/>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
      <div class="alignment-container">
        <LiuCheng />
        <el-card style="margin-top: 10px;position: relative;">
          <template #header>
            <span style="font-weight: bold;font-size: 15px">我的项目</span>
            <el-button style="float: right;" type="primary" link @click="handleXiangMu" v-hasPermi="['business:projectInfo:list']">
              更多
            </el-button>
          </template>
          <XiangMu @backData="xiangmuBack"/>
        </el-card>
        <el-card style="margin-top: 10px;position: relative;">
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
      </div>
    </div>

  </div>
</template>

<script setup name="GeRen" lang="ts">
import {initWebSocket} from '@/utils/websocket';
import useUserStore from "@/store/modules/user";
import Test from "@/components/Index/Test.vue";
import DaiBan from "@/components/Index/DaiBan.vue";
import ChaoSong from "@/components/Index/ChaoSong.vue";
import ShenQing from "@/components/Index/ShenQing.vue";
import BanLi from "@/components/Index/BanLi.vue";
import LiuCheng from "@/components/Index/LiuCheng.vue";
import XiaoXi from "@/components/Index/XiaoXi.vue";
import {to} from "await-to-js";
import {markAllRead} from "@/api/business/smsInfo";
import XiangMu from "@/components/Index/XiangMu.vue";
import {checkPermi} from "@/utils/permission";

const daibanTab = ref('1')
const shenqingTab = ref('1')
const daibanLabel = ref('待办')
const daibanNumber = ref(0)
const chaosongLabel = ref('我的抄送')
const messageNumber = ref(0)
const xiangmuNumber = ref(0)
const renwuNumber = ref(0)

const reloadData = ref('')

const router = useRouter();
const userId = useUserStore().userId;

const userStore = useUserStore();
onMounted(() => {
  let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
  initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + "/resource/websocket");
});

function handleClick(tab, event: Event) {
  console.log(tab, event)
}

/**
 * 我的申请更多
 */
function handleShenqingMore(type: number) {
  if (type === 0) {
    if (daibanTab.value === '1') {
      if (!checkPermi(['workflow:process:todoList'])){
        ElMessage.error("没有权限")
        return
      }
      router.push({
        path: "/work/todo",
      });
    } else {
      if (!checkPermi(['workflow:process:copyList'])){
        ElMessage.error("没有权限")
        return
      }
      router.push({
        path: "/work/copy",
      });
    }
  } else {
    if (shenqingTab.value === '1') {
      if (!checkPermi(['workflow:process:ownList'])){
        ElMessage.error("没有权限")
        return
      }
      router.push({
        path: "/work/own",
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

}

const goTarget = (url: string) => {
  window.open(url, '__blank')
}

function daibanBack(value: number) {
  daibanLabel.value = `待办(${value})`
  daibanNumber.value = value
}

function chaosongBack(value: number) {
  chaosongLabel.value = `我的抄送(${value})`
}

function xiangmuBack(value: number) {
  xiangmuNumber.value = value
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
async function handleXiangMu() {
  router.push({
    path: "/project/projectInfo",
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
</style>

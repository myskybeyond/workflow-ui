<template>
  <div style="height: 600px;">
    <el-table :data="auths">
      <el-table-column label="序号" width="50" type="index"></el-table-column>
      <el-table-column label="绑定账号平台" width="200" align="center" prop="source" show-overflow-tooltip>
        <template v-slot="scope">
          {{ getAppNameByCode(scope.row.source) }}
        </template>
      </el-table-column>
      <el-table-column label="系统账号" width="180" align="center" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="绑定时间" width="180" align="center" prop="createTime" />
      <el-table-column label="操作" width="80" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="small" type="primary" link @click="unlockAuth(scope.row)">解绑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex;justify-content: space-between;">
      <div id="git-user-binding">
        <h4 class="provider-desc">你可以绑定以下第三方帐号</h4>
        <span id="authlist" class="user-bind" v-for="(item, index) in appList" :key="item">
          <img :key="item.appCode" :src="splitImgSrc(item.appCode.toUpperCase())" class="login-ding" @click="authUrl(item)" :alt="item.appName" />
          <span
            v-if="othersShow(item.appCode)"
            :style="calcAbsoluteLeftOfThirdParty(index)"
            @click="authUrl(item)"
            >{{ item.appName ? item.appName.substring(0, 2) : item.appName }}</span
          >
        </span>
      </div>
    </div>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <div class="user-bind_qrcode">
        <ding-talk-auth-qrcode :key="app?.id" :app-key="app?.appKey" @callback="callbackByCode"> </ding-talk-auth-qrcode>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { authUnlock } from "@/api/system/social/auth";
import { PropType, ref } from "vue";
import { calcAbsoluteLeftOfThirdParty, othersShow, splitImgSrc } from "@/utils/socialUtil";
import useUserStore from "@/store/modules/user";
import { AppInfoVO } from "@/api/business/appInfo/types";
import dingTalkAuthQrcode from "@/components/DingTalkAuthQrcode/index.vue";
import { LoginData } from "@/api/types";
import { callbackBind, getAppList } from "@/api/login";
import { EventBus } from "@/views/excel/components/event-bus";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const userId = useUserStore().userId;
const props = defineProps({
  auths: {
    type: Object as PropType<any>
  }
});
const dialog = reactive<DialogOption>({
  visible: false,
  title: ""
});
const auths = computed(() => props.auths);
// 应用列表
const appList = ref();
const appShowName = ref("");
const app = ref<AppInfoVO>();
const unlockAuth = (row: any) => {
  ElMessageBox.confirm("您确定要解除\"" + row.source + "\"的账号绑定吗？")
    .then(() => {
      return authUnlock(row.id);
    }).then((res: any) => {
    if (res.code === 200) {
      proxy?.$modal.msgSuccess("解绑成功");
      proxy?.$tab.refreshPage();
    } else {
      proxy?.$modal.msgError(res.msg);
    }
  }).catch(() => {
  });
};

const authUrl = (source: any) => {
  const appCode = source.appCode.toUpperCase();
  const appName = source.appName;
  appShowName.value = appName;
  app.value = appList.value?.find(a => a.appCode.toUpperCase() === appCode);
  dialog.visible = true;
  dialog.title = "钉钉【" + appShowName.value + "】二维码";
};
const getApps = async () => {
  const res = await getAppList();
  if (res) {
    appList.value = res.data;
  }
};
const getAppNameByCode = (appCode: string) => {
  return appList.value?.find(a => a.appCode.toUpperCase() === appCode) ?.appName;
};
const callbackByCode = async (params: any) => {
  const data: LoginData = {
    socialCode: params.code,
    socialState: params.state,
    // tenantId: tenantId,
    source: app.value?.appCode.toUpperCase(),
    clientId: "e5cd7e4891bf95d1d19206ce24a7b32e",
    grantType: "social",
    userId: userId?.toString(),
    appId: app.value?.id.toString()
  };
  try {
    const res = await callbackBind(data);
    await processResponse(res);
  } catch (error) {
    handleError(error);
  }
};
const processResponse = async (res: any) => {
  if (res.code !== 200) {
    throw new Error(res.msg);
  }
  ElMessage.success(res.msg);
  EventBus.$emit("refreshAuthsEvent", "updateAuths");
  reset();
};
const handleError = (error: any) => {
  ElMessage.error(error.message);
};
const reset = () => {
  dialog.visible = false;
  app.value = {
    agentId: "", appSecret: "", appType: "", name: "", status: 0,
    id: "",
    appKey: "",
    appCode: ""
  };
};
onMounted(() => {
  getApps();
});
onBeforeUnmount(() => {
});
</script>

<style lang="scss" scoped>
.user-bind .third-app {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  min-width: 80px;
  float: left;
}

.user-bind {
  position: relative;
  font-size: 1rem;
  text-align: start;
  margin: 10px 5px 0 0;

  &_qrcode {
    text-align: center;
  }
}

.git-other-login-icon > img {
  height: 32px;
}

a {
  text-decoration: none;
  cursor: pointer;
  color: #005980;
}

.provider-desc {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
  "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Liberation Sans",
  "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Wenquanyi Micro Hei",
  "WenQuanYi Zen Hei", "ST Heiti", SimHei, SimSun, "WenQuanYi Zen Hei Sharp",
  sans-serif;
  font-size: 1.071rem;
}

td > img {
  height: 20px;
  width: 20px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 5px;
}
</style>

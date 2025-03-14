<template>
  <div v-loading="loading" class="container">{{warningMsg}}</div>
</template>

<script setup lang="ts">
import { callbackBind } from "@/api/login";
import { LoginData } from "@/api/types";
const route = useRoute();
const loading = ref(true);
/**
 * 接收Route传递的参数
 * @param {Object} route.query.
 */
const code = route.query.code as string;
const state = route.query.state as string;
const source = route.query.source as string;
const userId = route.query.userId as string;
const appId = route.query.appId as string;
const tenantId = localStorage.getItem("tenantId") ? localStorage.getItem("tenantId") as string : "000000";

const warningMsg = ref('');
const processResponse = async (res: any) => {
  if (res.code !== 200) {
    throw new Error(res.msg);
  }
  ElMessage.success(res.msg);
  warningMsg.value = '绑定成功，可继续绑定或关闭页面。';
  // 父窗口发送消息
  window.parent.postMessage(
    {
      type: 'MESSAGE_FROM_IFRAME',
      data: 'refreshData',
    },
    'https://5f48f564dc074b98c0c2b17b46d9ede3.loophole.site'
  );
};

const handleError = (error: any) => {
  ElMessage.error(error.message);
};

const callbackByCode = async (data: LoginData) => {
  try {
    const res = await callbackBind(data);
    await processResponse(res);
    loading.value = false;
  } catch (error) {
    handleError(error);
  }
};

const init = async () => {
  const data: LoginData = {
    socialCode: code,
    socialState: state,
    tenantId: tenantId,
    source: source,
    clientId: "e5cd7e4891bf95d1d19206ce24a7b32e",
    grantType: "social",
    userId: userId,
    appId: appId
  };
  loading.value = true;
  await callbackByCode(data);
};

onMounted(() => {
  nextTick(() => {
    init();
  });
});
</script>
<style scoped lang="scss">
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* 或者指定一个固定高度 */
}
</style>

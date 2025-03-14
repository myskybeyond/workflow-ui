<template>
  <div id="login_container"></div>
</template>

<script setup name="dingTalkAuthQrcode">
import { ref, onMounted } from "vue";
import { generateState } from "@/api/system/social/auth";

const props = defineProps({
  appKey: {
    type: String,
    required: true
  },
  redirectUrl: {
    type: String
  },
  appCode: {
    type: String
  }
});
const emits = defineEmits(["callback"]);
// 假设你已经有了钉钉的 appKey 和 appSecret
const appKey = props.appKey || "";
const redirectUrl = props.redirectUrl || import.meta.env.VITE_APP_DOMAIN;
const stateCode = ref(null);
const handleMessage = async (event) => {
  var origin = event.origin;
  if (origin === "https://login.dingtalk.com") { //判断是否来自ddLogin扫码事件。
    const loginTmpCode = event.data;
    //获取到loginTmpCode后就可以在这里构造跳转链接进行跳转了
    const res = await generateState();
    if (res && res.code === 200) {
      stateCode.value = res.data;
    }
    // 使用代理避免跨域请求
    const dingTalkForwardUrl = `/connect/connect/oauth2/sns_authorize?appid=${appKey}&response_type=code&scope=snsapi_login&state=` + stateCode.value + `&redirect_uri=${redirectUrl}` + "&loginTmpCode=" + loginTmpCode;
    // 请求网页跳转
    const response = await fetch(dingTalkForwardUrl);
    // 解析网页302成功后的code 和 state
    const urlParams = new URLSearchParams(new URL(response.url).search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    if (code && state) {
      emits("callback", { "code": code, "state": state });
    }
  }
};
// 在组件挂载后调用生成二维码的函数
onMounted(() => {
  var obj = DDLogin({
    id: "login_container",
    goto: encodeURIComponent(`https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${appKey}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${redirectUrl}`),
    style: "border:none;background-color:#FFFFFF;",
    width: "365",
    height: "400"
  });
  if (typeof window.addEventListener != "undefined") {
    window.addEventListener("message", handleMessage);
  }
});
onUnmounted(() => {
  window.removeEventListener("message", handleMessage)
});
</script>

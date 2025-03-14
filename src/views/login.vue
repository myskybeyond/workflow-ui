<template>
  <div class="login">
    <div class="login-back-form-new">
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form-new ">
        <div style="margin: 10px;text-align: center;font-size: 20px;">工作流系统</div>
        <el-form-item prop="tenantId" v-if="tenantEnabled">
          <el-select v-model="loginForm.tenantId" filterable placeholder="请选择/输入公司名称" style="width: 100%">
            <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
            <template #prefix>
              <svg-icon icon-class="company" class="el-input__icon input-icon" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" placeholder="账号">
            <template #prefix>
              <svg-icon icon-class="user" class="el-input__icon input-icon" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" show-password size="large" auto-complete="off" placeholder="密码" @keyup.enter="handleLogin">
            <template #prefix>
              <svg-icon icon-class="password" class="el-input__icon input-icon" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaEnabled">
          <el-input v-model="loginForm.code" size="large" auto-complete="off" placeholder="验证码" style="width: 63%" @keyup.enter="handleLogin">
            <template #prefix>
              <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
            </template>
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" @click="getCode" class="login-code-img" />
          </div>
        </el-form-item>
        <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
        <el-form-item style="float: right;">
          <span style="position: relative;" v-for="(item, index) in appList" :key="item">
            <img :key="item" :src="splitImgSrc(item.appCode)" class="login-ding" @click="doSocialLogin(item.appCode)" :alt="item.appName" />
            <span
              v-if="othersShow(item.appCode)"
              :style="calcAbsoluteLeft(index)"
              @click="doSocialLogin(item.appCode)"
              >{{ item.appName ? item.appName.substring(0, 2) : item.appName }}</span
            >
          </span>
        </el-form-item>
        <el-form-item style="width:100%;">
          <el-button :loading="loading" size="large" type="primary" style="width:100%;" @click.prevent="handleLogin">
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
          <div style="float: right;" v-if="register">
            <router-link class="link-type" :to="'/register'">立即注册</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!--  底部  -->
    <div class="el-login-footer">

    </div>
  </div>
</template>

<script setup lang="ts">
import { getAppList, getCodeImg, getTenantList } from "@/api/login";
import { authBinding } from "@/api/system/social/auth";
import { useUserStore } from "@/store/modules/user";
import { LoginData, TenantVO } from "@/api/types";
import { to } from "await-to-js";
import { HttpStatus } from "@/enums/RespEnum";
import { ElMessage } from "element-plus";
import { splitImgSrc, calcAbsoluteLeft, othersShow } from "@/utils/socialUtil";

const userStore = useUserStore();
const router = useRouter();

const loginForm = ref<LoginData>({
  tenantId: "000000",
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
} as LoginData);

const loginRules: ElFormRules = {
  tenantId: [{ required: true, trigger: "blur", message: "请输入您的租户编号" }],
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 租户开关
const tenantEnabled = ref(true);
// 应用列表
const appList = ref();

// 注册开关
const register = ref(false);
const redirect = ref(undefined);
const loginRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);
watch(() => router.currentRoute.value, (newRoute: any) => {
  redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 localStorage 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        localStorage.setItem("tenantId", String(loginForm.value.tenantId));
        localStorage.setItem("username", String(loginForm.value.username));
        localStorage.setItem("password", String(loginForm.value.password));
        localStorage.setItem("rememberMe", String(loginForm.value.rememberMe));
      } else {
        // 否则移除
        localStorage.removeItem("tenantId");
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("rememberMe");
      }
      // 调用action的登录方法
      const [err] = await to(userStore.login(loginForm.value));
      if (!err) {
        await router.push({ path: redirect.value || "/" });
        loading.value = false;
      } else {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          await getCode();
        }
      }
    } else {
      console.log("error submit!", fields);
    }
  });
};

/**
 * 获取验证码
 */
const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = "data:image/gif;base64," + data.img;
    loginForm.value.uuid = data.uuid;
  }
};

const getLoginData = () => {
  const tenantId = localStorage.getItem("tenantId");
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  const rememberMe = localStorage.getItem("rememberMe");
  loginForm.value = {
    tenantId: tenantId === null ? String(loginForm.value.tenantId) : tenantId,
    username: username === null ? String(loginForm.value.username) : username,
    password: password === null ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === null ? false : Boolean(rememberMe)
  } as LoginData;
};

const getApps = async () => {
  const res = await getAppList();
  if (res) {
    appList.value = res.data;
  }
};

/**
 * 获取租户列表
 */
const initTenantList = async () => {
  const { data } = await getTenantList();
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      loginForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
};

//检测租户选择框的变化
watch(() => loginForm.value.tenantId, () => {
  localStorage.setItem("tenantId", String(loginForm.value.tenantId));
});

/**
 * 第三方登录
 * @param type
 */
const doSocialLogin = (type: string) => {
  authBinding(type).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      // 处理页面变量路由传参
      const bindAuthUrl = res.data.replace(/{params}/g, "");
      // 获取授权地址跳转
      window.location.href = bindAuthUrl;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

onMounted(() => {
  getCode();
  initTenantList();
  getLoginData();
  getApps();
});
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-back.png");
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial, serif;
  font-size: 12px;
  letter-spacing: 1px;
}

.login-code-img {
  height: 40px;
  padding-left: 12px;
}

.login-back-form-new {
  background-image: url("../assets/images/login-form.png");
  width: 1000px;
  height: 487px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
}

.login-form-new {
  margin-left: 500px;
  border-radius: 6px;
  width: 400px;
  // padding: 25px 25px 5px 25px;
  padding: 0px 25px 5px 25px;

  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

.login-logo {
  display: grid;
  margin: 0px auto 20px auto;
  width: 189px;
  height: 33px;
  align: center;
  justify-content: center;
}

.login-title {
  display: grid;
  margin: 0px auto 40px auto;
  width: 242px;
  height: 28px;
}

.login-ding {
  width: 42px;
  height: 24px;
  margin: 0px 2px 0px 0px;

}
</style>

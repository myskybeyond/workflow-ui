<template>
  <div class="p-2">
    <div v-if="useUserStore().forceResetPass" class="warning_msg_info">{{ warningMsg }}</div>
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template v-slot:header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />
                用户名称
                <div class="pull-right">{{ state.user.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />
                手机号码
                <div class="pull-right">{{ state.user.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />
                用户邮箱
                <div class="pull-right">{{ state.user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />
                所属部门
                <div class="pull-right" v-if="state.user.dept">{{ state.user.dept.deptName }} / {{ state.postGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />
                所属角色
                <div class="pull-right">{{ state.roleGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />
                创建日期
                <div class="pull-right">{{ state.user.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template v-slot:header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="userForm" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
            <el-tab-pane label="第三方应用" name="thirdParty">
              <thirdParty :auths="state.auths" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Profile" lang="ts">
import UserAvatar from "./userAvatar.vue";
import UserInfo from "./userInfo.vue";
import ResetPwd from "./resetPwd.vue";
import ThirdParty from "./thirdParty.vue";
import { getAuthList } from "@/api/system/social/auth";
import { getUserProfile } from "@/api/system/user";
import { EventBus } from "@/views/excel/components/event-bus";
import useUserStore from "@/store/modules/user";

const warningMsg = ref("新用户初次登录或用户密码被重置后必须修改密码，请修改密码后使用!!!");
const activeTab = computed(() => useUserStore().forceResetPass ? "resetPwd" : "userinfo");
const state = ref<Record<string, any>>({
  user: {},
  roleGroup: "",
  postGroup: "",
  auths: []
});

const userForm = ref({});

const getUser = async () => {
  const res = await getUserProfile();
  state.value.user = res.data.user;
  userForm.value = { ...res.data.user };
  state.value.roleGroup = res.data.roleGroup;
  state.value.postGroup = res.data.postGroup;
};

const getAuths = async () => {
  const res = await getAuthList();
  state.value.auths = res.data;
};
const onMessageReceived = (message: any) => {
  console.log("Message received:", message);
  getAuths();
};
onMounted(() => {
  EventBus.$on("refreshAuthsEvent", onMessageReceived);
  getUser();
  getAuths();
});
onBeforeUnmount(() => {
  EventBus.$off("refreshAuthsEvent", onMessageReceived);
});
computed(() => {

});
onBeforeRouteLeave((to, from, next) => {
  if (useUserStore().forceResetPass) {
    next(false);
  } else {
    next();
  }
});
</script>
<style scoped lang="scss">
.warning_msg_info {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: red;
  font-weight: bold;
  min-height: 50px;
}
</style>

<template>
  <el-row v-loading="loading">
    <el-scrollbar style="width: 100%;height: 320px" v-if="dataList.length">
      <div v-for="(item,index) in dataList" :kye="index" @click="hendleMessage(item)"
           style="cursor: pointer;">
        <div style="width: 100%;background-color: white; display: flex;align-items: center;">
          <img :src="item.avatar" class="user-avatar" style="margin:7px 10px 6px 0px"/>
          <!--        <img src="@/assets/images/profile.jpg" class="user-avatar" style="margin:10px 10px 10px 0px"/>-->
          <div style="flex: 3">
            <h3 style="margin: 0 0 0 0;font-weight: bold;font-size: 15px; display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* 限制在两行以内 */
  overflow: hidden;
  text-overflow: ellipsis; /* 显示省略号 */">{{ item.content }}</h3>
            <div style="margin-top: 5px;font-size: 10px;color: gray;"><span>{{ getuserName(item) }}  {{
                item.createTime
              }}</span></div>
          </div>
          <dict-tag :options="msg_read_status" :value="item.isRead"/>
        </div>
        <el-divider style="margin:0 0 0 0"/>
      </div>
    </el-scrollbar>
  </el-row>
  <div style="width: 100%;height: 320px" v-if="!dataList.length">
    <el-empty image-size="20"/>
  </div>
  <!-- 消息历史记录对话框 -->
  <el-dialog title="详情" v-model="dialog.visible" width="800px" append-to-body @close="closeDialog">
    <div style="margin: 0 10px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="项目名称:">
            {{ form.projectName }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售订单名称:">
            {{ form.orderName }}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="流程名称:">
            {{ form.procName }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="节点名称:"> {{}}</el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="来源用户名称:">
            {{ getUserNameById(form.sourceUserId) }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="接收用户名称:">
            {{ getUserNameById(form.userId) }}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="消息内容:" style="width: 620px;">
            <el-input type="textarea" v-model="form.content" disabled/>
          </el-form-item>
        </el-col>
        <el-col></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"> 创建时间：{{ form.createTime }}</el-col>
      </el-row>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="hendleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="XiaoXi" lang="ts">
import {defineEmits, defineProps, ref} from "vue";
import {getSmsInfo, listMySmsInfo, markRead} from "@/api/business/smsInfo";
import useUserStore from "@/store/modules/user";
import {UserVO} from "@/api/system/user/types";
import {getAvatar} from "@/api/login";
import imagePath from '@/assets/images/system.svg';
import {getUserNameById} from "@/utils/userCommonUtil";
import defAva from '@/assets/images/profile.jpg';

const router = useRouter();
const userStore = useUserStore();
const dialog = ref({
  visible: false
})

const form = ref({});
const userSelectOptions = ref<UserVO[]>();

const {proxy} = getCurrentInstance() as ComponentInternalInstance;
const {msg_read_status} = toRefs<any>(proxy?.useDict("msg_read_status"));

const loading = ref(true);
const dataList = ref([]);

const queryParams = ref({
  pageNum: 1,
  pageSize: 5,
});
const props = defineProps({
  reload: {default: ''}
});

const reloadT = computed(() => props.reload);
watch(reloadT, (n) => {
  getList();
})

const emit = defineEmits(['backData']);

onMounted(() => {
  getList();
})

function closeDialog() {
  getList()
}

function hendleClose() {
  dialog.value.visible = false
}

async function getList() {
  loading.value = true;
  await listMySmsInfo({...queryParams.value, userId: userStore.userId}).then(async (res) => {
    for (let item of res.rows) {
      if (item.sourceUserId) {
        var data = await getAvatar(item.sourceUserId)
        var userName = await getUserNameById(item.sourceUserId)
        if (data.data)
          item.avatar = data.data;
        else item.avatar = defAva;
        item.userName = userName;
      } else {
        item.avatar = imagePath;
      }
    }
    dataList.value = res.rows;
    emit('backData', res.total);
  }).finally(() => {
    loading.value = false;
  });
}

async function hendleMessage(row: any) {
  loading.value = true
  const res = await getSmsInfo(row.id);
  await markRead(row.id);
  Object.assign(form.value, res.data);
  dialog.value.visible = true;
  loading.value = false;
}

const getuserName = (row: any) => {
  if (row.sourceUserId) {
    return row.userName;
  } else {
    return "系统消息"
  }
}
</script>

<style scoped>
.user-avatar {
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 25px;
}
</style>

<template>
  <div class="app-container" v-loading="loading">
    <el-tabs tab-position="top" v-model="activeTab">
      <el-tab-pane label="任务办理" name="approval" v-if="processed === true">
        <el-card class="box-card" shadow="hover" v-if="taskFormOpen">
          <template #header>
            <div class="clearfix">
              <span>填写表单</span>
            </div>
          </template>
          <el-col :span="20" :offset="2">
            <!--            @submit="submit"-->
            <form-render :form-conf="taskFormData" ref="formRenderRef" />
          </el-col>
        </el-card>
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>审批流程</span>
            </div>
          </template>
          <el-row>
            <el-col :span="20" :offset="2">
              <el-form ref="taskForm" :model="taskForm" :rules="rules" label-width="120px">
                <el-form-item label="快捷办理">
                  <el-tag
                    v-for="dict in wf_task_quick_advise.wf_task_quick_advise"
                    :key="dict.value"
                    effect="dark"
                    @click="quickInputComment(dict.label)"
                    style="cursor: pointer;"
                    >{{ dict.label }}
                  </el-tag>
                </el-form-item>
                <el-form-item label="审批意见" prop="comment">
                  <el-input type="textarea" :rows="5" v-model="taskForm.comment" placeholder="请输入 审批意见" />
                </el-form-item>
                <el-form-item label="抄送人" prop="copyUserIds">
                  <el-tag :key="index" v-for="(item, index) in copyUser" closable :disable-transitions="false" @close="handleClose('copy', item)">
                    {{ item.nickName }}
                  </el-tag>
                  <el-button class="button-new-tag" type="primary" icon="Plus" size="small" circle @click="onSelectCopyUsers" />
                </el-form-item>
<!--                <el-form-item label="指定审批人" prop="copyUserIds">-->
<!--                  <el-tag :key="index" v-for="(item, index) in nextUser" closable :disable-transitions="false" @close="handleClose('next', item)">-->
<!--                    {{ item.nickName }}-->
<!--                  </el-tag>-->
<!--                  <el-button class="button-new-tag" type="primary" icon="Plus" size="small" circle @click="onSelectNextUsers" />-->
<!--                </el-form-item>-->
              </el-form>
            </el-col>
          </el-row>
          <el-row :gutter="10" type="flex" justify="center">
            <el-col :span="1.5">
              <el-button icon="CircleCheck" type="success" @click="handleComplete">通过</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button icon="ChatDotSquare" type="primary" @click="handleDelegate">委派</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button icon="Pointer" type="success" @click="handleTransfer">转办</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button icon="RefreshLeft" type="warning" @click="handleReturn">退回</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button icon="CircleClose" type="danger" @click="handleReject">拒绝</el-button>
            </el-col>
          </el-row>
        </el-card>
        <div>
          <h2>说明：</h2>
          <h3>委派：用户A将任务委派给用户B，B处理后，任务再回到用户A处理</h3>
          <h3>转办：用户A将任务转办给用户B，B处理后，任务流转到流程的下一节点</h3>
        </div>
      </el-tab-pane>

      <el-tab-pane label="表单信息" name="form">
        <div v-if="formOpen">
          <el-card class="box-card" shadow="never" v-for="(formInfo, index) in processFormList" :key="index">
            <template #header>
              <div class="clearfix">
                <span>{{ formInfo.title }}</span>
              </div>
            </template>
            <!--流程处理表单模块-->
            <el-col :span="20" :offset="2">
              <form-render :form-conf="formInfo" />
            </el-col>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="流转记录" name="record">
        <el-card class="box-card" shadow="never">
          <el-col :span="20" :offset="2">
            <div class="block">
              <el-timeline>
                <el-timeline-item
                  v-for="(item,index) in historyProcNodeList"
                  :key="index"
                  :icon="setIcon(item.endTime)"
                  :color="setColor(item.endTime)"
                >
                  <p style="font-weight: 700">{{ item.activityName }}</p>
                  <el-card v-if="item.activityType === 'startEvent'" class="box-card" shadow="hover">
                    {{ item.assigneeName }} 在 {{ item.createTime }} 发起流程
                  </el-card>
                  <el-card v-if="item.activityType === 'userTask'" class="box-card" shadow="hover">
                    <el-descriptions :column="5" :labelStyle="{'font-weight': 'bold'}">
                      <el-descriptions-item label="实际办理">{{ item.assigneeName || "-" }}</el-descriptions-item>
                      <el-descriptions-item label="候选办理">{{ item.candidate || "-" }}</el-descriptions-item>
                      <el-descriptions-item label="接收时间">{{ item.createTime || "-" }}</el-descriptions-item>
                      <el-descriptions-item label="办结时间">{{ item.endTime || "-" }}</el-descriptions-item>
                      <el-descriptions-item label="耗时">{{ item.duration || "-" }}</el-descriptions-item>
                    </el-descriptions>
                    <div v-if="item.commentList && item.commentList.length > 0">
                      <div v-for="(comment, index) in item.commentList" :key="index">
                        <el-divider content-position="left">
                          <el-tag :type="approveTypeTag(comment.type)" size="small">{{ commentType(comment.type) }} </el-tag>
                          <el-tag type="info" effect="plain" size="small">{{ comment.time }}</el-tag>
                        </el-divider>
                        <span>{{ comment.fullMessage }}</span>
                      </div>
                    </div>
                  </el-card>
                  <el-card v-if="item.activityType === 'endEvent'" class="box-card" shadow="hover">
                    {{ item.createTime
                    }}
                    结束流程
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-col>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="流程跟踪" name="track">
        <el-card class="box-card" shadow="never">
          <process-viewer
            :key="`designer-${loadIndex}`"
            :style="'height:' + height"
            :xml="xmlData"
            :finishedInfo="finishedInfo"
            :allCommentList="historyProcNodeList"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!--退回流程-->
    <el-dialog :title="returnTitle" v-model="returnOpen" width="40%" append-to-body>
      <el-form ref="taskForm" :model="taskForm" label-width="80px">
        <el-form-item label="退回节点" prop="targetKey">
          <el-radio-group v-model="taskForm.targetKey">
            <el-radio-button v-for="item in returnTaskList" :key="item.id" :label="item.id">{{ item.name }} </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="returnOpen = false">取 消</el-button>
          <el-button type="primary" @click="submitReturn">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <select-dept-user
      ref="showSelectedTableRef"
      :title="userData.title"
      :key="userData.title"
      :show-user-panel="userData.open"
      :user-data-type="userData.type"
      :checked-users="userMultipleSelection"
      @selectedUserIds="selectedUserIds"
      @openOrClose="openOrClose"
      @selectedUserId="selectedUserId"
    />
  </div>
</template>

<script>
import { detailProcess } from "@/api/workflow/work/process";
import { complete, delegate, transfer, rejectTask, returnList, returnTask } from "@/api/workflow/work/task";
import ProcessViewer from "@/components/ProcessViewer";
import FormRender from "@/views/workflow/form/form-render.vue";
import { useDict } from "@/utils/dict";
import SelectDeptUser from "@/views/workflow/components/selectDeptUser.vue";
export default {
  name: "todoDetail",
  components: {
    FormRender,
    ProcessViewer,
    SelectDeptUser
  },
  props: {},
  computed: {
    commentType() {
      return val => {
        switch (val) {
          case "1":
            return "通过";
          case "2":
            return "退回";
          case "3":
            return "驳回";
          case "4":
            return "委派";
          case "5":
            return "转办";
          case "6":
            return "终止";
          case "7":
            return "撤回";
          case "8":
            return "跳转";
          case "9":
            return "激活";
          case "10":
            return "挂起";
        }
      };
    },
    approveTypeTag() {
      return val => {
        switch (val) {
          case "1":
            return "success";
          case "2":
            return "warning";
          case "3":
            return "danger";
          // case '4': return 'primary'
          case "4":
            return "";
          case "5":
            return "success";
          case "6":
            return "danger";
          case "7":
            return "info";
          case "8":
            return "danger";
          case "9":
            return "warning";
          case "10":
            return "warning";
        }
      };
    }
  },
  data() {
    return {
      height: document.documentElement.clientHeight - 205 + "px;",
      // 模型xml数据
      loadIndex: 0,
      xmlData: undefined,
      finishedInfo: {
        finishedSequenceFlowSet: [],
        finishedTaskSet: [],
        unfinishedTaskSet: [],
        rejectedTaskSet: []
      },
      historyProcNodeList: [],
      // 遮罩层
      loading: true,
      taskForm: {
        comment: "", // 意见内容
        procInsId: "", // 流程实例编号
        taskId: "",// 流程任务编号
        copyUserIds: "", // 抄送人Id
        vars: "",
        targetKey: "",
        quickComment: ""
      },
      rules: {
        comment: [{ required: true, message: "请输入审批意见", trigger: "blur" }]
      },
      currentUserId: null,
      variables: [], // 流程变量数据
      taskFormOpen: false,
      taskFormData: {}, // 流程变量数据
      processFormList: [], // 流程变量数据
      formOpen: false, // 是否加载流程变量数据
      returnTaskList: [],  // 回退列表数据
      processed: false,
      returnTitle: undefined,
      returnOpen: false,
      rejectOpen: false,
      rejectTitle: null,
      userData: {
        title: "",
        type: "",
        open: false
      },
      copyUser: [],
      nextUser: [],
      userMultipleSelection: [],
      wf_task_quick_advise: this.useDict("wf_task_quick_advise"),
      activeTab: 'approval'
    };
  },
  mounted() {
    this.initData();
  },
  watch: {
    userMultipleSelection: {
      immediate: true,
      handler(val) {
      }
    }
  },
  methods: {
    useDict,
    async initData() {
      this.taskForm.procInsId = this.$route.params && this.$route.params.procInsId;
      this.taskForm.taskId = this.$route.query && this.$route.query.taskId;
      this.processed = this.$route.query && eval(this.$route.query.processed || false);
      // 流程任务重获取变量表单
      await this.getProcessDetails(this.taskForm.procInsId, this.taskForm.taskId);
      this.loadIndex = this.taskForm.procInsId;
      this.loading = false;
      this.activeTab = this.processed ? "approval" : "form";
    },
    setIcon(val) {
      if (val) {
        return "el-icon-check";
      } else {
        return "el-icon-time";
      }
    },
    setColor(val) {
      if (val) {
        return "#2bc418";
      } else {
        return "#b3bdbb";
      }
    },
    // 关闭标签
    handleClose(type, tag) {
      let userObj = this.userMultipleSelection.find(item => item.userId === tag.id);
      this.userMultipleSelection.splice(this.userMultipleSelection.indexOf(userObj), 1);
      if (type === "copy") {
        this.copyUser = this.userMultipleSelection;
        // 设置抄送人ID
        if (this.copyUser && this.copyUser.length > 0) {
          const val = this.copyUser.map(item => item.id);
          this.taskForm.copyUserIds = val instanceof Array ? val.join(",") : val;
        } else {
          this.taskForm.copyUserIds = "";
        }
      } else if (type === "next") {
        this.nextUser = this.userMultipleSelection;
        // 设置抄送人ID
        if (this.nextUser && this.nextUser.length > 0) {
          const val = this.nextUser.map(item => item.id);
          this.taskForm.nextUserIds = val instanceof Array ? val.join(",") : val;
        } else {
          this.taskForm.nextUserIds = "";
        }
      }
    },
    async getProcessDetails(procInsId, taskId) {
      const params = { procInsId: procInsId, taskId: taskId };
      await detailProcess(params).then(res => {
        const data = res.data;
        this.xmlData = data.bpmnXml;
        this.processFormList = data.processFormList;
        this.taskFormOpen = data.existTaskForm;
        if (this.taskFormOpen) {
          this.taskFormData = data.taskFormData;
        }
        this.historyProcNodeList = data.historyProcNodeList;
        this.finishedInfo = data.flowViewer;
        this.formOpen = true;
      });
    },
    onSelectCopyUsers() {
      this.userMultipleSelection = this.copyUser;
      this.onSelectUsers("添加抄送人", "copy");
    },
    onSelectNextUsers() {
      this.userMultipleSelection = this.nextUser;
      this.onSelectUsers("指定审批人", "next");
    },
    onSelectUsers(title, type) {
      this.userData.title = title;
      this.userData.type = type;
      this.userData.open = true;
    },
    /** 通过任务 */
    async handleComplete() {
      try {
        this.loading = true;
        // 校验表单
        const taskFormRef = this.$refs.formRenderRef;
        const isExistTaskForm = taskFormRef !== undefined;
        const taskFormPromise = isExistTaskForm ? taskFormRef.validateForm() : await Promise.resolve();
        const approvalPromise = new Promise((resolve, reject) => {
          this.$refs["taskForm"].validate(valid => {
            valid ? resolve() : reject();
          });
        });
        await Promise.all([taskFormPromise, approvalPromise]);
        if (isExistTaskForm) {
          this.taskForm.variables = taskFormRef.getFormValue();
        }
        complete(this.taskForm).then(response => {
          this.loading = false;
          this.$modal.msgSuccess(response.msg);
          this.goBack();
        });
      } catch (error) {
        this.loading = false;
      }
    },
    /** 委派任务 */
    handleDelegate() {
      this.$refs["taskForm"].validate(valid => {
        if (valid) {
          this.userData.type = "delegate";
          this.userData.title = "委派任务";
          this.userData.open = true;
        }
      });
    },
    /** 转办任务 */
    handleTransfer() {
      this.$refs["taskForm"].validate(valid => {
        if (valid) {
          this.userData.type = "transfer";
          this.userData.title = "转办任务";
          this.userData.open = true;
        }
      });
    },
    /** 拒绝任务 */
    handleReject() {
      this.$refs["taskForm"].validate(valid => {
        if (valid) {
          const _this = this;
          this.$modal.confirm("拒绝审批单流程会终止，是否继续？").then(function() {
            return rejectTask(_this.taskForm);
          }).then(res => {
            this.$modal.msgSuccess(res.msg);
            this.goBack();
          });
        }
      });
    },
    /** 返回页面 */
    goBack() {
      // 关闭当前标签页并返回上个页面
      this.$tab.closePage(this.$route);
      // 判断是从首页办理还是从待办任务办理同意跳会我的已办
      this.$router.push({
        path: '/work/finished'
      });
    },
    /** 可退回任务列表 */
    handleReturn() {
      this.$refs["taskForm"].validate(valid => {
        if (valid) {
          this.returnTitle = "退回流程";
          returnList(this.taskForm).then(res => {
            this.returnTaskList = res.data;
            this.taskForm.values = null;
            this.returnOpen = true;
          });
        }
      });

    },
    /** 提交退回任务 */
    submitReturn() {
      this.$refs["taskForm"].validate(valid => {
        if (valid) {
          if (!this.taskForm.targetKey) {
            this.$modal.msgError("请选择退回节点！");
          }
          returnTask(this.taskForm).then(res => {
            this.$modal.msgSuccess(res.msg);
            this.returnOpen = false;
            this.goBack();
          });
        }
      });
    },
    quickInputComment(val) {
      this.taskForm.comment = this.taskForm.comment.concat(val);
    },
    openOrClose(val) {
      this.userData.open = val;
    },
    selectedUserIds(val1, val2) {
      this.userMultipleSelection = val2;
      let type = this.userData.type;
      if (type === "copy" || type === "next") {
        if (!val2 || val2.length <= 0) {
          this.$modal.msgError("请选择用户");
          return false;
        }
        let userIds = val2.map(k => k.userId);
        if (type === "copy") {
          // 设置抄送人ID信息
          this.copyUser = val2;
          this.taskForm.copyUserIds = userIds instanceof Array ? userIds.join(",") : userIds;
        } else if (type === "next") {
          // 设置下一级审批人ID信息
          this.nextUser = val2;
          this.taskForm.nextUserIds = userIds instanceof Array ? userIds.join(",") : userIds;
        }
        this.userData.open = false;
      }
    },
    selectedUserId(val) {
      this.currentUserId = val;
      let type = this.userData.type;
      if (!this.taskForm.comment) {
        this.$modal.msgError("请输入审批意见");
        return false;
      }
      if (!this.currentUserId) {
        this.$modal.msgError("请选择用户");
        return false;
      }
      this.taskForm.userId = this.currentUserId;
      if (type === "delegate") {
        delegate(this.taskForm).then(res => {
          this.userData.open = false;
          this.$modal.msgSuccess(res.msg);
          this.goBack();
        });
      }
      if (type === "transfer") {
        transfer(this.taskForm).then(res => {
          this.userData.open = false;
          this.$modal.msgSuccess(res.msg);
          this.goBack();
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.box-card {
  width: 100%;
  margin-bottom: 20px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
}

.button-new-tag {
  margin-left: 10px;
}
</style>

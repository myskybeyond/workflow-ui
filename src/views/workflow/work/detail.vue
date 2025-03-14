<template>
  <div class="app-container" v-loading="loading">
    <el-tabs tab-position="top" v-model="activeTab">
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
                      <el-descriptions-item label="实际办理">{{ item.assigneeName || '-'}}</el-descriptions-item>
                      <el-descriptions-item label="候选办理">{{ item.candidate || '-'}}</el-descriptions-item>
                      <el-descriptions-item label="接收时间">{{ item.createTime || '-'}}</el-descriptions-item>
                      <el-descriptions-item label="办结时间">{{ item.endTime || '-' }}</el-descriptions-item>
                      <el-descriptions-item label="耗时">{{ item.duration || '-'}}</el-descriptions-item>
                    </el-descriptions>
                    <div v-if="item.commentList && item.commentList.length > 0">
                      <div v-for="(comment, index) in item.commentList" :key="index">
                        <el-divider content-position="left">
                          <el-tag :type="approveTypeTag(comment.type)" size="small">{{ commentType(comment.type) }}</el-tag>
                          <el-tag type="info" effect="plain" size="small">{{ comment.time }}</el-tag>
                        </el-divider>
                        <span>{{ comment.fullMessage }}</span>
                      </div>
                    </div>
                  </el-card>
                  <el-card v-if="item.activityType === 'endEvent'" class="box-card" shadow="hover"> {{ item.createTime }} 结束流程 </el-card>
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
  </div>
</template>

<script>
import { detailProcess } from '@/api/workflow/work/process'
import ProcessViewer from '@/components/ProcessViewer'
import FormRender from "@/views/workflow/form/form-render.vue";
import { useDict } from "@/utils/dict";

export default {
  name: "WorkDetail",
  components: {
    FormRender,
    ProcessViewer
  },
  props: {},
  computed: {
    commentType() {
      return val => {
        switch (val) {
          case '1': return '通过'
          case '2': return '退回'
          case '3': return '驳回'
          case '4': return '委派'
          case '5': return '转办'
          case '6': return '终止'
          case '7': return '撤回'
          case '8': return '跳转'
          case '9': return '激活'
          case '10': return '挂起'
        }
      }
    },
    approveTypeTag() {
      return val => {
        switch (val) {
          case '1': return 'success'
          case '2': return 'warning'
          case '3': return 'danger'
          // case '4': return 'primary'
          case '4': return ''
          case '5': return 'success'
          case '6': return 'danger'
          case '7': return 'info'
          case '8': return 'danger'
          case '9': return 'warning'
          case '10': return 'warning'
        }
      }
    }
  },
  data() {
    return {
      height: document.documentElement.clientHeight - 205 + 'px;',
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
      taskForm:{
        comment:"", // 意见内容
        procInsId: "", // 流程实例编号
        taskId: "" ,// 流程任务编号
        copyUserIds: "", // 抄送人Id
        vars: "",
        targetKey:"",
        quickComment: ''
      },
      taskFormOpen: false,
      taskFormData: {}, // 流程变量数据
      processFormList: [], // 流程变量数据
      formOpen: false, // 是否加载流程变量数据
      processed: false,
      wf_task_quick_advise : this.useDict("wf_task_quick_advise"),
      activeTab: 'approval'
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    useDict,
    async initData() {
      this.taskForm.procInsId = this.$route.params && this.$route.params.procInsId;
      this.taskForm.taskId  = this.$route.query && this.$route.query.taskId;
      this.processed = this.$route.query && eval(this.$route.query.processed || false);
      // 流程任务重获取变量表单
      await this.getProcessDetails(this.taskForm.procInsId, this.taskForm.taskId);
      this.loadIndex = this.taskForm.procInsId;
      this.loading = false;
      this.activeTab = this.processed ? "approval" : "form";
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
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
    async getProcessDetails(procInsId, taskId) {
      const params = {procInsId: procInsId, taskId: taskId}
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
        this.formOpen = true
      })
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

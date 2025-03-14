<template>
  <div class="process-panel__container" :style="{ width: `${this.width}px` }">
    <el-collapse v-model="activeTab">
      <el-collapse-item name="base">
        <template #title>
          <div class="panel-tab__title">
            <i><InfoFilled class="panel-tab-icon__title" /></i>常规
          </div>
        </template>
        <element-base-info :id-edit-disabled="idEditDisabled" :business-object="elementBusinessObject" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="condition" v-if="elementType === 'Process'" key="message">
        <template #title>
          <div class="panel-tab__title">
            <i><Comment class="panel-tab-icon__title" /></i>消息与信号
          </div>
        </template>
        <signal-and-massage />
      </el-collapse-item>
      <el-collapse-item name="condition" v-if="conditionFormVisible" key="condition">
        <template #title>
          <div class="panel-tab__title">
            <i><Promotion class="panel-tab-icon__title" /> </i>流转条件
          </div>
        </template>
        <flow-condition :business-object="elementBusinessObject" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="condition" v-if="formVisible" key="form">
        <template #title>
          <div class="panel-tab__title">
            <i><svg-icon icon-class="form" class="panel-tab-icon__title_svg"></svg-icon> </i>表单
          </div>
        </template>
        <element-form :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="task" v-if="elementType.indexOf('Task') !== -1" key="task">
        <template #title>
          <div class="panel-tab__title">
            <i> <svg-icon icon-class="task" class="panel-tab-icon__title_svg"></svg-icon> </i>任务
          </div>
        </template>
        <element-task :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="multiInstance" v-if="elementType.indexOf('Task') !== -1 && elementType !== 'UserTask'" key="multiInstance">
        <template #title>
          <div class="panel-tab__title">
            <i><HelpFilled class="panel-tab-icon__title" /></i>多实例
          </div>
        </template>
        <element-multi-instance :business-object="elementBusinessObject" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="listeners" key="listeners">
        <template #title>
          <div class="panel-tab__title">
            <i> <BellFilled class="panel-tab-icon__title" /> </i>执行监听器
          </div>
        </template>
        <element-listeners :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="taskListeners" v-if="elementType === 'UserTask'" key="taskListeners">
        <template #title>
          <div class="panel-tab__title">
            <i><BellFilled class="panel-tab-icon__title" /></i>任务监听器
          </div>
        </template>
        <user-task-listeners :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="extensions" key="extensions">
        <template #title>
          <div class="panel-tab__title">
            <i> <CirclePlusFilled class="panel-tab-icon__title" /> </i>扩展属性
          </div>
        </template>
        <element-properties :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="other" key="other">
        <template #title>
          <div class="panel-tab__title">
            <i> <Promotion class="panel-tab-icon__title" /> </i>其他
          </div>
        </template>
        <element-other-config :id="elementId" />
      </el-collapse-item>
      <el-collapse-item name="message" v-if="elementType.indexOf('Task') !== -1" key="message">
        <template #title>
          <div class="panel-tab__title">
            <i><Comment class="panel-tab-icon__title" /></i>抄送设置
          </div>
        </template>
        <copy-setting-of-user-task :id="elementId" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import ElementBaseInfo from "./base/ElementBaseInfo";
import ElementOtherConfig from "./other/ElementOtherConfig";
import ElementTask from "./task/ElementTask";
import ElementMultiInstance from "./multi-instance/ElementMultiInstance";
import FlowCondition from "./flow-condition/FlowCondition";
import SignalAndMassage from "./signal-message/SignalAndMessage";
import ElementListeners from "./listeners/ElementListeners";
import ElementProperties from "./properties/ElementProperties";
import ElementForm from "./form/ElementForm";
import UserTaskListeners from "./listeners/UserTaskListeners";
import CopySettingOfUserTask from "@/views/workflow/model/components/copySettingOfUserTask.vue";
import {
  BellFilled,
  CirclePlusFilled,
  Comment,
  HelpFilled,
  InfoFilled,
  Promotion
} from "@element-plus/icons-vue";
import { createListenerObject, updateElementExtensions } from "@/plugins/package/utils";
/**
 * 侧边栏
 * @Author MiyueFE
 * @Home https://github.com/miyuesc
 * @Date 2021年3月31日18:57:51
 */
export default {
  name: "BpmnPropertiesPanel",
  components: {
    HelpFilled,
    CirclePlusFilled,
    BellFilled,
    Promotion,
    Comment,
    InfoFilled,
    UserTaskListeners,
    ElementForm,
    ElementProperties,
    ElementListeners,
    SignalAndMassage,
    FlowCondition,
    ElementMultiInstance,
    ElementTask,
    ElementOtherConfig,
    ElementBaseInfo,
    CopySettingOfUserTask
  },
  componentName: "BpmnPropertiesPanel",
  props: {
    bpmnModeler: Object,
    prefix: {
      type: String,
      default: "camunda"
    },
    width: {
      type: Number,
      default: 480
    },
    idEditDisabled: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      prefix: this.prefix,
      width: this.width
    };
  },
  data() {
    return {
      activeTab: "base",
      elementId: "",
      elementType: "",
      elementBusinessObject: {}, // 元素 businessObject 镜像，提供给需要做判断的组件使用
      conditionFormVisible: false, // 流转条件设置
      formVisible: false // 表单配置
    };
  },
  watch: {
    elementId: {
      handler() {
        this.activeTab = "base";
      }
    }
  },
  created() {
    this.initModels();
  },
  methods: {
    initModels() {
      // 初始化 modeler 以及其他 moddle
      if (!this.bpmnModeler) {
        // 避免加载时 流程图 并未加载完成
        this.timer = setTimeout(() => this.initModels(), 10);
        return;
      }
      if (this.timer) clearTimeout(this.timer);
      window.bpmnInstances = {
        modeler: this.bpmnModeler,
        modeling: this.bpmnModeler.get("modeling"),
        moddle: this.bpmnModeler.get("moddle"),
        eventBus: this.bpmnModeler.get("eventBus"),
        bpmnFactory: this.bpmnModeler.get("bpmnFactory"),
        elementFactory: this.bpmnModeler.get("elementFactory"),
        elementRegistry: this.bpmnModeler.get("elementRegistry"),
        replace: this.bpmnModeler.get("replace"),
        selection: this.bpmnModeler.get("selection")
      };
      this.getActiveElement();
    },
    getActiveElement() {
      // 初始第一个选中元素 bpmn:Process
      this.initFormOnChanged(null);
      this.bpmnModeler.on("import.done", e => {
        this.initFormOnChanged(null);
      });
      // 监听选择事件，修改当前激活的元素以及表单
      this.bpmnModeler.on("selection.changed", ({ newSelection }) => {
        this.initFormOnChanged(newSelection[0] || null);
      });
      this.bpmnModeler.on("element.changed", ({ element }) => {
        // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
        if (element && element.id === this.elementId) {
          this.initFormOnChanged(element);
        }
      });
    },
    // 初始化数据
    initFormOnChanged(element) {
      let activatedElement = element;
      if (!activatedElement) {
        activatedElement =
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Process") ??
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Collaboration");
      }
      if (!activatedElement) return;
      /**
       * 调试查看元素属性时可以放开此代码
       * console.log(`
       *               ----------
       *       select element changed:
       *                 id:  ${activatedElement.id}
       *               type:  ${activatedElement.businessObject.$type}
       *               ----------
       *               `);
       */
      window.bpmnInstances.bpmnElement = activatedElement;
      this.bpmnElement = activatedElement;
      this.elementId = activatedElement.id;
      this.elementType = activatedElement.type.split(":")[1] || "";
      this.elementBusinessObject = JSON.parse(JSON.stringify(activatedElement.businessObject));
      this.conditionFormVisible = !!(
        this.elementType === "SequenceFlow" &&
        activatedElement.source &&
        activatedElement.source.type.indexOf("StartEvent") === -1
      );
      this.formVisible = this.elementType === "UserTask" || this.elementType === "StartEvent";
      // 触发用户任务自动添加消息监听器动作
      this.userTaskAutoAddTaskListener(activatedElement.businessObject);
    },
    beforeDestroy() {
      window.bpmnInstances = null;
    },
    /**
     * 用户任务自动添加消息通知指定监听器
     */
    userTaskAutoAddTaskListener(businessObject) {
      if(businessObject.$type === 'bpmn:UserTask') {
        const extensionElements = businessObject.extensionElements;
        if(extensionElements) {
          if(extensionElements.values) {
            const _extensionElementsArray = extensionElements.values;
            const _userTask_listener_message = _extensionElementsArray.find(_ext => _ext.$type === messageListener.$type &&  _ext.class === messageListener.class && _ext.event === messageListener.event);
            if(!_userTask_listener_message) {
              this.addMessageListener(businessObject);
            }
          }else {
            console.warn('extensionElements.values不存在,这种情况应该不存在,暂不处理...')
          }
        }else {
          this.addMessageListener(businessObject);
        }
      }
    },
    addMessageListener(businessObject) {
      const otherExtensionList = businessObject.extensionElements?.values?.filter(ex => ex.$type !== `${this.prefix}:TaskListener`) ?? [];
      const listenerObject = createListenerObject(messageListener, true, this.prefix);
      updateElementExtensions(this.bpmnElement, otherExtensionList.concat(listenerObject));
    }
  }
};
const messageListener = {
  $type: 'flowable:TaskListener',
  class: 'com.hdsolartech.flowable.listener.RemainUserTaskListener',
  event: 'create',
  listenerType: 'classListener'
}
</script>

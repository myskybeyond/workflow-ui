<template>
  <div class="panel-tab__content">
    <el-form label-width="90px" @submit.prevent>
      <el-form-item label="表单" prop="formKey">
        <el-select v-model="formKey" placeholder="请选择表单" @change="updateElementFormKey" clearable filterable>
          <el-option v-for="item in formOptions" :key="item.formId" :label="item.formName" :value="`key_${item.formId}`" />
        </el-select>
      </el-form-item>
<!--      <el-form-item prop="localScope">-->
<!--        <template #label>-->
<!--          <el-tooltip content="若为节点表单，则表单信息仅在此节点可用，默认为全局表单，表单信息在整个流程实例中可用" placement="top-start">-->
<!--            <i class="header-icon"><InfoFilled style="width: 1em; height: 1em; margin: 6px 1px" /></i>-->
<!--          </el-tooltip>-->
<!--          <span>节点表单</span>-->
<!--        </template>-->
<!--        <el-switch :disabled="type === 'StartEvent'" v-model="localScope" active-text="是" inactive-text="否" @change="updateElementFormScope()" />-->
<!--      </el-form-item>-->
    </el-form>
    <el-dialog v-model="fieldOptionModelVisible" :title="optionModelTitle" width="600px" append-to-body destroy-on-close>
      <el-form :model="fieldOptionForm" size="small" label-width="96px" @submit.prevent>
        <el-form-item label="编号/ID" v-if="fieldOptionType !== 'constraint'" key="option-id">
          <el-input v-model="fieldOptionForm.id" clearable />
        </el-form-item>
        <el-form-item label="名称" v-if="fieldOptionType !== 'property'" key="option-name">
          <el-input v-model="fieldOptionForm.name" clearable />
        </el-form-item>
        <el-form-item label="配置" v-if="fieldOptionType === 'constraint'" key="option-config">
          <el-input v-model="fieldOptionForm.config" clearable />
        </el-form-item>
        <el-form-item label="值" v-if="fieldOptionType === 'property'" key="option-value">
          <el-input v-model="fieldOptionForm.value" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="fieldOptionModelVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="saveFieldOption">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { listForm } from "@/api/workflow/form";
import { InfoFilled } from "@element-plus/icons-vue";

export default {
  name: "ElementForm",
  components: { InfoFilled },
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: "prefix",
    width: "width"
  },
  data() {
    return {
      formOptions: [],
      formKey: "",
      localScope: false,
      businessKey: "",
      optionModelTitle: "",
      fieldList: [],
      formFieldForm: {},
      fieldType: {
        long: "长整型",
        string: "字符串",
        boolean: "布尔类",
        date: "日期类",
        enum: "枚举类",
        custom: "自定义类型"
      },
      formFieldIndex: -1, // 编辑中的字段， -1 为新增
      formFieldOptionIndex: -1, // 编辑中的字段配置项， -1 为新增
      fieldModelVisible: false,
      fieldOptionModelVisible: false,
      fieldOptionForm: {}, // 当前激活的字段配置项数据
      fieldOptionType: "", // 当前激活的字段配置项弹窗 类型
      fieldEnumList: [], // 枚举值列表
      fieldConstraintsList: [], // 约束条件列表
      fieldPropertiesList: [] // 绑定属性列表
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.$nextTick(() => this.resetFormList());
      }
    }
  },
  created() {
    /** 查询流程分类列表 */
    this.getFormList();
  },
  methods: {
    /** 查询表单列表 */
    getFormList() {
      listForm().then(response => this.formOptions = response.rows);
    },
    resetFormList() {
      this.bpmnELement = window.bpmnInstances.bpmnElement;
      this.formKey = this.bpmnELement.businessObject.formKey;
      this.localScope = this.bpmnELement.businessObject.localScope;
      // 获取元素扩展属性 或者 创建扩展属性
      this.elExtensionElements =
        this.bpmnELement.businessObject.get("extensionElements") || window.bpmnInstances.moddle.create("bpmn:ExtensionElements", { values: [] });
      // 获取元素表单配置 或者 创建新的表单配置
      // this.formData =
      //   this.elExtensionElements.values.filter(ex => ex.$type === `${this.prefix}:FormData`)?.[0] ||
      //   window.bpmnInstances.moddle.create(`${this.prefix}:FormData`, { fields: [] });
      // 业务标识 businessKey， 绑定在 formData 中
      // this.businessKey = this.formData.businessKey;

      // 保留剩余扩展元素，便于后面更新该元素对应属性
      this.otherExtensions = this.elExtensionElements.values.filter(ex => ex.$type !== `${this.prefix}:FormData`);

      // 复制原始值，填充表格
      // this.fieldList = JSON.parse(JSON.stringify(this.formData.fields || []));

      // 更新元素扩展属性，避免后续报错
      // this.updateElementExtensions();
    },
    updateElementFormKey() {
      window.bpmnInstances.modeling.updateProperties(this.bpmnELement, { formKey: this.formKey });
    },
    updateElementFormScope() {
      window.bpmnInstances.modeling.updateProperties(this.bpmnELement, { localScope: this.localScope });
    },
    updateElementBusinessKey() {
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnELement, this.formData, { businessKey: this.businessKey });
    },
    // 根据类型调整字段type
    changeFieldTypeType(type) {
      this.$set(this.formFieldForm, "type", type === "custom" ? "" : type);
    },

    // 打开字段详情侧边栏
    openFieldForm(field, index) {
      this.formFieldIndex = index;
      if (index !== -1) {
        const FieldObject = this.formData.fields[index];
        this.formFieldForm = JSON.parse(JSON.stringify(field));
        // 设置自定义类型
        this.$set(this.formFieldForm, "typeType", !this.fieldType[field.type] ? "custom" : field.type);
        // 初始化枚举值列表
        field.type === "enum" && (this.fieldEnumList = JSON.parse(JSON.stringify(FieldObject?.values || [])));
        // 初始化约束条件列表
        this.fieldConstraintsList = JSON.parse(JSON.stringify(FieldObject?.validation?.constraints || []));
        // 初始化自定义属性列表
        this.fieldPropertiesList = JSON.parse(JSON.stringify(FieldObject?.properties?.values || []));
      } else {
        this.formFieldForm = {};
        // 初始化枚举值列表
        this.fieldEnumList = [];
        // 初始化约束条件列表
        this.fieldConstraintsList = [];
        // 初始化自定义属性列表
        this.fieldPropertiesList = [];
      }
      this.fieldModelVisible = true;
    },
    // 打开字段 某个 配置项 弹窗
    openFieldOptionForm(option, index, type) {
      this.fieldOptionModelVisible = true;
      this.fieldOptionType = type;
      this.formFieldOptionIndex = index;
      if (type === "property") {
        this.fieldOptionForm = option ? JSON.parse(JSON.stringify(option)) : {};
        return (this.optionModelTitle = "属性配置");
      }
      if (type === "enum") {
        this.fieldOptionForm = option ? JSON.parse(JSON.stringify(option)) : {};
        return (this.optionModelTitle = "枚举值配置");
      }
      this.fieldOptionForm = option ? JSON.parse(JSON.stringify(option)) : {};
      return (this.optionModelTitle = "约束条件配置");
    },

    // 保存字段 某个 配置项
    saveFieldOption() {
      if (this.formFieldOptionIndex === -1) {
        if (this.fieldOptionType === "property") {
          this.fieldPropertiesList.push(this.fieldOptionForm);
        }
        if (this.fieldOptionType === "constraint") {
          this.fieldConstraintsList.push(this.fieldOptionForm);
        }
        if (this.fieldOptionType === "enum") {
          this.fieldEnumList.push(this.fieldOptionForm);
        }
      } else {
        this.fieldOptionType === "property" && this.fieldPropertiesList.splice(this.formFieldOptionIndex, 1, this.fieldOptionForm);
        this.fieldOptionType === "constraint" && this.fieldConstraintsList.splice(this.formFieldOptionIndex, 1, this.fieldOptionForm);
        this.fieldOptionType === "enum" && this.fieldEnumList.splice(this.formFieldOptionIndex, 1, this.fieldOptionForm);
      }
      this.fieldOptionModelVisible = false;
      this.fieldOptionForm = {};
    },
    // 保存字段配置
    saveField() {
      const { id, type, label, defaultValue, datePattern } = this.formFieldForm;
      const Field = window.bpmnInstances.moddle.create(`${this.prefix}:FormField`, { id, type, label });
      defaultValue && (Field.defaultValue = defaultValue);
      datePattern && (Field.datePattern = datePattern);
      // 构建属性
      if (this.fieldPropertiesList && this.fieldPropertiesList.length) {
        const fieldPropertyList = this.fieldPropertiesList.map(fp => {
          return window.bpmnInstances.moddle.create(`${this.prefix}:Property`, { id: fp.id, value: fp.value });
        });
        Field.properties = window.bpmnInstances.moddle.create(`${this.prefix}:Properties`, { values: fieldPropertyList });
      }
      // 构建校验规则
      if (this.fieldConstraintsList && this.fieldConstraintsList.length) {
        const fieldConstraintList = this.fieldConstraintsList.map(fc => {
          return window.bpmnInstances.moddle.create(`${this.prefix}:Constraint`, { name: fc.name, config: fc.config });
        });
        Field.validation = window.bpmnInstances.moddle.create(`${this.prefix}:Validation`, { constraints: fieldConstraintList });
      }
      // 构建枚举值
      if (this.fieldEnumList && this.fieldEnumList.length) {
        Field.values = this.fieldEnumList.map(fe => {
          return window.bpmnInstances.moddle.create(`${this.prefix}:Value`, { name: fe.name, id: fe.id });
        });
      }
      // 更新数组 与 表单配置实例
      if (this.formFieldIndex === -1) {
        this.fieldList.push(this.formFieldForm);
        this.formData.fields.push(Field);
      } else {
        this.fieldList.splice(this.formFieldIndex, 1, this.formFieldForm);
        this.formData.fields.splice(this.formFieldIndex, 1, Field);
      }
      this.updateElementExtensions();
      this.fieldModelVisible = false;
    },

    // 移除某个 字段的 配置项
    removeFieldOptionItem(option, index, type) {
      if (type === "property") {
        this.fieldPropertiesList.splice(index, 1);
        return;
      }
      if (type === "enum") {
        this.fieldEnumList.splice(index, 1);
        return;
      }
      this.fieldConstraintsList.splice(index, 1);
    },
    // 移除 字段
    removeField(field, index) {
      this.fieldList.splice(index, 1);
      this.formData.fields.splice(index, 1);
      this.updateElementExtensions();
    },

    updateElementExtensions() {
      // 更新回扩展元素
      const newElExtensionElements = window.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
        values: this.otherExtensions.concat(this.formData)
      });
      // 更新到元素上
      window.bpmnInstances.modeling.updateProperties(this.bpmnELement, {
        extensionElements: newElExtensionElements
      });
    }
  }
};
</script>

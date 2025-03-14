<template>
  <el-card shadow="hover">
    <el-tree
      class="mt-2"
      ref="MsgTemplateVariablesRef"
      node-key="id"
      :data="data"
      :props="{ value: 'id', label: 'name', children: 'children' }"
      :expand-on-click-node="false"
      highlight-current
      default-expand-all
      @node-click="handleNodeClick"
    >
      <template v-slot:default="{ node }">
        <element-tree-line :node="node" :showLabelLine="true">
          <template v-slot:node-label>
            <span style="font-size: 14px">
              {{ node.label }}
            </span>
          </template>
          <template v-slot:after-node-label> </template>
        </element-tree-line>
      </template>
    </el-tree>
  </el-card>
</template>
<script>
import { defineComponent } from "vue";
import treeData from "./data";
import { handleTree } from "@/utils/ruoyi";
import { getElementLabelLine } from "element-tree-line";
import "element-tree-line/dist/style.scss";

export default defineComponent({
  name: "MsgTemplateVariablesTree",
  components: { ElementTreeLine: getElementLabelLine(h) },
  data() {
    return {
      data: handleTree(treeData, "id", "pid")
    };
  },
  methods: {
    handleNodeClick(data) {
      let pushVal = data.variable;
      // 查找父节点是否有prefix
      const _parentNode = treeData.find(node => node.id === data.pid);
      if(_parentNode) {
        const _prefix = _parentNode.prefix;
        if(_prefix) {
          pushVal = _prefix + "." + pushVal;
        }
      }
      this.$emit("passVariable", pushVal);
    }
  },
  watch: {},
  computed: {}
});
</script>
<style scoped lang="scss">
.el-tree-node__content {
  padding-top: 5px;
  padding-bottom: 5px;
}

.element-tree-node-label-wrapper {
  flex: 0;
}

$--element-tree-line-color: #dcdfe6;
$--element-tree-line-style: dashed;
$--element-tree-line-width: 1px;
</style>

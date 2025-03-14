<template>
  <el-card shadow="hover">
    <el-input v-model="filterCategory" placeholder="请输入" suffix-icon="Search" clearable />
    <el-tree
      class="mt-2"
      ref="flowCategoryTreeRef"
      node-key="categoryId"
      :data="categoryTreeOptions1"
      :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      highlight-current
      default-expand-all
      @node-click="handleNodeClick"
    >
      <template #default="{ node ,data }">
        <element-tree-line :node="node" :showLabelLine="true">
          <template v-slot:node-label>
            <span>{{ node.label }} </span>
            <span v-if="relatedObj != null && relatedObj.length > 0" style="color:red;margin-left: 5px;font-weight: 700;">({{data.total}})</span>
          </template>
          <template v-slot:after-node-label> </template>
        </element-tree-line>
      </template>
    </el-tree>
  </el-card>
</template>
<script>
import { defineComponent } from "vue";
import { getElementLabelLine } from "element-tree-line";
import "element-tree-line/dist/style.scss";
export default defineComponent({
  name: "FlowStrategyTree",
  components: { ElementTreeLine: getElementLabelLine(h) },
  props: {
    categoryTreeOptions: Array,
    relatedObj: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
      filterCategory: null
    }
  },
  methods: {
    filterNode(value ,data) {
      if (!value) return true
      return data.categoryName.indexOf(value) !== -1
    },
    handleNodeClick(data) {
      this.$emit('passCategory', data.categoryId)
    },
    getCategoryRelatedNum(_categoryCode) {
      if(this.relatedObj) {
        const related = this.relatedObj.find(r => r.code === _categoryCode);
        if(related) {
          return related.total;
        }
      }
      return 0;
    },
    mergeAndAggregate() {
      const a = this.categoryTreeOptions;
      const b = this.relatedObj;
      // 创建一个映射用于快速查找
      const totalMap = new Map(b.map(item => [item.code, item.total]));
      function mergeAndAggregate(node) {
        // 如果当前节点有 total 数据，赋值给节点
        if (totalMap.has(node.code)) {
          node.total = totalMap.get(node.code);
        } else {
          node.total = 0;
        }

        // 初始化当前节点的汇总值为自己的 total
        let sum = node.total;

        // 递归处理子节点
        if (node.children) {
          node.children.forEach(child => {
            sum += mergeAndAggregate(child);
          });
        }
        // 更新当前节点的 total 为汇总值
        node.total = sum;
        return sum;
      }
      // 处理数组 a 中的每个根节点
      a.forEach(node => {
        mergeAndAggregate(node);
      });
// 输出更新后的数据结构
//       console.log(JSON.stringify(a, null, 2));
      return a;
    },
  },
  watch: {
    filterCategory: {
      handler(newVal, oldVal) {
        if(this.$refs.flowCategoryTreeRef) {
          this.$refs.flowCategoryTreeRef.filter(newVal);
          // this.$emit('passCategory', newVal)
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    categoryTreeOptions1() {
      if(this.categoryTreeOptions && this.relatedObj) {
        return this.mergeAndAggregate();
      }else {
        return this.categoryTreeOptions;
      }
    }
  }
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

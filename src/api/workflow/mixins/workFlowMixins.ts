/**
 * 抽取流程部分通用代码(原理对比vue2中Mixins)
 * */
import { onMounted, ref } from 'vue';
import { listAllCategory } from '@/api/workflow/category';
import { CategoryVO, DataGroupByCategoryVo } from '@/api/workflow/category/types';

export function flowCategoryQuery() {
  const categoryTreeOptions = ref();
  const categoryOptions = ref<CategoryVO[]>();
  const { proxy } = getCurrentInstance() as ComponentInternalInstance;

  async function getCategoryList() {
    try {
      const res = await listAllCategory();
      categoryOptions.value = res.data;
      const data = proxy?.handleTree(res.data, 'categoryId', 'categoryPid');
      if (data) {
        categoryTreeOptions.value = data;
      }
    } catch (error) {
      console.error('加载分类列表失败,失败信息:' + error);
    }
  }

  onMounted(() => {
    getCategoryList();
  });
  return { categoryOptions, categoryTreeOptions };
}

export function flowCategoryTotalQuery(callback: any) {
  const groupByCategory = ref<DataGroupByCategoryVo[]>();
  /** 按流程分类统计业务数据 */
  const totalGroupByCategory = async () => {
    if (callback && typeof callback === 'function') {
      const res = await callback();
      if (res) {
        groupByCategory.value = res.data;
      }
    }
  };
  onMounted(() => {
    totalGroupByCategory();
  });
  return { groupByCategory };
}

export function commonVariables() {
  const defaultTime: [Date, Date] = [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)];
  const total = ref(0);
  const loading = ref(true);
  const showSearch = ref(true);
  const dateRange = ref('');
  const tableDataList = ref([]);
  const queryFormRef = ref<ElFormInstance>();
  return {
    total,
    loading,
    showSearch,
    dateRange,
    tableDataList,
    defaultTime,
    queryFormRef
  };
}

export const categoryFormat = (categoryCode: string, categoryOptions: CategoryVO[] | undefined) => {
  return categoryOptions?.find((k) => k.code === categoryCode)?.categoryName ?? '';
};

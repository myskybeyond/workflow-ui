import CustomComponent from '@/views/workflow/form/components/ComOnLineFile/ComOnLineFile.vue';
import { listCategoryInfoFileNum } from '@/api/business/categoryInfo';
import { handleTree } from '@/utils/ruoyi';
//获取label
const label = '通用在线文件';
//获取名称
const name = 'ComOnLineFile';

//项目资料分类
const query = { category: 90 };
const res = await listCategoryInfoFileNum(query);
const categoryOptions = handleTree(res.data, 'id', 'parentId');

export const ComOnLineFileRule = {
  //插入菜单位置
  menu: 'aide',
  //图标
  icon: 'icon-editor',
  //名称
  label: label,
  //id,唯一!
  name: name,
  //是否可以操作, 除了容器类组件建议为true !
  mask: true,
  //定义组件的渲染规则
  rule() {
    //自定义组件的生成规则
    return {
      type: name,
      component: markRaw(CustomComponent),
      field: 'common',
      title: label,
      info: '',
      props: {}
    };
  },
  //自定义组件的属性配置
  props() {
    return [
      {
        type: 'switch',
        title: '是否禁用',
        field: 'disabled'
      },
      {
        type: 'ElTreeSelect',
        title: '资料分类',
        field: 'limitCategory',
        props: {
          data: categoryOptions,
          multiple: false,
          clearable: true,
          checkStrictly: true,
          props: { value: 'id', label: 'name', children: 'children' }
        }
      }
    ];
  }
};

import CustomComponent from '@/views/workflow/form/components/ExpectedDate/ExpectedDate.vue';
//获取label
const label = '期望完成日期';
//获取名称
const name = 'ExpectedDate';

export const ExpectedDateRule = {
  //插入菜单位置
  menu: 'aide',
  //图标
  icon: 'icon-select',
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
      field: 'expectedDate',
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
      }
    ];
  }
};

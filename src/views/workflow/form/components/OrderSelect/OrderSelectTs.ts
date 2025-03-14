import CustomComponent from '@/views/workflow/form/components/OrderSelect/OrderSelect.vue';
//获取label
const label = '选择销售订单';
//获取名称
const name = 'OrderSelect';

export const OrderSelectRule = {
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
      field: 'orderId',
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
        type: 'select',
        title: '状态',
        field: 'status',
        props: {
          multiple: true,
          clearable: true
        },
        options: [
          { label: '待执行', value: '0' },
          { label: '执行中', value: '1' },
          { label: '暂缓', value: '4' },
          { label: '已完成', value: '2' },
          { label: '已终止', value: '3' }
        ]
      }
    ];
  }
};

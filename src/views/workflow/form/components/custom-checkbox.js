import FcDesigner from '@form-create/designer';

const label = ' 多选框';
const name = 'checkbox';
let i = 1;
const uniqueId = ()=>`uni${i++}`;

export const customCheckbox = {
  //拖拽组件的图标
  icon: 'icon-import',
  //拖拽组件的名称
  label,
  //拖拽组件的 key
  name,
  //拖拽组件的生成规则
  rule() {
    //如果在 props 方法中需要修改 rule 的属性,需要提前在 rule 上定义对应的属性
    return {
      //生成组件的名称
      type: name,
      //field 自定不能重复,所以这里每次都会生成一个新的
      field: uniqueId(),
      title: label,
      info: '',
      effect: {
        fetch: ''
      },
      //这里设置组件的默认props配置项, 在下面的 props 方法里面设置无效
      props: {},
      options: [
        {value: '1', label: '选项1'},
        {value: '2', label: '选项2'},
      ]
    };
  },
  //拖拽组件配置项(props)的生成规则
  props() {
    return [
      //生成`checkbox`组件的`options`配置规则
      FcDesigner.makeOptionsRule('options'),
      {
        type: 'switch',
        field: 'type',
        title: '按钮类型',
        props: {activeValue: 'button', inactiveValue: 'default'}
      }, {type: 'switch', field: 'disabled', title: '是否禁用'}, {
        type: 'inputNumber',
        field: 'min',
        title: '可被勾选的 checkbox 的最小数量'
      }, {type: 'inputNumber', field: 'max', title: '可被勾选的 checkbox 的最大数量'}, {
        type: 'input',
        field: 'textColor',
        title: '按钮形式的 Checkbox 激活时的文本颜色'
      }, {type: 'input', field: 'fill', title: '按钮形式的 Checkbox 激活时的填充色和边框色'}];
  }
};

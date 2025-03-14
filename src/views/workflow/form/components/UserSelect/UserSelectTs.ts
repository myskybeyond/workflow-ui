import CustomComponent from '@/views/workflow/form/components/UserSelect/UserSelect.vue';
//获取label
const label = '选择人员';
//获取名称
const name = 'UserSelect';
import api from '@/api/system/user';
const res = await api.deptTreeSelect();
const data = res.data;

export const UserSelectRule = {
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
      field: 'userId',
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
        title: '限定部门',
        field: 'limitDept',
        props: {
          data: data,
          multiple: true,
          checkStrictly: true,
          props: { value: 'id', label: 'label', children: 'children' }
        }
      },
      {
        type: 'switch',
        title: '限定部门负责人',
        field: 'isManager'
      }
    ];
  }
};

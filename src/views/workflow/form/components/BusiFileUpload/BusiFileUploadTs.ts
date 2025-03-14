import CustomComponent from '@/views/workflow/form/components/BusiFileUpload/BusiFileUpload.vue';
import { listCategoryInfoFileNum } from '@/api/business/categoryInfo';
import { handleTree } from '@/utils/ruoyi';
import { useDict } from '@/utils/dict';
//获取label
const label = '上传文件';
//获取名称
const name = 'BusiFileUpload';
//项目资料分类
const query = { category: 90 };
const res = await listCategoryInfoFileNum(query);
const categoryOptions = handleTree(res.data, 'id', 'parentId');

//获取配置参数中的字典信息
const { business_file_type } = toRefs<any>(useDict('business_file_type'));

export const BusiFileUploadRule = {
  //插入菜单位置
  menu: 'aide',
  //图标
  icon: 'icon-upload',
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
      field: 'busiFileIds',
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
        title: '文件类型',
        field: 'fileType',
        required: true,
        options: business_file_type.value,
        props: {
          multiple: true,
          clearable: true
        },
        value: ['docx', 'doc', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'xlsm', 'dwg']
      },
      {
        type: 'inputNumber',
        title: '文件大小(M)',
        field: 'fileSize',
        value: 50
      },
      {
        type: 'inputNumber',
        title: '上传文件限制数量',
        field: 'limit',
        value: 5
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

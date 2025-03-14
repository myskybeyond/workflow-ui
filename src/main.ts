import { createApp } from 'vue';
// global css
import 'uno.css';
import '@/assets/styles/index.scss';
import 'element-plus/theme-chalk/dark/css-vars.css';
//引入undraw-ui css
import 'undraw-ui/dist/style.css';

// App、router、store
import App from './App.vue';
import store from './store';
import router from './router';

// 自定义指令
import directive from './directive';

// 注册插件
import plugins from './plugins/index'; // plugins
import { download } from '@/utils/request';

import VueHighlightJS from '@highlightjs/vue-plugin';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

// 预设动画
import animate from './animate';

// svg图标
import 'virtual:svg-icons-register';
import ElementIcons from '@/plugins/svgicon';

// permission control
import './permission';

import { useDict } from '@/utils/dict';
import { getConfigKey, updateConfigByKey } from '@/api/system/config';
import { parseTime, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi';

// 国际化
import i18n from '@/lang/index';

// 表单设计器
import formCreate from '@form-create/element-ui';
import FcDesigner from '@form-create/designer';
import ELEMENT from 'element-plus';
//引入undraw-ui
import UndrawUI from 'undraw-ui';

const app = createApp(App);
// 全局方法挂载
app.config.globalProperties.useDict = useDict;
app.config.globalProperties.getConfigKey = getConfigKey;
app.config.globalProperties.updateConfigByKey = updateConfigByKey;
app.config.globalProperties.download = download;
app.config.globalProperties.parseTime = parseTime;
app.config.globalProperties.handleTree = handleTree;
app.config.globalProperties.addDateRange = addDateRange;
app.config.globalProperties.selectDictLabel = selectDictLabel;
app.config.globalProperties.selectDictLabels = selectDictLabels;
app.config.globalProperties.animate = animate;

//增加FormCreate自定义组件信息
import quotation from '@/views/workflow/form/components/quotation/Quotation.vue';
formCreate.component('quotation', quotation);
import techOrder from '@/views/workflow/form/components/techOrder/TechOrder.vue';
formCreate.component('techOrder', techOrder);
import refine from '@/views/workflow/form/components/refine/Refine.vue';
formCreate.component('refine', refine);
import ProjectSelect from '@/views/workflow/form/components/ProjectSelect/ProjectSelect.vue';
formCreate.component('ProjectSelect', ProjectSelect);
import OrderSelect from '@/views/workflow/form/components/OrderSelect/OrderSelect.vue';
formCreate.component('OrderSelect', OrderSelect);
import UserSelect from '@/views/workflow/form/components/UserSelect/UserSelect.vue';
formCreate.component('UserSelect', UserSelect);
import BusiFileUpload from '@/views/workflow/form/components/BusiFileUpload/BusiFileUpload.vue';
formCreate.component('BusiFileUpload', BusiFileUpload);
import BusiImageUpload from '@/views/workflow/form/components/BusiImageUpload/BusiImageUpload.vue';
formCreate.component('BusiImageUpload', BusiImageUpload);
import ComOnLineFile from '@/views/workflow/form/components/ComOnLineFile/ComOnLineFile.vue';
formCreate.component('ComOnLineFile', ComOnLineFile);
import Deliver from '@/views/workflow/form/components/Deliver/Deliver.vue';
formCreate.component('Deliver', Deliver);
import Bom from '@/views/workflow/form/components/Bom/Bom.vue';
formCreate.component('Bom', Bom);
import ExpectedDate from '@/views/workflow/form/components/ExpectedDate/ExpectedDate.vue';
formCreate.component('ExpectedDate', ExpectedDate);

app.use(ElementIcons);
app.use(router);
app.use(store);
app.use(i18n);
app.use(plugins);
app.use(ELEMENT);
app.use(formCreate);
app.use(FcDesigner);
app.use(VueHighlightJS);
app.use(UndrawUI);

// 自定义指令
directive(app);

app.mount('#app');

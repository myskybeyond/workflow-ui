import {createWebHistory, createRouter, RouteOption} from 'vue-router';
/* Layout */
import Layout from '@/layout/index.vue';

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes: RouteOption[] = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/social-callback',
    hidden: true,
    component: () => import('@/layout/components/SocialCallback/index.vue')
  },
  {
    path: '/social-callback-bind',
    hidden: true,
    component: () => import('@/layout/components/SocialCallback/bind/index.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index.vue'),
        name: 'Index',
        meta: {title: '首页', icon: 'dashboard', affix: true,noCache: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: {title: '个人中心', icon: 'user'}
      }
    ]
  },
  {
    path: '/workflow',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'form/designer',
        component: () => import('@/views/workflow/form/formDesign.vue'),
        name: 'designer',
        meta: {title: '表单设计器', icon: 'dashboard'}
      }
    ]
  },
  {
    path: '/excel',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'info',
        component: () => import('@/views/excel/components/LuckySheet.vue'),
        name: 'info',
        meta: {title: '在线文档', icon: 'user', isAuth: true}
      }
    ]
  },
  {
    path: '/excel',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'history',
        component: () => import('@/views/excel/components/LuckySheetHistory.vue'),
        name: 'history',
        meta: {title: '修订历史', icon: 'user', isAuth: true}
      }
    ]
  },
  {
    path: '/excel',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'list',
        component: () => import('@/views/excel/components/excelVersionList.vue'),
        name: 'list',
        meta: {title: '在线文档历史列表', icon: 'user', isAuth: true}
      }
    ]
  },
  {
    path: '/excel',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'view',
        component: () => import('@/views/excel/components/ViewExcel.vue'),
        name: 'view',
        meta: {title: '预览', icon: 'user', isAuth: true}
      }
    ]
  },
  /*{
    path: '/excel',
    component: Layout,
    hidden: false,
    children: [
      {
        path: 'userList',
        component: () => import('@/views/excel/UserFileList.vue'),
        name: 'userList',
        meta: { title: '我的文档列表', icon: 'user', isAuth: true }
      }
    ]
  }*/
  // {
  //   path: '/form-render',
  //   component: Layout,
  //   redirect: 'index',
  //   children: [
  //     {
  //       path: 'form-render',
  //       component: () => import('@/views/workflow/form/form-render.vue'),
  //       name: 'form-render',
  //       meta: { title: '表单渲染', icon: 'dashboard', affix: true }
  //     }
  //   ]
  // }
];

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes: RouteOption[] = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole.vue'),
        name: 'AuthRole',
        meta: {title: '分配角色', activeMenu: '/system/user', icon: ''}
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser.vue'),
        name: 'AuthUser',
        meta: {title: '分配用户', activeMenu: '/system/role', icon: ''}
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data.vue'),
        name: 'Data',
        meta: {title: '字典数据', activeMenu: '/system/dict', icon: ''}
      }
    ]
  },
  {
    path: '/system/oss-config',
    component: Layout,
    hidden: true,
    permissions: ['system:ossConfig:list'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/system/oss/config.vue'),
        name: 'OssConfig',
        meta: {title: '配置管理', activeMenu: '/system/oss', icon: ''}
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable.vue'),
        name: 'GenEdit',
        meta: {title: '修改生成配置', activeMenu: '/tool/gen', icon: ''}
      }
    ]
  },
  {
    path: '/workflow/process',
    component: Layout,
    hidden: true,
    permissions: ['workflow:process:approval', 'workflow:process:approval'],
    children: [
      {
        path: 'start/:deployId([\\w|\\-]+)',
        component: () => import('@/views/workflow/work/start.vue'),
        name: 'start',
        meta: {title: '发起流程', icon: '', noCache: false}
      },
      {
        path: 'detail/:procInsId([\\w|\\-]+)',
        component: () => import('@/views/workflow/work/detail.vue'),
        name: 'WorkDetail',
        meta: {title: '流程详情', activeMenu: '/work/own', icon: '', noCache: true}
      },
      {
        path: 'todoDetail/:procInsId([\\w|\\-]+)',
        component: () => import('@/views/workflow/work/todoDetail.vue'),
        name: 'todoDetail',
        meta: {title: '流程详情', activeMenu: '/work/todo', icon: '', noCache: false}
      }
    ]
  },
  {
    path: '/business/projectInfo',
    component: Layout,
    hidden: true,
    permissions: ['business:projectInfo:list'],
    children: [
      {
        path: 'detail',
        component: () => import('@/views/business/projectInfo/detail.vue'),
        name: 'projectDetail',
        meta: {title: '项目详情', activeMenu: '/business/projectInfo', icon: ''}
      }
    ]
  },
  {
    path: '/business/OrderInfo',
    component: Layout,
    hidden: true,
    permissions: ['business:orderInfo:list'],
    children: [
      {
        path: 'detail',
        component: () => import('@/views/business/orderInfo/detail.vue'),
        name: 'orderDetail',
        meta: {title: '销售订单详情', activeMenu: '/business/orderInfo', icon: ''}
      }
    ]
  }
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return {top: 0};
    }
  }
});

export default router;

import { createRouter, createWebHistory } from 'vue-router'

// 导入视图组件
const HomeView = () => import('../components/HomeView.vue')
const DeviceList = () => import('../components/DeviceList.vue')
const ProductList = () => import('../components/ProductList.vue')
const DocumentPage = () => import('../components/DocumentPage.vue')
const SettingsPage = () => import('../components/SettingsPage.vue')
const MallPage = () => import('../components/MallPage.vue')
const LogPage = () => import('../components/LogPage.vue')
const AfterSalesPage = () => import('../components/AfterSalesPage.vue')
const UserProfile = () => import('../components/UserProfile.vue')
const AboutPage = () => import('../components/AboutPage.vue')

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/devices',
    name: 'DeviceList',
    component: DeviceList
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/docs',
    name: 'DocumentPage',
    component: DocumentPage
  },
  {
    path: '/mall',
    name: 'MallPage',
    component: MallPage
  },
  {
    path: '/after-sales',
    name: 'AfterSalesPage',
    component: AfterSalesPage
  },
  {
    path: '/logs',
    name: 'LogPage',
    component: LogPage
  },
  {
    path: '/settings',
    name: 'SettingsPage',
    component: SettingsPage
  },
  {
    path: '/user',
    name: 'UserProfile',
    component: UserProfile
  },
  {
    path: '/about',
    name: 'AboutPage',
    component: AboutPage
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: { template: '<div>页面不存在</div>' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 移除所有页面特殊类
  document.body.classList.remove('docs-page', 'mall-page', 'logs-page');
  
  // 当访问文档页面或商城页面时
  if (to.path === '/docs' || to.path === '/mall') {
    // 将body添加特殊类
    const pageClass = to.path.substring(1) + '-page';
    document.body.classList.add(pageClass);
    console.log(`添加特殊类: ${pageClass}`);
  }
  
  // 设置页面标题
  const titles = {
    '/': '首页',
    '/devices': '设备管理',
    '/products': '产品管理',
    '/docs': '文档',
    '/mall': '商城',
    '/after-sales': '售后服务',
    '/logs': '系统日志',
    '/settings': '设置',
    '/user': '个人信息',
    '/about': '关于我们'
  };
  document.title = (titles[to.path] || '页面') + ' - 物联网平台';
  
  next();
})

export default router 
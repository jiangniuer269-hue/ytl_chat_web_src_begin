import Vue from 'vue'
import Router from 'vue-router'
import LoginView from '@/views/login/index'
import IndexView from '@/views/home/home'
import mIndexView from '@/views/m/m'
import WelcomeView from '@/views/welcome/index'

Vue.use(Router)

// 按需加载
// const Index = resolve => require(['@/views/home/index'], resolve)
const messageDialog = resolve => require(['@/components/dialog/messageDialog'], resolve)
const m_messageDialog = resolve => require(['@/components/dialog/m_messageDialog'], resolve)
const gm_messageDialog = resolve => require(['@/components/dialog/gm_messageDialog'], resolve)
const agm_messageDialog = resolve => require(['@/components/dialog/agm_messageDialog'], resolve)
const manageUserView = resolve => require(['@/views/manageUser/manageUser'], resolve)
const manageDomainView = resolve => require(['@/views/manageDomain/manageDomain'], resolve)
const manageUserLogsView = resolve => require(['@/views/manageUser/manageUserLogs'], resolve)

const router = new Router({
  routes: [
    {
      path: '/login',
      name: "login",
      component: LoginView,
      meta: { requiresAuth: false }
    }, {
      path: '/',
      name: "index",
      component: IndexView,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'messages/messageChat/:channelId',
          name: 'messageDialog',
          component: messageDialog
        },
        {
          path: 'welcome',
          name: 'welcome',
          component: WelcomeView
        }
      ]
    },
    {
      path: '/m',
      name: "m",
      component: mIndexView,
      meta: { requiresAuth: false },
      children:[
        {
          path: '/m_messages/messageChat/:channelId',
          name: 'm_messageDialog',
          component: m_messageDialog
        },
        {
          path: '/gm_messages/messageChat/:channelId',
          name: 'gm_messageDialog',
          component: gm_messageDialog
        },
        {
          path: '/agm_messages/messageChat/:channelId',
          name: 'agm_messageDialog',
          component: agm_messageDialog
        }
      ]
    },
    {
      path: '/manageUser',
      name: "manageUser",
      component: manageUserView,
      meta: { requiresAuth: true }
    },
    {
      path: '/manageDomain',
      name: "manageDomain",
      component: manageDomainView,
      meta: { requiresAuth: true }
    },
    {
      path: '/manageUserLogs',
      name: "manageUserLogs",
      component: manageUserLogsView,
      meta: { requiresAuth: true }
    }
  ]
})
/**
 * 重写路由的push方法
 */
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error=> error)
}

// 验证token，存在才跳转
router.beforeEach((to, from, next) => {
  var  token = sessionStorage.getItem('token') || localStorage.getItem('token')
  if (to.fullPath === '/' && !sessionStorage.getItem('token')) {
      next({
        path: '/login',
        // query: { redirect: to.fullPath }
      })
      return
  }

  if (to.meta.requiresAuth) {
    if (token) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
})

export default router

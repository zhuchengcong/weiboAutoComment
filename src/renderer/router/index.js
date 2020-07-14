import Vue from 'vue'
import Router from 'vue-router'
import Home from '../page/Home'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    }
  ]
})

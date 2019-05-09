import Vue from 'vue'
import Router from 'vue-router'
import LandingPage from '@/LandingPage'

import ProjectRootController from '@/controllers/project/ProjectRootController'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: LandingPage,
      children:[
        {
          path:'/project',
          name:'project-page',
          component:ProjectRootController
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

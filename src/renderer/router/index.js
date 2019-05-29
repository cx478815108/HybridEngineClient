import Vue from 'vue'
import Router from 'vue-router'
import LandingPage from '@/LandingPage'

import ProjectRootController from '@/controllers/project/ProjectRootController'
import DocumentController from '@/controllers/document/DocumentController'
import CodeSegmentController from '@/controllers/codesegment/CodeSegmentController'

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
        },
        {
          path:'/document',
          name:'document-page',
          component:DocumentController
        },
        {
          path:'/codesegment',
          name:'codesegment-page',
          component:CodeSegmentController
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

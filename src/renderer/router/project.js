import Vue from 'vue'
import Router from 'vue-router'
import ProjectManageController from '@/controllers/project/ProjectManageController'
import ProjectEditController from '@/controllers/project/ProjectEditController'

export default new Router({
  routes: [
    {
        path:'/',
        component:ProjectManageController,
        name:'manage'
    },
    {
      path:'/edit',
      component:ProjectEditController,
      name:'edit'
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)
export const routes = [
  {
    name: 'home',
    path: "/",
    component: ()=> import ('../views/Overview.vue'),
  },
  {
    name: 'approve',
    path: "/approve",
    component: ()=> import('../views/Approve.vue'),
  },
  {
    name: 'history',
    path: "/history",
    component: ()=> import('../views/History.vue'),
  },
]

const router = new VueRouter({
  routes: routes,
})
export default router
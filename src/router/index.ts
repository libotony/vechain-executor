import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)
export const routes = [
  {
    path: "/Hello",
    component: ()=> import ('../views/Hello.vue'),
  },
  {
    path: "/Todo",
    component: ()=> import('../views/Todo.vue'),
  },
]

const router = new VueRouter({
  mode: "history",
  routes: routes,
})
export default router
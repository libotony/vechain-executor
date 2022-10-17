import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
export const routes = [
    {
        name: 'home',
        path: '/',
        redirect: '/overview'
    },
    {
        name: 'overview',
        path: '/overview',
        component: () => import('../views/Overview.vue'),
    },
    {
        name: 'operations',
        path: '/operations',
        component: () => import('../views/Operations.vue'),
    },
    {
        name: 'history',
        path: '/history',
        component: () => import('../views/History.vue'),
    },
]

const router = new VueRouter({
    routes: routes,
})
export default router
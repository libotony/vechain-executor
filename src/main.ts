import Vue from 'vue'
import {Connex} from '@vechain/connex'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.prototype.$connex = new Connex({network: 'main', node: 'https://sync-mainnet.veblocks.net'})
new Vue({
  render: (h) => h(App),
  router,
}).$mount("#app");
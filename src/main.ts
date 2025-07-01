import Vue from 'vue'
import {Connex} from '@vechain/connex'
import App from './App.vue'
import router from './router'
import { VBTooltipPlugin } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

const thor = new Connex.Thor({
    node: 'https://mainnet.vechain.org',
    network: 'main'
})
const vendor = new Connex.Vendor('main', 'sync2')

Vue.use(VBTooltipPlugin)
new Vue({
  render: (h) => h(App),
  router,
  provide: {
    $thor: thor,
    $vendor: vendor,
  }
}).$mount('#app')

import Vue from 'vue'
import {Connex} from '@vechain/connex'
import App from './App.vue'
import router from './router'
import { VBTooltipPlugin } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

const connex = new Connex({ network: 'main', node: 'https://sync-mainnet.veblocks.net' })

Vue.use(VBTooltipPlugin)
new Vue({
  render: (h) => h(App),
  router,
  provide: {
    $connex: connex
  }
}).$mount("#app")

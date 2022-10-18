import Vue from 'vue'
import {Connex} from '@vechain/connex'
import App from './App.vue'
import router from './router'
import { VBTooltipPlugin } from 'bootstrap-vue'
import { nodeURL } from './config'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

const connex = new Connex({ network: 'main', node: nodeURL })

Vue.use(VBTooltipPlugin)
new Vue({
  render: (h) => h(App),
  router,
  provide: {
    $connex: connex
  }
}).$mount('#app')

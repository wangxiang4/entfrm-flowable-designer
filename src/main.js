import Vue from 'vue'
import App from './App.vue'

import axios from 'axios'
import moddle from '@moddle'
Vue.use(moddle, { axios: axios })

new Vue({
  render: h => h(App)
}).$mount('#app')

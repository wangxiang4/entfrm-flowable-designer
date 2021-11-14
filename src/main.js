import Vue from 'vue'
import App from './App.vue'

import request from './request'
import moddle from '@moddle'
Vue.use(moddle, { axiosInstance: request })

new Vue({
  render: h => h(App)
}).$mount('#app')

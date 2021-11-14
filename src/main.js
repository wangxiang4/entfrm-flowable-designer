import Vue from 'vue'
import App from './App.vue'
import request from './request'

// 开发版
import moddle from '@moddle'
Vue.use(moddle, { axiosInstance: request })

// 发布版
/* import moddle from '../lib/entfrm-flowable-designer.umd.min'
import '../lib/entfrm-flowable-designer.css'
Vue.use(moddle, { axiosInstance: request })*/

new Vue({
  render: h => h(App)
}).$mount('#app')

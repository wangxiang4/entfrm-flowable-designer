/**
 * @program: entfrm-flowable-designer
 *
 * @description: axios请求工具类
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-03
 **/

import axios from 'axios'
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status <= 500 // 默认的
}

// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: '/test',
  // 超时
  timeout: 30000
})

service.interceptors.response.use(res => {
  return res.data
}, error => {
  return Promise.reject(new Error(error))
})

export default service

/**
 * @program: entfrm-flowable-designer
 *
 * @description: axios请求工具类
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-03
 */
import { Message } from 'element-ui'
import errorCode from './errorCode'
import axios from 'axios'
import qs from 'qs'
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

// request拦截器
service.interceptors.request.use(config => {
  // token
  config.headers['Authorization'] = 'Bearer ' + '47df0f25-42ba-4145-af5d-43db1c143a91'
  // 配置url拼接参数格式处理
  const type = config.method
  const arrayFormat = config.headers.arrayFormat || 'indices'
  if (type === 'post' && config.headers['Content-Type'] === 'application/x-www-form-urlencoded; charset=utf-8') {
    // post请求参数处理
    config.data = qs.stringify(config.data, { allowDots: true, arrayFormat: arrayFormat })
  } else if (type === 'get') {
    // get请求参数处理
    config.params = qs.stringify(config.params, { allowDots: true, arrayFormat: arrayFormat })
    config.params = qs.parse(config.params)
  }
  return config
  // 经过对内部源码的剖析,内部采用Promise.resolve(config)链式调用,所以此处没有拒绝回调
}, undefined)

// 响应拦截器
service.interceptors.response.use(res => {
  const status = Number(res.status) || 200
  const message = errorCode[status] || res.data.msg || errorCode['default']
  if (status === 500) {
    this.message.Message({
      message: message,
      type: 'error'
    })
    return Promise.reject(new Error(message))
  } else if (status !== 200 || res.data.code === 1) {
    Message({
      message: message,
      type: 'error'
    })
    return Promise.reject(new Error(message))
  } else {
    return res.data
  }
}, error => {
  let { msg } = error
  if (msg == 'Network Error') {
    msg = '后端接口连接异常'
  } else if (msg.includes('timeout')) {
    msg = '系统接口请求超时'
  } else if (msg.includes('Request failed with status code')) {
    msg = '系统接口' + msg.substr(msg.length - 3) + '异常'
  }
  Message({
    message: msg,
    type: 'error',
    duration: 5 * 1000
  })
  return Promise.reject(new Error(error))
})

export default service

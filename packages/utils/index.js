/**
 * @program: entfrm-flowable-designer
 *
 * @description: flowable设计器工具类
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-01
 **/
import random from './random'

/** 替换多个模板字符串 **/
export function templateFormat (template, format) {
  if (Object.keys(format).length === 0) {
    return template
  }
  return template.replace(/{([^}]+)}/g, function (_, key) {
    return format[key] || '{' + key + '}'
  })
}

/** 生成随机8位ID **/
export function randomId8 () {
  return random(8)
}

/** 请求装饰器 **/
export function requestDecorator (request) {
  return typeof request === 'function' ? request : Promise.reject('没有发现第三方axios依赖,请检查')
}

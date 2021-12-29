/**
 * @program: entfrm-flowable-designer
 *
 * @description: flowable设计器工具类
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-01
 */
import random from './random'
import packages from './packages'

/** 替换多个模板字符串 */
export function templateFormat (template, format) {
  if (Object.keys(format).length === 0) {
    return template
  }
  return template.replace(/{([^}]+)}/g, function (_, key) {
    return format[key] || '{' + key + '}'
  })
}

/** 生成随机8位ID */
export function randomId8 () {
  return random(8)
}

/** 获取对象类型 */
export function getObjType (obj) {
  const toString = Object.prototype.toString
  const map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
    '[object Promise]': 'promise'
  }
  if (obj instanceof Element) {
    return 'element'
  }
  return map[toString.call(obj)]
}

/** 请求装饰器 */
export function requestDecorator (request) {
  // 这里具体判断是否是promise类型,预设为函数,axiosInstance为promise
  return (request && getObjType(request) === 'promise')
    ? request : (() => {
      packages.logs('thirdPartyAxios')
      return Promise.reject('没有发现第三方axios依赖,请检查')
    })()
}

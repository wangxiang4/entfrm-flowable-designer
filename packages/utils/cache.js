/**
 * @program: entfrm-flowable-designer
 *
 * @description: 缓存工具类
 * 本地缓存-最大支持5M
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-10
 **/

import globalConfig from '@/common/config/global'
import log from '@utils/log'
import lodash from 'lodash'

// 获取浏览器本地缓存
export function getLocalStorage (key) {
  // 加入缓存版本的概念，保证缓存数据与程序匹配
  const db = localStorage.getItem(String(key || ''))
  if (!lodash.isEmpty(db)) {
    if (db['_v'] === globalConfig.version) return db['data']
    log.warning(`当前缓存版本不匹配_请检查版本号:${globalConfig.version}`)
  }
}

// 保存浏览器本地缓存
export function setLocalStorage (key, value) {
  if (key && value) {
    const db = lodash.create({})
    lodash.set(db, 'data', value)
    lodash.set(db, '_v', globalConfig.version)
    localStorage.setItem(String(key), value)
  }
}

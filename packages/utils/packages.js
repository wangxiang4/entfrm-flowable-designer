/**
 * @program: entfrm-flowable-designer
 *
 * @description: 提示需要引入的包,否则对应的功能使用不了
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-07-15
 **/

import $Log from './log'
const list = {
  'thirdPartyAxios': {
    title: '需要引入第三方axios发送数据包',
    url: 'https://cdn.staticfile.org/axios/0.21.1/axios.js',
    version: '0.21.1',
    github: 'https://github.com/axios/axios'
  }
}

export default (() => {
  return {
    logs: function (name) {
      const obj = list[name]
      $Log.capsule(
        name,
        obj.title,
        'warning'
      )
      $Log.warning('版本:' + (obj.version || '-'))
      $Log.warning('CDN:' + (obj.url || '-'))
      $Log.warning('GITHUB:' + (obj.github || '-'))
    }
  }
})()

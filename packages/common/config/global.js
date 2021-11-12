/**
 * @program: entfrm-flowable-designer
 *
 * @description: 全局配置
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-11-04
 **/

const GlobalConfig = {
  axios: () => {},
  version: 0, // 版本号，对于某些带数据缓存的功能有用到，上升版本号可以用于重置数据
  doneFillColor: '#FFFFFF',
  doneStrokeColor: '#409EFF',
  runFillColor: '#FFFFFF',
  runStrokeColor: '#ff0000',
  undoneFillColor: '#FFFFFF',
  undoneStrokeColor: '#444444'
}

export default GlobalConfig

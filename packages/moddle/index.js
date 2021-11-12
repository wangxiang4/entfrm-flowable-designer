/**
 * @program: bpmn-process-designer
 *
 * @description: 导出建模器
 *
 * todo: 目前暂时不支持typescript项目,没写*.d.ts
 * todo: 站在总体的角度考虑,后期会把所有文件全部用typescript重构项目
 * todo: 去除所有的*.js,*.vue文件只留下跟typescript相关的文件
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-05-31
 **/

import flowableChart from './flowable-chart'
import flowableDesigner from './flowable-designer'
import flowablePreview from './flowable-preview'
import GlobalConfig from '@/common/config/global'
// 导入entfrm-bpmn样式包
import 'entfrm-bpmn/dist/assets/diagram-js.css'
import 'entfrm-bpmn/dist/assets/bpmn-font/css/bpmn.css'
import 'entfrm-bpmn/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'entfrm-bpmn/dist/assets/bpmn-font/css/bpmn-embedded.css'
import '@/assets/iconfont/iconfont.css'

const components = [
  flowableChart,
  flowableDesigner,
  flowablePreview
]

export default {
  install (Vue, opts = {}) {
    Object.assign(GlobalConfig, opts)
    components.forEach(component => Vue.component(component.name, component))
  }
}

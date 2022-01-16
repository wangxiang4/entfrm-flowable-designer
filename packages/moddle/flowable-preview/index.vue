<template>
  <el-container>
    <el-container direction="vertical">
      <el-main class="bpmn-viewer-container">
        <div ref="bpmnViewer" class="canvas"/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Viewer from 'entfrm-bpmn/lib/Viewer'
import globalConfig from '@/common/config/global'
export default {
  name: 'FlowablePreview',
  data () {
    return {
      viewer: undefined
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    /** 初始化加载Viewer */
    init () {
      this.canvas = this.$refs.bpmnViewer
      this.viewer = new Viewer({
        container: this.canvas
      })
    },
    /** 处理采用高亮涂抹图表颜色的方式导入bpmnXml文件 */
    setHighlightImportDiagram (data = {}) {
      const opt = {
        bpmnXml: data.bpmnXml || '',
        activityIds: data.activityIds || [],
        runActivityIds: data.runActivityIds || [],
        // 排除流程面板以及泳道以及一些没必要的类型
        exclude: ['bpmndi:BPMNPlane']
      }
      // 采用bpmn内部XMl导入与XML导出模块做处理高亮处理,这里后面又重新的使用importXML导入了一次,原因不想破坏内部的生命周期回调
      opt.bpmnXml && this.viewer._moddle.fromXML(opt.bpmnXml, 'bpmn:Definitions').then(function (result) {
        const definitions = result.rootElement
        const references = result.references
        // 获取Di图像元素,进行设置颜色
        const bpmnDiElement = references.filter(e => e.property === 'bpmndi:bpmnElement')
        bpmnDiElement.forEach(item => {
          const referenceId = item.id
          // 涂抹正在运行颜色
          if (opt.runActivityIds.includes(referenceId)) {
            const element = item.element
            element && Object.assign(element, {
              'fill': globalConfig.runFillColor,
              'stroke': globalConfig.runStrokeColor
            })
            // 涂抹已完成颜色
          } else if (opt.activityIds.includes(referenceId)) {
            const element = item.element
            element && Object.assign(element, {
              'fill': globalConfig.doneFillColor,
              'stroke': globalConfig.doneStrokeColor
            })
            // 涂抹未完成颜色
          } else {
            const element = item.element
            element && (!opt.exclude.includes(element.$type)) && (() => {
              // 不能替换xml中[bioc:stroke,bioc:stroke]手动设置颜色
              const attr = {}
              element.fill || (attr.fill = globalConfig.undoneFillColor)
              element.stroke || (attr.stroke = globalConfig.undoneStrokeColor)
              Object.assign(element, attr)
            })()
          }
        })
        return Promise.resolve(definitions)
      }).then(definitions => {
        return this.viewer._moddle.toXML(definitions)
      }).then(result => {
        this.viewer.importXML(result.xml)
      }).catch(() => {
        this.$message.error('导入模型出错,请确认该模型符合Bpmn2.0规范')
      })
    }
  }
}
</script>

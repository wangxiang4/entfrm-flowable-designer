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
import NavigatedViewer from 'entfrm-bpmn/dist/bpmn-navigated-viewer.production.min'
import globalConfig from '@/common/config/global'
export default {
  name: 'FlowableChart',
  props: {
    options: {
      type: Object,
      default: () => {
        return {
          activityIds: [],
          bpmnXml: '',
          flows: []
        }
      }
    }
  },
  data () {
    return {
      navigatedViewer: undefined
    }
  },
  watch: {
    options: {
      handler (data) {
        this.handleHighlightImportDiagram(data)
      },
      deep: true
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // 初始化加载NavigatedViewer
    init () {
      this.canvas = this.$refs.bpmnViewer
      this.navigatedViewer = new NavigatedViewer({ container: this.canvas })
      this.handleHighlightImportDiagram(this.options)
    },
    // 处理采用高亮涂抹图表颜色的方式导入bpmnXml文件
    handleHighlightImportDiagram (data = {}) {
      const opt = {
        activityIds: data.activityIds || [],
        bpmnXml: data.bpmnXml || '',
        flows: data.bpmnXml || []
      }
      // 采用bpmn内部XMl导入与XML导出模块做处理高亮处理,这里后面又重新的使用importXML导入了一次,原因不想破坏内部的生命周期回调
      opt.bpmnXml && this.navigatedViewer._moddle.fromXML(opt.bpmnXml, 'bpmn:Definitions').then(function (result) {
        const definitions = result.rootElement
        const elements = result.elementsById
        const runActivity = opt.activityIds.pop()
        Object.keys(elements).forEach(key => {
          // 涂抹正在运行颜色
          if (key.includes(runActivity)) {
            const di = elements[`${key}_di`]
            di && Object.assign(di, {
              'fill': globalConfig.runFillColor,
              'stroke': globalConfig.runStrokeColor
            })
            // 涂抹已完成颜色
          } else if (opt.activityIds.includes(key) || opt.flows.includes(key)) {
            const di = elements[`${key}_di`]
            di && Object.assign(di, {
              'fill': globalConfig.doneFillColor,
              'stroke': globalConfig.doneStrokeColor
            })
            // 涂抹未完成颜色
          } else if (key.includes('_di')) {
            const di = elements[key]
            di && (() => {
              // 不能替换xml中[bioc:stroke,bioc:stroke]手动设置颜色
              const attr = {}
              di.fill || (attr.fill = globalConfig.undoneFillColor)
              di.stroke || (attr.stroke = globalConfig.undoneStrokeColor)
              Object.assign(di, attr)
            })()
          }
        })
        return Promise.resolve(definitions)
      }).then(definitions => {
        this.navigatedViewer._moddle.toXML(definitions).then(result => {
          this.navigatedViewer.importXML(result.xml).catch(() => this.$message.error('打开模型出错,请确认该模型符合Bpmn2.0规范'))
        })
      })
    }
  }
}
</script>

<style lang="scss">
@import 'packages/assets/styles/flowable-bpmn';
</style>

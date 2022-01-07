<template>
  <el-container>
    <el-container direction="vertical">
      <flowable-header :modeler="bpmnModeler"
                       :can-redo="canRedo"
                       :can-undo="canUndo"
                       :default-zoom="defaultZoom"
                       @restart="restart"
                       @handleExportSvg="handleExportSvg"
                       @handleExportBpmn="handleExportBpmn"
                       @handleProcessZoomOut="handleProcessZoomOut"
                       @handleProcessZoomIn="handleProcessZoomIn"
                       @handleProcessReZoom="handleProcessReZoom"
                       @importDiagram="importDiagram"
                       @save="$emit('save', bpmnModeler, $event)"
      />
      <el-main class="bpmn-viewer-container">
        <div ref="bpmnViewer" class="canvas"/>
      </el-main>
    </el-container>
    <flowable-panel v-if="bpmnModeler" :modeler="bpmnModeler" :width="panelWidth"/>
  </el-container>
</template>

<script>
import BpmnModeler from 'entfrm-bpmn/lib/Modeler'
import customTranslate from '@/common/translate/customTranslate'
import templateXml from '@/common/template'
import FlowableHeader from '@components/Header'
import flowableDescriptor from '@/common/config/flowable'
import FlowablePanel from '@components/Panel'

export default {
  name: 'FlowableDesigner',
  components: {
    FlowableHeader,
    FlowablePanel
  },
  props: {
    bpmnXml: {
      type: String,
      default: ''
    },
    panelWidth: {
      type: Number,
      default: 500
    }
  },
  data () {
    return {
      bpmnModeler: undefined,
      canRedo: false,
      canUndo: false,
      defaultZoom: 1
    }
  },
  watch: {
    bpmnXml: {
      handler (xml) {
        this.importDiagram(xml)
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    /** 初始化加载BpmnModeler */
    init () {
      const _moddleExtensions = this.getModdleExtensions()
      const _additionalModules = this.getAdditionalModules()
      this.canvas = this.$refs.bpmnViewer
      this.bpmnModeler = new BpmnModeler({
        container: this.canvas,
        keyboard: { bindTo: document },
        additionalModules: _additionalModules,
        moddleExtensions: _moddleExtensions
      })
      window.bpmn = this.bpmnModeler
      this.importDiagram(this.bpmnXml || templateXml.initTemplate())
      this.initModelListeners()
    },
    /** 初始化监听事件 */
    initModelListeners () {
      const EventBus = this.bpmnModeler.get('eventBus')
      EventBus.on('commandStack.changed', () => {
        try {
          // 设置历史记录目前状态
          this.canRedo = this.bpmnModeler.get('commandStack').canRedo()
          this.canUndo = this.bpmnModeler.get('commandStack').canUndo()
        } catch (e) {
          console.error(`[Process Designer Warn]: ${e.message || e}`)
        }
      })
      EventBus.on('canvas.viewbox.changed', ({ viewbox }) => {
        // 设置目前画布的大小
        const { scale } = viewbox
        this.defaultZoom = Math.ceil(scale * 100) / 100
      })
    },
    /** 获取modeler附加模板(覆盖modeler内部已经存在的模块,也称重新附加模块) */
    getAdditionalModules () {
      return [{ translate: ['value', customTranslate] }]
    },
    /** 获取modeler扩展模板(新加入到modeler中的扩展模块,可以通过ioc调用,例如this.bpmnModeler.get(...)) */
    getModdleExtensions () {
      return { flowable: flowableDescriptor }
    },
    /** 导入bpmnXml文件 */
    importDiagram (xml) {
      this.bpmnModeler.importXML(xml).catch(() => this.$message.error('打开模型出错,请确认该模型符合Bpmn2.0规范'))
    },
    /** 创建新的流程图 */
    restart () {
      this.importDiagram(templateXml.initTemplate())
    },
    /** 导出diagram.bpmn文件 */
    handleExportBpmn () {
      this.bpmnModeler.saveXML({
        format: true
      }).then(result => {
        const { filename, href } = this.setEncoded('BPMN', result.xml)
        if (href && filename) {
          const a = document.createElement('a')
          a.download = filename // 指定下载的文件名
          a.href = href //  URL对象
          a.click() // 模拟点击
          URL.revokeObjectURL(a.href) // 释放URL 对象
        }
      })
    },
    /** 导出diagram.svg文件 */
    handleExportSvg () {
      this.bpmnModeler.saveSVG().then(result => {
        const { filename, href } = this.setEncoded('SVG', result.svg)
        if (href && filename) {
          const a = document.createElement('a')
          a.download = filename
          a.href = href
          a.click()
          URL.revokeObjectURL(a.href)
        }
      })
    },
    /** 设置导出格式编码 */
    setEncoded (type, data) {
      const encodedData = encodeURIComponent(data)
      if (data) {
        if (type === 'XML') {
          return {
            filename: 'diagram.bpmn20.xml',
            href: 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
            data: data
          }
        }
        if (type === 'BPMN') {
          return {
            filename: 'diagram.bpmn',
            href: 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
            data: data
          }
        }
        if (type === 'SVG') {
          return {
            filename: 'diagram.svg',
            href: 'data:application/text/xml;charset=UTF-8,' + encodedData,
            data: data
          }
        }
      }
    },
    /** 处理画布缩小 */
    handleProcessZoomOut (zoomStep) {
      const newZoom = Math.ceil(this.defaultZoom * 100 - zoomStep * 100) / 100
      this.defaultZoom = newZoom.toFixed(1)
      this.bpmnModeler.get('canvas').zoom(this.defaultZoom)
    },
    /** 处理画布放大 */
    handleProcessZoomIn (zoomStep) {
      const newZoom = Math.ceil(this.defaultZoom * 100 + zoomStep * 100) / 100
      this.defaultZoom = newZoom.toFixed(1)
      this.bpmnModeler.get('canvas').zoom(this.defaultZoom)
    },
    /** 处理画布重置 */
    handleProcessReZoom () {
      this.defaultZoom = 1
      this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto')
    },
    /** 设置bpmnXml */
    setBpmnXml (xml) {
      this.importDiagram(xml)
    }
  }
}
</script>

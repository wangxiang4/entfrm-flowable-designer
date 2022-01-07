<template>
  <el-container v-loading="loading"
                element-loading-text="玩命加载中..."
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
  >
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
                       @save="handleSubmitModel"
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
import lodash from 'lodash'
import { activityExtensionDataSave, activityExtensionPropertySave, deployModel, addModel, editModel } from '@/api/flowable-designer'

export default {
  name: 'FlowableDesigner',
  components: {
    FlowableHeader,
    FlowablePanel
  },
  props: {
    panelWidth: {
      type: Number,
      default: 500
    }
  },
  data () {
    return {
      loading: false,
      modelData: {},
      bpmnModeler: undefined,
      canRedo: false,
      canUndo: false,
      defaultZoom: 1
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
      this.importDiagram(templateXml.initTemplate())
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
      if (xml) {
        this.importDiagram(xml)
      } else {
        this.restart()
      }
    },
    /** 设置模型数据 */
    setModelData (data) {
      this.modelData = data || {}
    },
    /** 获取模型数据 */
    getModelData () {
      return this.modelData
    },
    /** 模型数据重置 */
    reset () {
      this.modelData = {
        id: undefined,
        key: undefined,
        name: undefined,
        description: undefined,
        createdBy: undefined,
        lastUpdatedBy: undefined,
        lastUpdated: undefined,
        latestVersion: undefined,
        version: undefined,
        modelType: undefined
      }
    },
    /** 处理模型流程 */
    handleModelProcess (opts) {
      const options = {
        flowElements: opts.flowElements || [],
        activityExtensionProperty: opts.activityExtensionProperty || [],
        activityExtensionData: opts.activityExtensionData || [],
        validateErrorData: opts.validateErrorData || []
      }
      for (let i = 0; i < options.flowElements.length; ++i) {
        const bpmnElement = options.flowElements[i]
        const bpmnElementParent = lodash.get(bpmnElement, '$parent', {})
        const extensionElements = lodash.get(bpmnElement, 'extensionElements', {})
        const conditionType = lodash.get(bpmnElement, '$attrs.flowable:conditionType')
        const bpmnType = lodash.get(bpmnElement, '$type', '')
        // ----------------扩展活动属性存储------------------
        if (bpmnElement.formType != undefined) {
          options.activityExtensionProperty.push({
            key: 'formType',
            processDefId: bpmnElementParent.id,
            activityDefId: bpmnElement.id,
            value: bpmnElement.formType
          })
        }
        if (bpmnElement.formReadOnly != undefined) {
          options.activityExtensionProperty.push({
            key: 'formReadOnly',
            processDefId: bpmnElementParent.id,
            activityDefId: bpmnElement.id,
            value: bpmnElement.formReadOnly
          })
        }
        if (conditionType != undefined) {
          options.activityExtensionProperty.push({
            key: 'conditionType',
            processDefId: bpmnElementParent.id,
            activityDefId: bpmnElement.id,
            value: conditionType
          })
        }
        // ---------------扩展活动属性数据存储----------------
        const values = lodash.get(extensionElements, 'values', [])
        // ------------------用户分配人---------------------
        const assignee = values.filter(element => element.$type == 'flowable:Assignee')
        // ------------------常用按钮-----------------------
        const button = values.filter(element => element.$type == 'flowable:Button')
        // ------------------流转条件-----------------------
        const condition = values.filter(element => element.$type == 'flowable:Condition')
        if ((assignee.length + button.length + condition.length) > 0) {
          options.activityExtensionData.push({
            activityDefId: bpmnElement.id,
            processDefId: bpmnElementParent.id,
            workflowAssigneeList: assignee,
            workflowButtonList: button,
            workflowConditionList: condition
          })
        }
        // ------------------制定校验规则--------------------
        const formProperty = values.filter(element => element.$type == 'flowable:FormProperty')
        switch (bpmnType) {
          case 'bpmn:StartEvent':
            if (!formProperty.length && !bpmnElement.outFormKey) {
              options.validateErrorData.push(`<p>节点【${bpmnElement.name || bpmnElement.id}】没有配置表单。</p>`)
            }
            break
          case 'bpmn:UserTask':
            if (!assignee.length) {
              options.validateErrorData.push(`<p>节点【${bpmnElement.name || bpmnElement.id}】没有指定办理人。</p>`)
            }
            if (!button.length) {
              options.validateErrorData.push(`<p>节点【${bpmnElement.name || bpmnElement.id}】没有配置按钮。</p>`)
            }
            if (!formProperty.length && !bpmnElement.outFormKey) {
              options.validateErrorData.push(`<p>节点【${bpmnElement.name || bpmnElement.id}】没有配置表单。</p>`)
            }
            break
        }
        if (bpmnElement.$type === 'bpmn:SubProcess') {
          const flowElements = lodash.get(bpmnElement, 'flowElements', [])
          this.handleModelProcess({
            flowElements,
            activityExtensionProperty: options.activityExtensionProperty,
            activityExtensionData: options.activityExtensionData
          })
        }
      }
    },
    /** 处理模型提交 */
    handleSubmitModel (code) {
      if (this.bpmnModeler) {
        // 获取根流程业务对象,需要考虑泳道
        const rootElement = this.bpmnModeler.get('canvas').getRootElement()
        const root = lodash.get(rootElement, 'businessObject', {})
        this.loading = true
        if (this.modelData.id != undefined) {
          this.bpmnModeler.saveXML({
            format: true
          }).then(({ xml }) => {
            // 处理模型修改
            editModel(this.modelData.id, {
              key: root.id,
              name: root.name,
              json_xml: xml,
              // 这个字段为后期版本冲突功能做准备
              newversion: false,
              description: '',
              comment: '',
              lastUpdated: this.modelData.lastUpdated
            }).then(response => {
              this.modelData = response
              const chain = []
              code === 1 && chain.push(deployModel({ id: response.id, category: '未分类' }))
              const activityExtensionProperty = []
              const activityExtensionData = []
              const validateErrorData = []
              const definitions = this.bpmnModeler.getDefinitions()
              const rootElements = lodash.get(definitions, 'rootElements', [])
              lodash.forEach(rootElements, item => {
                // 需要考虑泳道部分逻辑
                if (item.$type == 'bpmn:Collaboration') return
                // 处理泳道多个流程
                const flowElements = lodash.get(item, 'flowElements', [])
                this.handleModelProcess({
                  flowElements,
                  activityExtensionProperty,
                  activityExtensionData,
                  validateErrorData
                })
              })
              chain.push(validateErrorData)
              chain.push(activityExtensionPropertySave(activityExtensionProperty))
              chain.push(activityExtensionDataSave(activityExtensionData))
              return Promise.all(chain)
            }).then(result => {
              this.$notify({
                title: '警告',
                message: result[0].join(''),
                type: 'warning',
                dangerouslyUseHTMLString: true
              })
              this.$message.success('保存流程模型成功!')
              this.loading = false
              this.$emit('refresh')
            }).catch(() => {
              this.$message.error('保存流程模型失败!')
              this.loading = false
            })
          })
        } else {
          // 处理模型新增
          addModel({
            key: root.id,
            name: root.name,
            modelType: 0,
            description: ''
          }).then(response => {
            this.modelData = response
            this.handleSubmitModel(code)
          }).catch(() => { this.loading = false })
        }
      } else this.$message.error('bpmn建模对象不存在,请检查!')
    }
  }
}
</script>

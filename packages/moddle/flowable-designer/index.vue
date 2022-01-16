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
import { validateNull } from '@utils'
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
    /** 处理模型流程交互转换 */
    handleModelProcess (opts) {
      const options = {
        flowElements: opts.flowElements || [],
        process: opts.process || {},
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
        const bpmnElementKeys = Object.keys(bpmnElement)
        // ----------------扩展活动属性存储------------------
        if (bpmnElementKeys.includes('formType')) {
          options.activityExtensionProperty.push({
            key: 'formType',
            processDefId: options.process.id,
            activityDefId: bpmnElement.id,
            value: bpmnElement.formType
          })
        }
        if (bpmnElementKeys.includes('formReadOnly')) {
          options.activityExtensionProperty.push({
            key: 'formReadOnly',
            processDefId: options.process.id,
            activityDefId: bpmnElement.id,
            value: bpmnElement.formReadOnly
          })
        }
        if (conditionType != undefined) {
          options.activityExtensionProperty.push({
            key: 'conditionType',
            processDefId: options.process.id,
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
            processDefId: options.process.id,
            workflowAssigneeList: assignee,
            workflowButtonList: button,
            workflowConditionList: condition
          })
        }
        // ------------------制定校验规则--------------------
        const formKey = lodash.get(bpmnElement, 'formKey')
        switch (bpmnType) {
          case 'bpmn:StartEvent':
            if (validateNull(formKey) && bpmnElementParent.$type != 'bpmn:SubProcess') {
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
            if (validateNull(formKey)) {
              options.validateErrorData.push(`<p>节点【${bpmnElement.name || bpmnElement.id}】没有配置表单。</p>`)
            }
            break
        }
        if (bpmnElement.$type === 'bpmn:SubProcess') {
          const flowElements = lodash.get(bpmnElement, 'flowElements', [])
          this.handleModelProcess({
            flowElements,
            process: options.process,
            activityExtensionProperty: options.activityExtensionProperty,
            activityExtensionData: options.activityExtensionData,
            validateErrorData: options.validateErrorData || []
          })
        }
      }
    },
    /** 处理模型提交 */
    handleSubmitModel (code) {
      new Promise((resolve, reject) => {
        // todo:第一层处理流程模型空值相关校验
        if (this.bpmnModeler) {
          const definitions = this.bpmnModeler.getDefinitions()
          const rootElements = lodash.get(definitions, 'rootElements', [])
          // 检测协助池中的一些非空校验
          const collaboration = rootElements.find(item => item.$type == 'bpmn:Collaboration')
          if (collaboration) {
            const participants = lodash.get(collaboration, 'participants', [])
            for (let i = 0; i < participants.length; ++i) {
              const participant = participants[i]
              const process = lodash.get(participant, 'processRef', {})
              // 检测池中的泳道不能为空
              const lanes = lodash.get(process, 'laneSets[0].lanes', [])
              if (lanes.length == 0) {
                return reject(`池子【${participant.name || participant.id}】没有配置泳道,请检测!`)
              }
              // 检测池中的bpmn元素不能为空
              const flowElements = lodash.get(process, 'flowElements', [])
              if (flowElements.length == 0) {
                return reject(`池子【${participant.name || participant.id}】没有配置bpmn元素,请设计bpmn流程!`)
              }
            }
          // 检测正常单流程的一些非空校验
          } else {
            const process = lodash.get(rootElements, '[0]', {})
            const flowElements = lodash.get(process, 'flowElements', [])
            if (flowElements.length == 0) {
              return reject(`流程【${process.name || process.id}】没有配置bpmn元素,请设计bpmn流程!`)
            }
          }
          // 处理一些需要初始化的值
          this.loading = true
          resolve(rootElements)
        } else reject('bpmn建模对象不存在,请检查!')
      }).then(rootElements => {
        // todo:第二层处理流程模型新增
        // 获取根流程业务对象,需要考虑支持泳道的逻辑
        const canvasRootElement = this.bpmnModeler.get('canvas').getRootElement()
        const process = lodash.get(canvasRootElement, 'businessObject', {})
        if (validateNull(process.name)) {
          return Promise.reject('检测到主体流程名称为空,请检查,这个为必填项!')
        }
        return new Promise((resolve, reject) => {
          if (this.modelData.id == undefined) {
            addModel({
              key: process.id,
              name: process.name,
              modelType: 0,
              description: ''
            }).then(response => {
              this.modelData = response
              resolve({ rootElements, process })
            }).catch(() => {
              reject('保存流程模型失败!')
            })
          } else resolve({ rootElements, process })
        })
      }).then(({ rootElements, process }) => {
        // todo:第三层处理bpmnXml
        return this.bpmnModeler.saveXML({
          format: true
        }).then(result => {
          return Promise.resolve({ rootElements, process, result })
        })
      }).then(({ rootElements, process, result }) => {
        // todo:第四层处理流程模型修改
        return editModel(this.modelData.id, {
          key: process.id,
          name: process.name,
          json_xml: result.xml,
          // 这个字段为后期版本冲突功能做准备
          newversion: false,
          description: '',
          comment: '',
          lastUpdated: this.modelData.lastUpdated
        }).then(response => {
          this.modelData = response
          const chain = []
          const activityExtensionProperty = []
          const activityExtensionData = []
          let validateErrorData = []
          // 查找并存储扩展属性跟扩展数据,方便后台拿取做对应功能需求
          const collaboration = rootElements.find(item => item.$type == 'bpmn:Collaboration')
          // 处理协助池
          if (collaboration) {
            const participants = lodash.get(collaboration, 'participants', [])
            for (let i = 0; i < participants.length; ++i) {
              const participant = participants[i]
              const process = lodash.get(participant, 'processRef', {})
              const flowElements = lodash.get(process, 'flowElements', [])
              const tempValidateErrorData = []
              this.handleModelProcess({
                flowElements,
                process,
                activityExtensionProperty,
                activityExtensionData,
                validateErrorData: tempValidateErrorData
              })
              if (tempValidateErrorData.length > 0) {
                validateErrorData = validateErrorData.concat(
                  [`<p>池子【${participant.name || participant.id}】:</p>`], tempValidateErrorData)
              }
            }
          // 处理正常单流程
          } else {
            const process = lodash.get(rootElements, '[0]', {})
            const flowElements = lodash.get(process, 'flowElements', [])
            const tempValidateErrorData = []
            this.handleModelProcess({
              flowElements,
              process,
              activityExtensionProperty,
              activityExtensionData,
              validateErrorData: tempValidateErrorData
            })
            if (tempValidateErrorData.length > 0) {
              validateErrorData = validateErrorData.concat(
                [`<p>流程【${process.name || process.id}】:</p>`], tempValidateErrorData)
            }
          }
          chain.push(validateErrorData)
          code === 1 && chain.push(deployModel({ id: response.id, category: '未分类' }))
          chain.push(activityExtensionPropertySave(activityExtensionProperty))
          chain.push(activityExtensionDataSave(activityExtensionData))
          return Promise.all(chain)
        }).catch(() => {
          return Promise.reject('保存流程模型失败!')
        })
      }).then(results => {
        results[0].length && this.$notify({
          title: '提示',
          message: results[0].join(''),
          type: 'warning',
          dangerouslyUseHTMLString: true
        })
        this.$message.success(results[1].data || '保存流程模型成功!')
        this.$emit('refresh')
        this.loading = false
      }).catch(err => {
        this.$message.error(err)
        this.loading = false
      })
    }
  }
}
</script>

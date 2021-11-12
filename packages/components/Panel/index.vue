<template>
  <el-aside class="panel-container" :style="{ width: `${width}px` }">
    <el-collapse value="base" accordion>
      <el-collapse-item name="base">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-identity"/>基本设置
        </div>
        <base-settings :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
      <el-collapse-item v-show="bpmnType === 'UserTask'" name="auditor">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-users"/>审核者
        </div>
        <auditor :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
      <el-collapse-item v-show="bpmnType === 'UserTask' || bpmnType === 'StartEvent'" name="form">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-form"/>表单设置
        </div>
        <form-settings :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
      <el-collapse-item v-show="bpmnType === 'SequenceFlow'" name="condition">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-condition"/>流转条件
        </div>
        <condition :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
      <el-collapse-item v-show="bpmnType === 'UserTask'" name="button">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-click"/>按钮配置
        </div>
        <button-config :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
      <el-collapse-item v-show="boundaryTimeValidate" name="boundaryTime">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-second"/>边界时间属性设置
        </div>
        <boundary-time-settings :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
      <el-collapse-item name="executionListener">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-execute"/>执行监听器
        </div>
        <execution-listener :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
      <el-collapse-item v-show="bpmnType === 'UserTask'" name="taskListener">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-task"/>任务监听器
        </div>
        <task-listener :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
      <el-collapse-item v-show="bpmnType === 'UserTask'" name="countersign">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-countersign"/>会签设置
        </div>
        <countersign-settings :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
      <el-collapse-item v-show="bpmnType === 'Process'" name="auth">
        <div slot="title" class="panel-tab-title">
          <span class="icon iconfont icon-permission"/>权限设置
        </div>
        <auth-settings :bpmn-element="bpmnElement" :bpmn-type="bpmnType" :modeler="modeler"/>
      </el-collapse-item>
    </el-collapse>
  </el-aside>
</template>

<script>
import baseSettings from './Base'
import auditor from './Auditor'
import formSettings from './Form'
import condition from './Condition'
import buttonConfig from './Button'
import executionListener from './ExecutionListener'
import taskListener from './TaskListener'
import countersignSettings from './Countersign'
import authSettings from './Auth'
import boundaryTimeSettings from './BoundaryTime'
import lodash from 'lodash'
export default {
  name: 'FlowablePanel',
  components: {
    baseSettings,
    auditor,
    formSettings,
    condition,
    buttonConfig,
    executionListener,
    taskListener,
    countersignSettings,
    authSettings,
    boundaryTimeSettings
  },
  props: {
    modeler: {
      type: Object
    },
    width: {
      type: Number
    }
  },
  data () {
    return {
      bpmnType: undefined,
      bpmnElement: {}
    }
  },
  computed: {
    boundaryTimeValidate () {
      return lodash.get(this.bpmnElement, 'businessObject.eventDefinitions[0].$type', '').split(':')[1] === 'TimerEventDefinition'
    }
  },
  mounted () {
    this.handleModeler()
  },
  methods: {
    handleModeler () {
      // 在根节点添加流程触发(池道,导入xml),保证首次打开默认选中流程元素
      this.modeler.on('root.added', ({ element }) => {
        element && this.handleBpmnElement(element)
      })
      // 点击工具栏触发
      this.modeler.on('selection.changed', ({ newSelection }) => {
        const element = newSelection[0]
        element && this.handleBpmnElement(element)
      })
      // 建模画布元素点击触发
      this.modeler.on('element.click', ({ element }) => {
        element && this.handleBpmnElement(element)
      })
      // 图形移除时,重置面板选择根流程元素
      this.modeler.on('shape.removed', () => {
        const element = this.modeler.get('canvas').getRootElement()
        element && this.handleBpmnElement(element)
      })
      // 连线移除时,重置面板选择根流程元素
      this.modeler.on('connection.removed', () => {
        const element = this.modeler.get('canvas').getRootElement()
        element && this.handleBpmnElement(element)
      })
    },
    handleBpmnElement (element) {
      this.bpmnElement = element
      this.bpmnType = element.type.split(':')[1]
    }
  }
}
</script>

<style lang="scss">
@import 'packages/assets/styles/flowable-panel';
</style>

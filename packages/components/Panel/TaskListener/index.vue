<template>
  <div class="panel-tab-content" style="padding: 5px;">
    <el-row style="margin: 5px;">
      <el-button type="primary"
                 size="mini"
                 @click="handleListenerSelect"
      >选择</el-button>
      <el-button type="primary"
                 size="mini"
                 @click="handleListenerAdd"
      >添加</el-button>
    </el-row>
    <el-table size="mini" :data="taskListenerList" border>
      <el-table-column label="事件" prop="event"/>
      <el-table-column label="类型" prop="valueType">
        <template slot-scope="scope">{{ {'1':'类', '2':'表达式', '3':'委托表达式'}[scope.row.valueType] }}</template>
      </el-table-column>
      <el-table-column label="实现" prop="value" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini"
                     type="text"
                     @click="handleRowUpdate(scope)"
          >修改</el-button>
          <el-button size="mini"
                     type="text"
                     @click="handleRowDel(scope)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <listener-list-template title="选择常用监听器"
                            :query-params="queryParams"
                            :visible.sync="listTemplateVisible"
                            :select-list="selectList"
                            @save="handleListTemplateSave"
    />
    <listener-add-template ref="addTemplate"
                           v-model="form"
                           title="添加任务监听器"
                           :visible.sync="addTemplateVisible"
                           :events="[
                             { label: 'start', value: 'start' },
                             { label: 'assignment', value: 'assignment' },
                             { label: 'complete', value: 'complete' },
                             { label: 'delete', value: 'delete' }
                           ]"
                           @save="handleAddTemplateSave"
    />
  </div>
</template>

<script>
import listenerAddTemplate from '@components/Panel/Popups/ListenerAddTemplate'
import listenerListTemplate from '@components/Panel/Popups/ListenerListTemplate'
import lodash from 'lodash'
export default {
  name: 'TaskListener',
  components: {
    listenerAddTemplate,
    listenerListTemplate
  },
  props: {
    modeler: {
      type: Object
    },
    bpmnElement: {
      type: Object
    },
    bpmnType: {
      type: String
    }
  },
  data () {
    return {
      bpmnBusinessObject: {},
      bpmnFactory: {},
      modeling: {},
      taskListenerList: [],
      listTemplateVisible: false,
      addTemplateVisible: false,
      form: {},
      rowIndex: -1,
      queryParams: {},
      selectList: []
    }
  },
  watch: {
    bpmnElement: {
      handler: function (val) {
        if (val) this.$nextTick(() => this.flushBpmnElement())
      }
    }
  },
  methods: {
    /** 当选择的bpmn元素发生变化,刷新数据 */
    flushBpmnElement () {
      this.bpmnBusinessObject = lodash.cloneDeep(this.bpmnElement.businessObject)
      this.bpmnFactory = this.modeler.get('bpmnFactory')
      this.modeling = this.modeler.get('modeling')
      // 下方为查询当前元素内部xml值区域////////////////////////////////
      const extensionElements = lodash.get(this.bpmnBusinessObject, 'extensionElements.values', [])
      const listenerExtension = lodash.filter(extensionElements, item => item.$type === 'flowable:TaskListener')
      // 查询监听器扩展数据进行数据格式化赋值处理
      this.taskListenerList = lodash.map(listenerExtension, (item) => {
        const listener = lodash.create({})
        // 设置集合模板勾引id
        if (item.id) lodash.set(listener, 'id', item.id)
        lodash.set(listener, 'event', item.event)
        if (('class' in item)) {
          lodash.set(listener, 'valueType', 1)
          lodash.set(listener, 'value', item.class)
        } else if (('expression' in item)) {
          lodash.set(listener, 'valueType', 2)
          lodash.set(listener, 'value', item.expression)
        } else if (('delegateExpression' in item)) {
          lodash.set(listener, 'valueType', 3)
          lodash.set(listener, 'value', item.delegateExpression)
        }
        return listener
      })
    },
    /** 处理集合模板保存 */
    handleListTemplateSave (uniqueTags) {
      // 不能直接覆盖使用新增模板添加的数据,需要进行合并
      const addTemplateList = this.taskListenerList.filter(item => !item.id)
      this.taskListenerList = [...uniqueTags, ...addTemplateList]
      this.handleMakeXml()
    },
    /** 处理新增模板保存 */
    handleAddTemplateSave () {
      this.$refs.addTemplate.validate((valid) => {
        if (valid) {
          // 去除选择模板数据,只有使用了新增模板就是新增模板的数据
          this.form.id && delete this.form.id
          // 通过判断索引来确定是否是行内修改
          if (this.rowIndex !== -1) {
            this.taskListenerList.splice(this.rowIndex, 1, this.form)
          } else {
            this.taskListenerList.push(this.form)
          }
          this.handleMakeXml()
          this.addTemplateVisible = false
        }
      })
    },
    /** 处理制作BpmnXml并且更新 */
    handleMakeXml () {
      // 制作扩展元素->flowable:TaskListener
      const extensionTaskListener = lodash.map(this.taskListenerList, (item) => {
        // 制作监听对象
        const listener = lodash.create({})
        lodash.set(listener, 'id', item.id)
        lodash.set(listener, 'event', item.event)
        switch (item.valueType) {
          case 1:
            lodash.set(listener, 'class', item.value)
            break
          case 2:
            lodash.set(listener, 'expression', item.value)
            break
          case 3:
            lodash.set(listener, 'delegateExpression', item.value)
            break
        }
        return this.bpmnFactory.create('flowable:TaskListener', listener)
      })
      // 查询其他扩展元素实现合并(更新也需要考虑不能覆盖其他自定义扩展元素)
      const extensionElements = lodash.get(this.bpmnElement.businessObject, 'extensionElements.values', [])
      const otherElement = lodash.filter(extensionElements, item => item.$type !== 'flowable:TaskListener')
      // 创建原生扩展属性对象,实现更新bpmnXml
      const extensions = this.bpmnFactory.create('bpmn:ExtensionElements', { values: lodash.concat(otherElement, extensionTaskListener) })
      this.modeling.updateProperties(this.bpmnElement, {
        extensionElements: extensions
      })
    },
    /** 处理行内删除 */
    handleRowDel (scope) {
      this.taskListenerList.splice(scope.$index, 1)
      this.handleMakeXml()
    },
    /** 处理行内更新 */
    handleRowUpdate (scope) {
      this.form = { ...scope.row }
      this.rowIndex = scope.$index
      this.addTemplateVisible = true
    },
    /** 处理监听器添加 */
    handleListenerAdd () {
      this.form = {
        event: '',
        valueType: 1,
        value: ''
      }
      this.rowIndex = -1
      this.addTemplateVisible = true
    },
    /** 处理监听器选择 */
    handleListenerSelect () {
      // 获取集合模板数据,模板内部标签可以设置初始勾选项
      this.selectList = this.taskListenerList.filter(item => item.id)
      this.queryParams = {
        current: 1,
        size: 10,
        listenerType: 2
      }
      this.listTemplateVisible = true
    }
  }
}
</script>

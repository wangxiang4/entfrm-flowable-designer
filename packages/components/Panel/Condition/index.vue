<template>
  <div class="panel-tab-content">
    <el-radio-group v-model="conditionType"
                    style="padding-left: 20px"
                    size="mini"
                    @change="handleFormalExpressionBuild"
    >
      <el-radio label="1">表单字段</el-radio>
      <el-radio label="2">流程表达式</el-radio>
    </el-radio-group>
    <el-divider/>
    <div v-show="conditionType === '1'">
      <el-row style="margin: 5px;">
        <el-button type="primary"
                   size="mini"
                   @click="handleFormFieldAdd"
        >添加</el-button>
      </el-row>
      <el-table size="mini" :data="conditionList" border>
        <el-table-column label="字段" prop="field">
          <template slot-scope="scope">
            <el-select v-model="scope.row.field"
                       size="mini"
                       placeholder="请选择"
                       @focus="handleStartNodeDynamicFormField"
                       @change="handleFormalExpressionBuild"
            >
              <el-option v-for="item in fieldOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="条件" prop="compare">
          <template slot-scope="scope">
            <el-select v-model="scope.row.compare"
                       size="mini"
                       @change="handleFormalExpressionBuild"
            >
              <el-option v-for="item in compareOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="值" prop="value">
          <template slot-scope="scope">
            <el-input v-model="scope.row.value"
                      size="mini"
                      placeholder="请输入内容"
                      @change="handleFormalExpressionBuild"
            />
          </template>
        </el-table-column>
        <el-table-column label="逻辑" prop="logic">
          <template slot-scope="scope">
            <el-select v-model="scope.row.logic"
                       size="mini"
                       @change="handleFormalExpressionBuild"
            >
              <el-option v-for="item in logicOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       icon="el-icon-delete"
                       @click="handleRowDel(scope)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-show="conditionType === '2'">
      <el-form label-width="100px" size="small" class="panel-form">
        <el-form-item label="流程表达式">
          <el-input v-model="processExpression"
                    class="input-with-select"
                    @change="handleUpdateXml"
          >
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="selectTemplateVisible=true"
            />
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <process-expression-select-template title="流程表达式选择" :visible.sync="selectTemplateVisible" @save="handleSelectTemplateSave"/>
  </div>
</template>

<script>
import ProcessExpressionSelectTemplate from '@components/Panel/Popups/ProcessExpressionSelectTemplate'
import lodash from 'lodash'
export default {
  name: 'Condition',
  components: {
    ProcessExpressionSelectTemplate
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
      conditionType: '1',
      conditionList: [],
      processExpression: '',
      fieldOptions: [],
      compareOptions: [
        {
          label: '小于',
          value: '<'
        },
        {
          label: '大于',
          value: '>'
        },
        {
          label: '大于等于',
          value: '<='
        }, {
          label: '等于',
          value: '='
        },
        {
          label: '大于等于',
          value: '>='
        }
      ],
      logicOptions: [
        {
          label: '且',
          value: 'and'
        },
        {
          label: '或',
          value: 'or'
        }
      ],
      selectTemplateVisible: false
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
      this.conditionType = lodash.get(this.bpmnElement.businessObject, '$attrs.flowable:conditionType', '1')
      this.processExpression = lodash.get(this.bpmnBusinessObject, 'conditionExpression.body', '')
      // 查询流程流转条件处理数据转换赋值
      const extensionElements = lodash.get(this.bpmnBusinessObject, 'extensionElements.values', [])
      const condition = lodash.filter(extensionElements, item => item.$type === 'flowable:Condition')
      this.conditionList = lodash.map(condition, (item) => {
        const condition = lodash.create({})
        lodash.set(condition, 'field', item.field)
        lodash.set(condition, 'compare', item.compare)
        lodash.set(condition, 'value', item.value)
        lodash.set(condition, 'logic', item.logic)
        lodash.set(condition, 'sort', item.sort)
        return condition
      })
    },
    /** 查询开始节点动态表单字段,可以拿启动时存储在flowable流程中的字段做流转判断 */
    handleStartNodeDynamicFormField () {
      // 获取根流程对象,注意必须要是根流程要不然多级子流程会出问题,以及需要注意泳道多流程同时进行
      let rootElement = lodash.get(this.bpmnElement, 'parent', {})
      while (rootElement.type === 'bpmn:SubProcess') rootElement = lodash.get(rootElement, 'parent', {})
      let rootBusinessObject = rootElement.businessObject
      rootElement.type === 'bpmn:Participant' && (rootBusinessObject = rootBusinessObject.processRef)
      const flowElements = lodash.get(rootBusinessObject, 'flowElements', [])
      // 这里使用find,原因:由于开始事件是可以删除的,不是固定的,所以采用查找从上往下找,找到就可以确定是第一个开始事件
      const startEventBusinessObject = lodash.find(flowElements, item => item.$type === 'bpmn:StartEvent')
      if (!lodash.isEmpty(startEventBusinessObject)) {
        // 获取动态表单字段
        const extensionElements = lodash.get(startEventBusinessObject, 'extensionElements.values', [])
        const formPropertyExtension = lodash.filter(extensionElements, item => item.$type === 'flowable:FormProperty')
        this.fieldOptions = formPropertyExtension.map(item => Object({ label: item.name, value: item.id }))
      } else this.fieldOptions = []
    },
    /** 处理选择模板保存 */
    handleSelectTemplateSave (processExpression) {
      this.processExpression = processExpression
      this.handleMakeXml()
    },
    /** 处理更新xml数据 */
    handleUpdateXml () {
      this.handleMakeXml()
    },
    /** 由于flowable工作流是需要一个表达式,所以表单字段设置后需要生成表达式 */
    handleFormalExpressionBuild () {
      const opt = {
        conditionFormalExpression: '',
        conditionFormalExpressionAnd: '',
        conditionFormalExpressionOr: ''
      }
      // 由于且跟或同时使用需要加括号要不然会出问题
      const conditionListLogicAnd = lodash.filter(this.conditionList, item => item.logic === 'and')
      const conditionListLogicOr = lodash.filter(this.conditionList, item => item.logic === 'or')
      lodash.forEach(conditionListLogicAnd, (item, index, collection) => {
        let formalExpression = `${item.field}${item.compare}${item.value}&&`
        // 如果是最后一个条件元素抛弃逻辑判断
        collection.length - 1 === index && (formalExpression = `${item.field}${item.compare}${item.value}`)
        opt.conditionFormalExpressionAnd += formalExpression
      })
      lodash.forEach(conditionListLogicOr, (item, index, collection) => {
        let formalExpression = `${item.field}${item.compare}${item.value}||`
        // 如果是最后一个条件元素抛弃逻辑判断
        collection.length - 1 === index && (formalExpression = `${item.field}${item.compare}${item.value}`)
        opt.conditionFormalExpressionOr += formalExpression
      })
      // 根据是否有那些条件去判断加不加括号
      if (opt.conditionFormalExpressionAnd && opt.conditionFormalExpressionOr) {
        opt.conditionFormalExpression = `(${opt.conditionFormalExpressionAnd})&&(${opt.conditionFormalExpressionOr})`
      } else if (opt.conditionFormalExpressionAnd) {
        opt.conditionFormalExpression = opt.conditionFormalExpressionAnd
      } else if (opt.conditionFormalExpressionOr) {
        opt.conditionFormalExpression = opt.conditionFormalExpressionOr
      }
      this.processExpression = opt.conditionFormalExpression && '${' + opt.conditionFormalExpression + '}'
      this.handleMakeXml()
    },
    /** 处理表单字段行内删除 */
    handleRowDel (scope) {
      this.conditionList.splice(scope.$index, 1)
      // 重新排序(删除数据会导致递增数的据断掉的一节)
      lodash.forEach(this.conditionList, (item, index) => { this.$set(item, 'sort', index) })
      this.handleFormalExpressionBuild()
    },
    /** 处理表单字段添加 */
    handleFormFieldAdd () {
      const condition = lodash.create({}, {
        field: '',
        compare: '<',
        value: '',
        logic: 'and',
        sort: 0
      })
      // 递增排序
      lodash.set(condition, 'sort', lodash.add(this.conditionList.length - 1, 1))
      this.conditionList.push(condition)
      this.handleFormalExpressionBuild()
    },
    /** 处理制作BpmnXml并且更新 */
    handleMakeXml () {
      // 制作扩展元素->flowable:Condition
      const extensionCondition = lodash.map(this.conditionList, (item) => {
        return this.bpmnFactory.create('flowable:Condition', {
          field: item.field,
          compare: item.compare,
          value: item.value,
          logic: item.logic,
          sort: item.sort
        })
      })
      // 查询其他扩展元素实现合并(更新也需要考虑不能覆盖其他自定义扩展元素)
      const extensionElements = lodash.get(this.bpmnElement.businessObject, 'extensionElements.values', [])
      const otherElement = lodash.filter(extensionElements, item => item.$type !== 'flowable:Condition')
      // 创建原生扩展属性对象,实现更新bpmnXml
      const extensions = this.bpmnFactory.create('bpmn:ExtensionElements', { values: lodash.concat(otherElement, extensionCondition) })
      const expression = this.bpmnFactory.create('bpmn:FormalExpression', { body: this.processExpression })
      this.modeling.updateProperties(this.bpmnElement, {
        'flowable:conditionType': this.conditionType,
        extensionElements: extensions,
        conditionExpression: expression
      })
    }
  }
}
</script>

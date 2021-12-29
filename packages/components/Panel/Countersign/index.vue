<template>
  <div class="panel-tab-content">
    <el-form :model="countersign" label-width="182px" size="small">
      <el-form-item label="多实例类型">
        <el-select v-model="countersign.multiInstanceType" @change="handleUpdateXml">
          <el-option v-for="item in options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="countersign.multiInstanceType!==1" label="完成条件">
        <el-radio-group v-model="countersign.completionConditions"
                        @change="handleResetScale"
        >
          <el-radio :label="1">全部通过</el-radio>
          <el-radio :label="2">按比例通过</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="countersign.multiInstanceType!==1">
        <el-input-number v-model="countersign.completionRate"
                         :disabled="countersign.completionConditions===1"
                         :min="1"
                         :max="100"
                         @change="handleUpdateXml"
        />%
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import lodash from 'lodash'
export default {
  name: 'Countersign',
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
      countersign: {
        multiInstanceType: 1,
        completionConditions: 1,
        completionRate: 100
      },
      options: [
        {
          label: '非会签',
          value: 1
        },
        {
          label: '并行会签',
          value: 2
        },
        {
          label: '串行会签',
          value: 3
        }
      ]
    }
  },
  watch: {
    bpmnElement: {
      handler: function (val) {
        if (val) {
          this.clearDirtyData()
          this.$nextTick(() => this.flushBpmnElement())
        }
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
      const multiInstance = lodash.get(this.bpmnBusinessObject, 'loopCharacteristics', '')
      if (!lodash.isEmpty(multiInstance)) {
        // 获取计算通过比例率,以及数据转换赋值
        const rate = lodash.get(this.bpmnElement.businessObject.loopCharacteristics, '$attrs.rate', 1)
        if (('isSequential' in multiInstance)) {
          this.$set(this.countersign, 'multiInstanceType', 3)
        } else {
          this.$set(this.countersign, 'multiInstanceType', 2)
        }
        if (rate === 1) {
          this.$set(this.countersign, 'completionConditions', 1)
        } else {
          this.$set(this.countersign, 'completionConditions', 2)
        }
        const proportionalRate = lodash.multiply(100, rate)
        this.$set(this.countersign, 'completionRate', proportionalRate)
      }
    },
    /** 处理更新xml */
    handleUpdateXml () {
      this.handleMakeXml()
    },
    /** 处理制作BpmnXml并且更新 */
    handleMakeXml () {
      // 多实例变量定义
      const variable = lodash.create({}, {
        collection: '${mutiInstanceHandler.getList(execution)}',
        elementVariable: 'assignee',
        // 计算通过比例率
        proportionalRate: lodash.multiply(this.countersign.completionRate, 0.01)
      })
      // 处理多位小数点时截取2位小数点
      lodash.isSafeInteger(variable.proportionalRate) || lodash.set(variable, 'proportionalRate', variable.proportionalRate.toFixed(2))
      // 创建实例完成通过条件表达式
      const expression = this.bpmnFactory.create('bpmn:FormalExpression', { body: '${nrOfCompletedInstances/nrOfInstances >= ' + variable.proportionalRate + ' }' })
      // 创建多实例对象
      const multiInstance = lodash.create({}, {
        rate: variable.proportionalRate,
        completionCondition: expression,
        collection: variable.collection,
        elementVariable: variable.elementVariable
      })
      // 创建原生多实例属性对象,实现更新bpmnXml
      const bpmnXmlUpdateObj = lodash.create({})
      switch (this.countersign.multiInstanceType) {
        case 1:
          lodash.set(bpmnXmlUpdateObj, 'assignee', undefined)
          lodash.set(bpmnXmlUpdateObj, 'loopCharacteristics', undefined)
          break
        case 2:
          lodash.set(bpmnXmlUpdateObj, 'assignee', '${' + variable.elementVariable + '}')
          lodash.set(bpmnXmlUpdateObj, 'loopCharacteristics',
            this.bpmnFactory.create('bpmn:MultiInstanceLoopCharacteristics', multiInstance))
          break
        case 3:
          // 设置多实例串行会签
          lodash.set(multiInstance, 'isSequential', true)
          lodash.set(bpmnXmlUpdateObj, 'assignee', '${' + variable.elementVariable + '}')
          lodash.set(bpmnXmlUpdateObj, 'loopCharacteristics',
            this.bpmnFactory.create('bpmn:MultiInstanceLoopCharacteristics', multiInstance))
          break
      }
      this.modeling.updateProperties(this.bpmnElement, bpmnXmlUpdateObj)
    },
    /** 处理完成比例重置数据 */
    handleResetScale (value) {
      value === 1 && (this.countersign.completionRate = 100)
      this.handleMakeXml()
    },
    /** 每次bpmn元素发生变化,需要清理的脏数据 */
    clearDirtyData () {
      this.countersign = {
        multiInstanceType: 1,
        completionConditions: 1,
        completionRate: 100
      }
    }
  }
}
</script>

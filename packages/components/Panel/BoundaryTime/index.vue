<template>
  <div class="panel-tab-content">
    <el-form :model="form" label-width="100px" size="small" class="panel-form">
      <el-form-item label="定时类型">
        <el-select v-model="form.timingType" @change="handleUpdateXml">
          <el-option v-for="item in options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="值">
        <el-input v-model="form.timingValue" @change="handleUpdateXml"/>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import lodash from 'lodash'
export default {
  name: 'BoundaryTime',
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
      form: {
        timingType: '',
        timingValue: ''
      },
      options: [
        {
          value: 'timeDate',
          label: 'Date(采用ISO-8601日期时间)'
        }, {
          value: 'timeDuration',
          label: 'Duration(持续时间)'
        }, {
          value: 'timeCycle',
          label: 'Cycle(时间周期)'
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
      const timerEventDefinition = lodash.get(this.bpmnBusinessObject, 'eventDefinitions[0]', {})
      // 保留源数据因为后面更新定时器事件元素需要使用,原因只能使用源生的,如果使用了创建了就不是更新当前定时器事件了
      this.timerEventDefinition = lodash.get(this.bpmnElement.businessObject, 'eventDefinitions[0]', {})
      // 查询定时器事件定义数据进行数据格式化赋值处理
      if (!lodash.isEmpty(timerEventDefinition)) {
        if (('timeDate' in timerEventDefinition)) {
          this.$set(this.form, 'timingType', 'timeDate')
          this.$set(this.form, 'timingValue', lodash.get(timerEventDefinition, 'timeDate.body', ''))
        } else if (('timeDuration' in timerEventDefinition)) {
          this.$set(this.form, 'timingType', 'timeDuration')
          this.$set(this.form, 'timingValue', lodash.get(timerEventDefinition, 'timeDuration.body', ''))
        } else if (('timeCycle' in timerEventDefinition)) {
          this.$set(this.form, 'timingType', 'timeCycle')
          this.$set(this.form, 'timingValue', lodash.get(timerEventDefinition, 'timeCycle.body', ''))
        }
      }
    },
    /** 处理更新xml */
    handleUpdateXml () {
      this.handleMakeXml()
    },
    /** 处理制作BpmnXml并且更新 */
    handleMakeXml () {
      // 创建定时器事件定义
      const timerEventDefinition = lodash.create({}, {
        timeDate: undefined,
        timeDuration: undefined,
        timeCycle: undefined
      })
      // 设置定时器正式表达
      const expression = this.bpmnFactory.create('bpmn:FormalExpression', { body: this.form.timingValue || undefined })
      switch (this.form.timingType) {
        case 'timeDate':
          lodash.set(timerEventDefinition, 'timeDate', expression)
          break
        case 'timeDuration':
          lodash.set(timerEventDefinition, 'timeDuration', expression)
          break
        case 'timeCycle':
          lodash.set(timerEventDefinition, 'timeCycle', expression)
          break
      }
      // 避免timerEventDefinition没有更新报错,并且实现更新bpmnXml
      lodash.isEmpty(this.timerEventDefinition) && (this.timerEventDefinition = this.bpmnFactory.create('bpmn:TimerEventDefinition'))
      this.modeling.updateModdleProperties(this.bpmnElement, this.timerEventDefinition, timerEventDefinition)
    },
    /** 每次bpmn元素发生变化,需要清理的脏数据 */
    clearDirtyData () {
      this.form = {
        timingType: '',
        timingValue: ''
      }
    }
  }
}
</script>

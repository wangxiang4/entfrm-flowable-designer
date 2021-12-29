<template>
  <div class="panel-tab-content">
    <el-form :model="form" label-width="100px" size="small" class="panel-form">
      <el-form-item label="ID">
        <el-input v-model="form.id" @change="handleUpdateXml"/>
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="form.name" @change="handleUpdateXml"/>
      </el-form-item>
      <el-form-item label="描述信息">
        <el-input v-model="form.documentation"
                  type="textarea"
                  resize="vertical"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  @change="handleUpdateXml"
        />
      </el-form-item>
      <template v-if="bpmnBusinessObject.$type === 'bpmn:StartEvent'">
        <el-form-item label="流程发起人">
          <el-input :disabled="true" :value="bpmnBusinessObject.initiator"/>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>

import lodash from 'lodash'
export default {
  name: 'Base',
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
        id: '',
        name: '',
        documentation: ''
      }
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
      this.$set(this.form, 'id', this.bpmnBusinessObject.id)
      this.$set(this.form, 'name', this.bpmnBusinessObject.name)
      this.$set(this.form, 'documentation', lodash.get(this.bpmnBusinessObject, 'documentation[0].text', ''))
    },
    /** 处理更新xml */
    handleUpdateXml () {
      this.handleMakeXml()
    },
    /** 处理制作BpmnXml并且更新 */
    handleMakeXml () {
      // 创建bpmn业务元素属性对象,这里可以不需要关心id是否重复非空(查看了内部源码发现内部已经做了处理)
      const bpmnBusinessAttr = lodash.create({})
      lodash.set(bpmnBusinessAttr, 'id', this.form.id)
      lodash.set(bpmnBusinessAttr, 'name', this.form.name)
      // 如果描述信息不存在,则去除bpmn:Documentation元素
      lodash.set(bpmnBusinessAttr, 'documentation',
        this.form.documentation ? [this.bpmnFactory.create('bpmn:Documentation', { text: this.form.documentation })] : undefined)
      this.modeling.updateProperties(this.bpmnElement, bpmnBusinessAttr)
    }
  }
}
</script>

<template>
  <div class="panel-tab-content" style="padding: 5px;">
    <el-row style="margin: 5px;">
      <el-button type="primary"
                 size="mini"
                 @click="staffAssignmentsTemplateVisible=true"
      >分配人员</el-button>
    </el-row>
    <el-table size="mini" :data="assignList" border>
      <el-table-column prop="typeName" label="用户类型"/>
      <el-table-column prop="assignNames" label="用户来自"/>
    </el-table>
    <staff-assignments-template v-model="assignList"
                                title="节点人员设置"
                                ref="staffAssignments"
                                :visible.sync="staffAssignmentsTemplateVisible"
                                @save="handleMakeXml"
    />
  </div>
</template>

<script>
import lodash from 'lodash'
import StaffAssignmentsTemplate from '@components/Panel/Popups/StaffAssignmentsTemplate'
import { getDept, getRoleByIds, getUserByIds } from '@/api/panel'
export default {
  name: 'Auditor',
  components: {
    StaffAssignmentsTemplate
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
      assignList: [],
      staffAssignmentsTemplateVisible: false
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
    // 当选择的bpmn元素发生变化,刷新数据
    flushBpmnElement () {
      this.bpmnBusinessObject = lodash.cloneDeep(this.bpmnElement.businessObject)
      this.bpmnFactory = this.modeler.get('bpmnFactory')
      this.modeling = this.modeler.get('modeling')
      // 下方为查询当前元素内部xml值区域////////////////////////////////
      const extensionElements = lodash.get(this.bpmnBusinessObject, 'extensionElements.values', [])
      const assigneeExtension = lodash.filter(extensionElements, item => item.$type === 'flowable:Assignee')
      const typeOptions = this.$refs.staffAssignments.options
      // 查询分配人员扩展数据进行数据格式化赋值处理
      this.assignList = lodash.map(assigneeExtension, item => {
        const assign = lodash.create({}, {
          // 分配类型
          typeId: '',
          typeName: '',
          // 人员分配
          assignIds: '',
          assignNames: '',
          sort: 0,
          // 保留分配勾选数据,避免过多查询,浪费系统资源
          assign: []
        })
        lodash.set(assign, 'typeId', item.type)
        lodash.set(assign, 'typeName', lodash.get(lodash.find(typeOptions, { 'value': item.type }), 'label', ''))
        lodash.set(assign, 'assignIds', item.value)
        lodash.set(assign, 'assignNames', item.value)
        lodash.set(assign, 'sort', item.sort)
        return assign
      })
      this.getList()
    },
    // 处理制作BpmnXml并且更新
    handleMakeXml () {
      // 去除没有没有分配人员的数据
      const assignList = lodash.filter(this.assignList, item => item.ids)
      // 制作扩展元素->flowable:Assignee
      const extensionAssignee = lodash.map(assignList, (item) => {
        return this.bpmnFactory.create('flowable:Assignee', {
          type: item.typeId,
          value: item.assignIds,
          sort: item.sort,
          operationType: '0',
          condition: '0'
        })
      })
      // 查询其他扩展元素实现合并(更新也需要考虑不能覆盖其他自定义扩展元素)
      const extensionElements = lodash.get(this.bpmnElement.businessObject, 'extensionElements.values', [])
      const otherElement = lodash.filter(extensionElements, item => item.$type !== 'flowable:Assignee')
      // 创建原生扩展属性对象,实现更新bpmnXml
      const extensions = this.bpmnFactory.create('bpmn:ExtensionElements', { values: lodash.concat(otherElement, extensionAssignee) })
      this.modeling.updateProperties(this.bpmnElement, {
        extensionElements: extensions
      })
      // 剔除没有分配的数据
      this.assignList = assignList
    },
    // 根据ID查询集合数据
    getList () {
      const axiosList = []
      lodash.forEach(this.assignList, item => {
        switch (item.typeId) {
          case 'user':
            item.assignIds && axiosList.push(getUserByIds(item.assignIds.split(','))
              .then(response => {
                item.assign = lodash.get(response, 'data', [])
                this.$set(item, 'assignNames', item.assign.map(item => item.userName).join(','))
              }))
            break
          case 'company':
            item.assignIds && axiosList.push(getDept(item.assignIds).then(response => {
              item.assign = lodash.get(response, 'data', {})
              this.$set(item, 'assignNames', item.assign.name || '')
            }))
            break
          case 'role':
            item.assignIds && axiosList.push(getRoleByIds(item.assignIds.split(','))
              .then(response => {
                item.assign = lodash.get(response, 'data', [])
                this.$set(item, 'assignNames', item.assign.map(item => item.name).join(','))
              }))
            break
        }
      })
      return Promise.all(axiosList)
    }
  }
}
</script>

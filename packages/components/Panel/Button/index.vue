<template>
  <div class="panel-tab-content" style="padding: 5px;">
    <el-row style="margin: 5px;">
      <el-button type="primary"
                 size="mini"
                 @click="handleButtonSelect"
      >选择按钮</el-button>
      <el-button type="primary"
                 size="mini"
                 @click="handleButtonAdd"
      >添加按钮</el-button>
    </el-row>
    <el-table size="mini" :data="buttonList" border>
      <el-table-column label="名称" prop="name"/>
      <el-table-column label="编码" prop="code"/>
      <el-table-column label="排序" prop="sort"/>
      <el-table-column label="是否隐藏" prop="isHide">
        <template slot-scope="scope">{{ scope.row.isHide==="0"?"否":"是" }}</template>
      </el-table-column>
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
    <button-list-template title="选择常用按钮"
                          :visible.sync="listTemplateVisible"
                          :select-list="selectList"
                          @save="handleListTemplateSave"
    />
    <button-add-template ref="addTemplate"
                         v-model="form"
                         title="编辑按钮"
                         :visible.sync="addTemplateVisible"
                         @save="handleAddTemplateSave"
    />
  </div>
</template>

<script>
import buttonListTemplate from '@components/Panel/Popups/ButtonListTemplate'
import buttonAddTemplate from '@components/Panel/Popups/ButtonAddTemplate'
import lodash from 'lodash'
export default {
  name: 'Button',
  components: {
    buttonListTemplate,
    buttonAddTemplate
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
      buttonList: [],
      listTemplateVisible: false,
      addTemplateVisible: false,
      form: {},
      rowIndex: -1,
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
      const buttonExtension = lodash.filter(extensionElements, item => item.$type === 'flowable:Button')
      // 查询按钮扩展数据进行数据格式化赋值处理
      this.buttonList = lodash.map(buttonExtension, (item) => {
        const button = lodash.create({})
        // 设置集合模板勾引id
        if (item.id) lodash.set(button, 'id', item.id)
        lodash.set(button, 'name', item.name)
        lodash.set(button, 'code', item.code)
        lodash.set(button, 'isHide', item.isHide)
        lodash.set(button, 'sort', item.sort)
        return button
      })
    },
    /** 处理集合模板保存 */
    handleListTemplateSave (uniqueTags) {
      // 设置默认隐藏值(0:不隐藏)
      lodash.forEach(uniqueTags, item => { item.isHide = '0' })
      // 不能直接覆盖使用新增模板添加的数据,需要进行合并
      const addTemplateList = this.buttonList.filter(item => !item.id)
      this.buttonList = [...uniqueTags, ...addTemplateList]
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
            this.buttonList.splice(this.rowIndex, 1, this.form)
          } else {
            this.buttonList.push(this.form)
          }
          this.handleMakeXml()
          this.addTemplateVisible = false
        }
      })
    },
    /** 处理制作BpmnXml并且更新 */
    handleMakeXml () {
      // 制作扩展元素->flowable:Button
      const extensionButton = lodash.map(this.buttonList, (item) => {
        return this.bpmnFactory.create('flowable:Button', {
          id: item.id,
          name: item.name,
          code: item.code,
          isHide: item.isHide,
          sort: item.sort,
          next: '0'
        })
      })
      // 查询其他扩展元素实现合并(更新也需要考虑不能覆盖其他自定义扩展元素)
      const extensionElements = lodash.get(this.bpmnElement.businessObject, 'extensionElements.values', [])
      const otherElement = lodash.filter(extensionElements, item => item.$type !== 'flowable:Button')
      // 创建原生扩展属性对象,实现更新bpmnXml
      const extensions = this.bpmnFactory.create('bpmn:ExtensionElements', { values: lodash.concat(otherElement, extensionButton) })
      this.modeling.updateProperties(this.bpmnElement, {
        extensionElements: extensions
      })
    },
    /** 处理行内删除 */
    handleRowDel (scope) {
      this.buttonList.splice(scope.$index, 1)
      this.handleMakeXml()
    },
    /** 处理行内更新 */
    handleRowUpdate (scope) {
      this.form = { ...scope.row }
      this.rowIndex = scope.$index
      this.addTemplateVisible = true
    },
    /** 处理按钮添加 */
    handleButtonAdd () {
      this.form = {
        name: '',
        code: '',
        sort: 0,
        isHide: '0'
      }
      this.rowIndex = -1
      this.addTemplateVisible = true
    },
    /** 处理按钮选择 */
    handleButtonSelect () {
      // 获取集合模板数据,模板内部标签可以设置初始勾选项
      this.selectList = this.buttonList.filter(item => item.id)
      this.listTemplateVisible = true
    }
  }
}
</script>

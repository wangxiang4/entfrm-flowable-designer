<template>
  <div class="panel-tab-content">
    <el-radio-group v-model="formType"
                    style="padding-left: 20px"
                    size="mini"
                    @change="handleUpdateXml"
    >
      <el-radio label="1">动态表单</el-radio>
      <el-radio label="2">外置表单</el-radio>
    </el-radio-group>
    <el-divider/>
    <div v-show="formType === '1'">
      <el-row style="margin: 5px;">
        <el-button icon="el-icon-plus"
                   type="primary"
                   size="mini"
                   :disabled="formList.length>=1"
                   @click="formSelectTemplateVisible=true"
        >添加</el-button>
        <el-button icon="el-icon-edit-outline"
                   type="primary"
                   size="mini"
                   :disabled="formList.length===0"
                   @click="handleUpdateForm"
        >修改</el-button>
        <el-button icon="el-icon-delete"
                   type="primary"
                   size="mini"
                   :disabled="formList.length===0"
                   @click="handleDeleteDyForm"
        >删除</el-button>
      </el-row>
      <el-table size="mini" :data="formList" border>
        <el-table-column type="expand" width="60">
          <template slot-scope="scope">
            <el-table size="mini" :data="scope.row.dynamicFormField" style="width: 100%" border>
              <el-table-column type="index" align="center" width="50"/>
              <el-table-column label="字段名称" prop="name"/>
              <el-table-column label="字段ID" prop="id"/>
              <el-table-column label="可读" align="center" width="55">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.readable" @change="handleUpdateXml"/>
                </template>
              </el-table-column>
              <el-table-column label="可写" align="center" width="55">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.writable" @change="handleUpdateXml"/>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="表单名称" prop="name"/>
        <el-table-column label="版本" prop="version"/>
        <el-table-column label="表单key" prop="formKey"/>
      </el-table>
    </div>
    <div v-show="formType === '2'">
      <el-form :model="outForm" label-width="100px" size="small" class="panel-form">
        <el-form-item label="表单地址">
          <el-input v-model="outForm.formKey" @change="handleUpdateXml"/>
        </el-form-item>
        <el-form-item label="表单只读">
          <el-checkbox v-model="outForm.formReadOnly"
                       :disabled="bpmnBusinessObject.$type === 'bpmn:StartEvent'"
                       @change="handleUpdateXml"
          >勾选执行此审批节点时表单不可以修改。</el-checkbox>
        </el-form-item>
      </el-form>
    </div>
    <form-select-template v-model="dyFormKey"
                          title="选择动态表单"
                          :visible.sync="formSelectTemplateVisible"
                          :options="options"
                          @save="handleSelectTemplateSave"
    />
  </div>
</template>

<script>
import FormSelectTemplate from '@components/Panel/Popups/FormSelectTemplate'
import { listForm } from '@/api/panel'
import { getLocalStorage, setLocalStorage } from '@utils/cache'
import lodash from 'lodash'
export default {
  name: 'Form',
  components: {
    FormSelectTemplate
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
      formType: '1',
      formList: [],
      outForm: {
        formKey: '',
        formReadOnly: false
      },
      queryParams: { type: 1 },
      formSelectTemplateVisible: false,
      dyFormKey: '',
      options: []
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
  created () {
    this.getListForm()
  },
  methods: {
    // 初始化获取动态表单
    getListForm () {
      listForm(this.queryParams).then(response => {
        this.options = response.data
      })
    },
    // 当选择的bpmn元素发生变化,刷新数据
    flushBpmnElement () {
      this.bpmnBusinessObject = lodash.cloneDeep(this.bpmnElement.businessObject)
      this.bpmnFactory = this.modeler.get('bpmnFactory')
      this.modeling = this.modeler.get('modeling')
      // 下方为查询当前元素内部xml值区域////////////////////////////////
      const formKey = lodash.get(this.bpmnBusinessObject, 'formKey', '')
      this.formType = lodash.get(this.bpmnBusinessObject, 'formType', '1')
      this.$set(this.outForm, 'formReadOnly', lodash.get(this.bpmnBusinessObject, 'formReadOnly', false))
      // 缓存表单数据,以防意外刷新网页造成静态数据丢失,(获取逻辑:[1:获取外置表单缓存,2:获取动态表单缓存])
      this.$set(this.outForm, 'formKey', this.formType === '2' ? formKey : (getLocalStorage(this.bpmnBusinessObject.id + 'outFormKey') || ''))
      const dyFormKey = this.formType === '1' ? formKey : (getLocalStorage(this.bpmnBusinessObject.id + 'dyFormKey') || '')
      // 查询动态表单数据进行数据格式化处理(格式化成父子嵌套数据)
      const form = lodash.find(this.options, item => item.code === dyFormKey)
      if (!lodash.isEmpty(form)) {
        const dyForm = lodash.create({})
        lodash.set(dyForm, 'name', form.name)
        lodash.set(dyForm, 'version', form.version)
        lodash.set(dyForm, 'formKey', dyFormKey)
        const extensionElements = lodash.get(this.bpmnBusinessObject, 'extensionElements.values', [])
        const formPropertyExtension = lodash.filter(extensionElements, item => item.$type === 'flowable:FormProperty')
        const dynamicFormField = formPropertyExtension.map(item => {
          const formProperty = lodash.create({})
          lodash.set(formProperty, 'id', item['id'])
          lodash.set(formProperty, 'name', item['name'])
          lodash.set(formProperty, 'readable', item['readable'])
          lodash.set(formProperty, 'writable', item['writable'])
          return formProperty
        })
        lodash.set(dyForm, 'dynamicFormField', dynamicFormField)
        this.formList = [dyForm]
      }
    },
    // 处理选择模板保存
    handleSelectTemplateSave (form) {
      const dyForm = lodash.create({})
      lodash.set(dyForm, 'name', form.name)
      lodash.set(dyForm, 'version', form.version)
      lodash.set(dyForm, 'formKey', form.code)
      const dynamicForm = eval('(' + form.data + ')') || {}
      const dynamicFormField = (dynamicForm.column || []).map(item => {
        const formProperty = lodash.create({})
        lodash.set(formProperty, 'id', item.prop)
        lodash.set(formProperty, 'name', item.label)
        lodash.set(formProperty, 'readable', true)
        lodash.set(formProperty, 'writable', true)
        return formProperty
      })
      lodash.set(dyForm, 'dynamicFormField', dynamicFormField)
      this.formList = [dyForm]
      this.handleMakeXml()
    },
    // 处理制作BpmnXml并且更新
    handleMakeXml () {
      const formKey = this.formType === '1'
        ? lodash.get(this.formList[0], 'formKey', '')
        : lodash.get(this.outForm, 'formKey', '')
      const bpmnXmlUpdateObj = lodash.create({}, {
        formKey: formKey,
        formType: this.formType,
        outFormKey: lodash.get(this.outForm, 'formKey', ''),
        formReadOnly: lodash.get(this.outForm, 'formReadOnly', false)
      })
      // 制作扩展元素->flowable:FormProperty
      const extensionFormProperty = lodash.map(
        lodash.get(this.formList[0], 'dynamicFormField', []),
        (item) => this.bpmnFactory.create('flowable:FormProperty', {
          id: item.id,
          name: item.name,
          readable: item.readable,
          writable: item.writable
        }))
      // 查询其他扩展元素实现合并(更新也需要考虑不能覆盖其他自定义扩展元素)
      const extensionElements = lodash.get(this.bpmnElement.businessObject, 'extensionElements.values', [])
      const otherElement = lodash.filter(extensionElements, item => item.$type !== 'flowable:FormProperty')
      // 创建原生扩展属性对象,实现更新bpmnXml
      const extensions = this.bpmnFactory.create('bpmn:ExtensionElements', { values: lodash.concat(otherElement, extensionFormProperty) })
      lodash.set(bpmnXmlUpdateObj, 'extensionElements', extensions)
      this.modeling.updateProperties(this.bpmnElement, bpmnXmlUpdateObj)
      // 提交缓存(动态表单key与外置表单key)
      setLocalStorage(this.bpmnBusinessObject.id + 'dyFormKey', lodash.get(this.formList[0], 'formKey', ''))
      setLocalStorage(this.bpmnBusinessObject.id + 'outFormKey', lodash.get(this.outForm, 'formKey', ''))
    },
    // 处理更新xml
    handleUpdateXml () {
      this.handleMakeXml()
    },
    // 处理动态表单更新
    handleUpdateForm () {
      this.dyFormKey = lodash.get(this.formList[0], 'formKey', '')
      this.formSelectTemplateVisible = true
    },
    // 处理动态表单删除
    handleDeleteDyForm () {
      this.$confirm('确定删除动态表单吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.formList = []
        this.handleMakeXml()
      }).catch(function () {})
    },
    // 每次bpmn元素发生变化,需要清理的脏数据
    clearDirtyData () {
      this.formList = []
    }
  }
}
</script>

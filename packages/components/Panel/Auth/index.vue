<template>
  <div class="panel-tab-content">
    <el-form :model="form" label-width="100px" size="small" class="panel-form">
      <el-form-item label="允许启动:">
        <el-radio-group v-model="form.starterType" @change="handleUpdateXml">
          <el-radio :label="1">所有成员</el-radio>
          <el-radio :label="2">指定成员</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="form.starterType===2" label="添加用户:">
        <el-input :readonly="true"
                  placeholder="请选择"
                  :value="form.userNames"
                  class="input-with-select"
        >
          <el-button slot="append"
                     icon="el-icon-search"
                     @click="handleUserSelectSearch"
          />
        </el-input>
      </el-form-item>
      <el-form-item v-show="form.starterType===2" label="添加角色:">
        <el-input :readonly="true"
                  placeholder="请选择"
                  :value="form.roleNames"
                  class="input-with-select"
        >
          <el-button slot="append"
                     icon="el-icon-search"
                     @click="handleRoleSelectSearch"
          />
        </el-input>
      </el-form-item>
    </el-form>
    <role-select-template title="选择角色"
                          :select-list="roleSelectList"
                          :visible.sync="roleSelectTemplateVisible"
                          @save="handleRoleSelectTemplateSave"
    />
    <user-select-template title="用户选择"
                          :select-list="userSelectList"
                          :visible.sync="userSelectTemplateVisible"
                          @save="handleUserSelectTemplateSave"
    />
  </div>
</template>

<script>
import { getRoleByIds, getUserByIds } from '@/api/panel'
import roleSelectTemplate from '@components/Panel/Popups/RoleSelectTemplate'
import userSelectTemplate from '@components/Panel/Popups/UserSelectTemplate'
import lodash from 'lodash'
export default {
  name: 'Auth',
  components: {
    roleSelectTemplate,
    userSelectTemplate
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
      form: {
        starterType: 1,
        // 候选组
        roleIds: undefined,
        roleNames: '',
        // 候选人
        userIds: undefined,
        userNames: ''
      },
      userTemplateStore: [],
      roleTemplateStore: [],
      userSelectList: [],
      roleSelectList: [],
      roleSelectTemplateVisible: false,
      userSelectTemplateVisible: false
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
    // 当选择的bpmn元素发生变化,刷新数据
    flushBpmnElement () {
      this.bpmnBusinessObject = lodash.cloneDeep(this.bpmnElement.businessObject)
      this.bpmnFactory = this.modeler.get('bpmnFactory')
      this.modeling = this.modeler.get('modeling')
      // 下方为查询当前元素内部xml值区域////////////////////////////////
      const candidateStarterUsers = lodash.get(this.bpmnBusinessObject, 'candidateStarterUsers', '')
      const candidateStarterGroups = lodash.get(this.bpmnBusinessObject, 'candidateStarterGroups', '')
      // 当存在候选组跟候选用户时,设置为指定人员并且加载对应的值
      if (candidateStarterUsers || candidateStarterGroups) {
        this.form = lodash.create({}, {
          starterType: 2,
          roleIds: candidateStarterGroups,
          roleNames: '',
          userIds: candidateStarterUsers,
          userNames: ''
        })
        // 处理names赋值
        this.getList().then(() => {
          this.$set(this.form, 'userNames', this.userTemplateStore.map(item => item.userName).join(','))
          this.$set(this.form, 'roleNames', this.roleTemplateStore.map(item => item.name).join(','))
        })
      }
    },
    // 处理角色选择模板保存
    handleRoleSelectTemplateSave (uniqueTags) {
      this.roleTemplateStore = lodash.cloneDeep(uniqueTags)
      // 抽出勾选数据的name与id进行赋值
      this.$set(this.form, 'roleIds', this.roleTemplateStore.map(item => item.id).join(','))
      this.$set(this.form, 'roleNames', this.roleTemplateStore.map(item => item.name).join(','))
      this.handleMakeXml()
    },
    // 处理用户选择模板保存
    handleUserSelectTemplateSave (uniqueTags) {
      this.userTemplateStore = lodash.cloneDeep(uniqueTags)
      // 抽出勾选数据的name与id进行赋值
      this.$set(this.form, 'userIds', this.userTemplateStore.map(item => item.id).join(','))
      this.$set(this.form, 'userNames', this.userTemplateStore.map(item => item.userName).join(','))
      this.handleMakeXml()
    },
    // 处理更新xml
    handleUpdateXml () {
      this.handleMakeXml()
    },
    // 处理制作BpmnXml并且更新
    handleMakeXml () {
      // 创建bpmn业务元素属性对象,实现更新bpmnXml
      const bpmnBusinessAttr = lodash.create({})
      switch (this.form.starterType) {
        case 1:
          // 所有成员,则移除指定属性
          lodash.set(bpmnBusinessAttr, 'candidateStarterUsers', undefined)
          lodash.set(bpmnBusinessAttr, 'candidateStarterGroups', undefined)
          break
        case 2:
          // 指定成员,设置指定属性
          lodash.set(bpmnBusinessAttr, 'candidateStarterUsers', this.form.userIds)
          lodash.set(bpmnBusinessAttr, 'candidateStarterGroups', this.form.roleIds)
          break
      }
      this.modeling.updateProperties(this.bpmnElement, bpmnBusinessAttr)
    },
    // 每次bpmn元素发生变化,需要清理的脏数据
    clearDirtyData () {
      this.form = {
        starterType: 1,
        // 候选组
        roleIds: undefined,
        roleNames: '',
        // 候选人
        userIds: undefined,
        userNames: ''
      }
    },
    // 处理用户选择模板搜索
    handleUserSelectSearch () {
      this.userSelectList = lodash.cloneDeep(this.userTemplateStore)
      this.userSelectTemplateVisible = true
    },
    // 处理角色选择模板搜索
    handleRoleSelectSearch () {
      this.roleSelectList = lodash.cloneDeep(this.roleTemplateStore)
      this.roleSelectTemplateVisible = true
    },
    // 根据ID查询集合数据
    getList () {
      const axiosList = []
      this.form.userIds && axiosList.push(getUserByIds(this.form.userIds.split(','))
        .then(response => { this.userTemplateStore = lodash.get(response, 'data', []) }))
      this.form.roleIds && axiosList.push(getRoleByIds(this.form.roleIds.split(','))
        .then(response => { this.roleTemplateStore = lodash.get(response, 'data', []) }))
      return Promise.all(axiosList)
    }
  }
}
</script>

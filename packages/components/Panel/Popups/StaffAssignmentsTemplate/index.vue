<template>
  <div>
    <el-dialog ref="staffAssignmentsTemplateDialog"
               v-bind="$attrs"
               :close-on-click-modal="false"
               width="950px"
               top="3vh"
               v-on="$listeners"
    >
      <el-row style="margin: 5px;">
        <el-button type="primary" size="mini" @click="handleStaffAssignmentAdd()">添加</el-button>
      </el-row>
      <el-table size="mini" :data="assignList" height="400px" border>
        <el-table-column prop="typeName" label="用户类型">
          <template slot-scope="scope">
            <el-select :value="scope.row.typeId"
                       size="small"
                       placeholder="请选择"
                       @change="handleTypeCascade($event, scope.row)"
            >
              <el-option v-for="item in options"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="assignNames" label="用户来自">
          <template slot-scope="scope">
            <el-input v-if="['user', 'role'].includes(scope.row.typeId)"
                      :readonly="true"
                      size="small"
                      placeholder="请选择"
                      :value="scope.row.assignNames"
                      class="input-with-select"
            >
              <el-button slot="append" icon="el-icon-search" @click="handleOpenSelectTemplate(scope.row)"/>
            </el-input>
            <tree-select v-if="['company'].includes(scope.row.typeId)"
                         :props="{
                           value: 'deptId',
                           label: 'name',
                           children: 'children'
                         }"
                         url="/system/dept/deptTree"
                         :value="scope.row.assignIds"
                         :clearable="true"
                         :accordion="true"
                         @getValue="(valueId, valueTitle) => {
                           scope.row.assignIds = valueId
                           scope.row.assignNames = valueTitle
                         }"
            />
            <div v-if="['applyUserId', 'previousExecutor', 'currentUserId'].includes(scope.row.typeId)">
              {{ handleTypeDefinitionAssign(scope.row) }}
            </div>
            <el-input v-if="['sql', 'custom'].includes(scope.row.typeId)"
                      v-model="scope.row.assignIds"
                      type="textarea"
                      size="small"
                      :placeholder="getMultiLineTextPlaceholder(scope.row.typeId)"
                      @change="(text) => { scope.row.assignNames = text }"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序">
          <template slot-scope="scope">
            <el-input v-model="scope.row.sort"
                      size="small"
                      :min="0"
                      type="number"
                      @change="handleAgainSort(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       size="small"
                       @click="assignList.splice(scope.$index,1)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeWindow()">取消</el-button>
        <el-button size="small" type="primary" @click="save()">确认</el-button>
      </div>
    </el-dialog>
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
import RoleSelectTemplate from '@components/Panel/Popups/RoleSelectTemplate'
import UserSelectTemplate from '@components/Panel/Popups/UserSelectTemplate'
import TreeSelect from '@components/TreeSelect'
import lodash from 'lodash'
export default {
  name: 'StaffAssignmentsTemplate',
  components: {
    RoleSelectTemplate,
    UserSelectTemplate,
    TreeSelect
  },
  props: {
    staffList: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      assignList: [],
      userSelectList: [],
      roleSelectList: [],
      roleSelectTemplateVisible: false,
      userSelectTemplateVisible: false,
      currentRow: {},
      options: [
        {
          label: '用户',
          value: 'user'
        },
        {
          label: '机构',
          value: 'company'
        },
        {
          label: '角色',
          value: 'role'
        },
        {
          label: '发起人',
          value: 'applyUserId'
        },
        {
          label: '上一步执行人',
          value: 'previousExecutor'
        },
        {
          label: '当前登录用户',
          value: 'currentUserId'
        },
        {
          label: 'sql脚本',
          value: 'sql'
        },
        {
          label: '自定义条件',
          value: 'custom'
        }
      ]
    }
  },
  watch: {
    staffList: {
      deep: true,
      immediate: true,
      handler (val) {
        this.assignList = lodash.cloneDeep(val)
      }
    }
  },
  methods: {
    // 处理人员分配添加
    handleStaffAssignmentAdd () {
      const staffAssignment = lodash.create({}, {
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
      // 递增排序
      const assignListMaxSort = lodash.maxBy(this.assignList, 'sort')
      const increase = lodash.get(assignListMaxSort, 'sort', -10)
      lodash.set(staffAssignment, 'sort', lodash.add(increase, 10))
      this.assignList.push(staffAssignment)
    },
    // 处理排序调整时重新排序
    handleAgainSort (row) {
      this.$set(row, 'sort', Number(row.sort))
      this.assignList = lodash.sortBy(this.assignList, 'sort')
    },
    // 获取多行文本的提示
    getMultiLineTextPlaceholder (type) {
      switch (type) {
        case 'sql':
          return '请输入自定义sq获取审核人员信息'
        case 'custom':
          return '请输入自定义扩展标记值,你可以根据该标记,在Java中解析你需要的审核人员信息'
      }
    },
    // 处理打开选择模板
    handleOpenSelectTemplate (row) {
      this.currentRow = row
      switch (row.typeId) {
        case 'role':
          this.roleSelectList = row.assign
          this.roleSelectTemplateVisible = true
          break
        case 'user':
          this.userSelectList = row.assign
          this.userSelectTemplateVisible = true
          break
      }
    },
    // 处理用户选择模板保存
    handleUserSelectTemplateSave (uniqueTags) {
      const assign = lodash.cloneDeep(uniqueTags)
      this.$set(this.currentRow, 'assignIds', assign.map(item => item.id).join(','))
      this.$set(this.currentRow, 'assignNames', assign.map(item => item.userName).join(','))
      this.$set(this.currentRow, 'assign', assign)
    },
    // 处理角色选择模板保存
    handleRoleSelectTemplateSave (uniqueTags) {
      const assign = lodash.cloneDeep(uniqueTags)
      this.$set(this.currentRow, 'assignIds', assign.map(item => item.id).join(','))
      this.$set(this.currentRow, 'assignNames', assign.map(item => item.name).join(','))
      this.$set(this.currentRow, 'assign', assign)
    },
    // 处理用户类型级联
    handleTypeCascade (value, row) {
      // 清除人员分配
      this.$set(row, 'assignIds', '')
      this.$set(row, 'assignNames', '')
      this.$set(row, 'assign', [])
      // 设置分配类型
      this.$set(row, 'typeId', value)
      this.$set(row, 'typeName', lodash.get(lodash.find(this.options, { 'value': value }), 'label', ''))
    },
    // 处理保存动作
    save () {
      // 去除没有没有分配人员的数据
      const staffList = lodash.filter(this.assignList, item => item.assignIds)
      this.$emit('save', staffList)
      this.closeWindow()
    },
    // 关闭窗口动作
    closeWindow () {
      this.$refs.staffAssignmentsTemplateDialog.hide()
    },
    // 处理手动用户类型定义分配数据
    handleTypeDefinitionAssign (row) {
      // 清除分配勾选数据
      this.$set(row, 'assign', [])
      this.$set(row, 'assignIds', row.typeId)
      this.$set(row, 'assignNames', row.typeName)
      return row.typeName
    }
  }
}

</script>

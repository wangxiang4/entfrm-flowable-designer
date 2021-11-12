<template>
  <div>
    <el-dialog ref="userSelectTemplateDialog"
               v-bind="$attrs"
               width="900px"
               top="3vh"
               :close-on-click-modal="false"
               v-on="$listeners"
               @open="init"
    >
      <el-row :gutter="20">
        <el-col :span="4" :xs="24">
          <div class="head-container">
            <el-input v-model="name"
                      placeholder="请输入机构名称"
                      clearable
                      size="small"
                      prefix-icon="el-icon-search"
                      style="margin-bottom: 20px"
            />
          </div>
          <div class="head-container">
            <el-tree ref="tree"
                     :data="deptOptions"
                     :props="defaultProps"
                     :expand-on-click-node="false"
                     :filter-node-method="filterNode"
                     default-expand-all
                     @node-click="handleNodeClick"
            />
          </div>
        </el-col>
        <el-col :span="16" :xs="24">
          <el-form ref="queryForm" :model="queryParams" :inline="true">
            <el-form-item label="用户名称" prop="userName">
              <el-input v-model="queryParams.userName"
                        placeholder="请输入用户名称"
                        clearable
                        size="small"
                        style="width: 240px"
                        @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary"
                         icon="el-icon-search"
                         size="mini"
                         @click="handleQuery"
              >搜索</el-button>
              <el-button icon="el-icon-refresh-right"
                         size="mini"
                         @click="resetQuery"
              >重置</el-button>
            </el-form-item>
          </el-form>
          <el-table ref="userTable"
                    v-loading="loading"
                    size="small"
                    :data="userList"
                    height="330px"
                    @select="handleTags"
                    @select-all="handleTags"
          >
            <el-table-column type="selection" width="45" align="center"/>
            <el-table-column label="用户编号" align="center" prop="id"/>
            <el-table-column label="用户名称" align="center" prop="userName" :show-overflow-tooltip="true"/>
            <el-table-column label="用户昵称" align="center" prop="nickName" :show-overflow-tooltip="true"/>
            <el-table-column label="机构名称" align="center" prop="deptName" :show-overflow-tooltip="true"/>
          </el-table>
          <pagination v-show="total>0"
                      :total="total"
                      :page.sync="queryParams.current"
                      :limit.sync="queryParams.size"
                      @pagination="getList"
          />
        </el-col>
        <el-col :span="4" :xs="24">
          <div>
            <el-tag v-for="tag in tags" :key="tag.userName" closable>{{ tag.userName }}</el-tag>
          </div>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeWindow()">关闭</el-button>
        <el-button size="small" type="primary" @click="save()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser, deptTree } from '@/api/panel'
import lodash from 'lodash'
import pagination from '@components/Pagination'
export default {
  name: 'UserSelectTemplate',
  inheritAttrs: false,
  components: {
    pagination
  },
  props: {
    selectList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      loading: false,
      name: undefined,
      deptOptions: undefined,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      userList: [],
      queryParams: {},
      total: 0,
      tags: []
    }
  },
  watch: {
    name (val) {
      this.$refs.tree.filter(val)
    },
    selectList: {
      deep: true,
      immediate: true,
      handler (val) {
        // 如果外部重新设置勾选Id,则清空内部所有勾选操作,设置外部勾选
        this.tags = lodash.cloneDeep(val)
      }
    }
  },
  methods: {
    init () {
      this.name = undefined
      this.queryParams = {
        current: 1,
        size: 10,
        userName: undefined,
        deptId: undefined,
        status: 0
      }
      this.getList()
      this.getDeptTree()
    },
    // 查询机构名称下拉树结构
    getDeptTree () {
      deptTree().then(response => {
        this.deptOptions = response.data
      })
    },
    // 筛选节点
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick (data) {
      this.queryParams.deptId = data.id
      this.getList()
    },
    // 查询用户集合
    getList () {
      this.loading = true
      listUser(this.queryParams).then(response => {
        this.userList = response.data
        this.total = response.total
        this.loading = false
      }).then(() => {
        // 自动勾选标签中已经存在的数据
        const rows = lodash.intersectionBy(this.userList, this.tags, 'id')
        rows && rows.forEach(row => {
          this.$refs.userTable.toggleRowSelection(row, true)
        })
      })
    },
    // 处理搜索动作
    handleQuery () {
      this.queryParams.current = 1
      this.getList()
    },
    // 处理重置动作
    resetQuery () {
      this.$refs['queryForm'].resetFields()
    },
    // 处理保存动作
    save () {
      if (lodash.isEmpty(this.tags)) this.$message.error('检查当前未勾选数据,请勾选一行')
      else {
        // 以防恶意重复勾选,过滤重复的标签勾选数据
        const uniqueTags = lodash.uniqBy(this.tags, 'id')
        this.$emit('save', uniqueTags)
        this.closeWindow()
      }
    },
    // 关闭窗口动作
    closeWindow () {
      this.$refs.userSelectTemplateDialog.hide()
    },
    // 处理标签数据
    handleTags (data) {
      if (data.length === 0) {
        // 如果当前选择为空则匹配删除当前页所有数据,不影响其他页
        const tagsModel = lodash.cloneDeep(this.tags)
        lodash.pullAllWith(tagsModel, this.userList, (arrVal, othVal) => {
          if (arrVal.id === othVal.id) {
            const index = lodash.findIndex(this.tags, arrVal)
            this.tags.splice(index, 1)
          }
        })
      } else {
        // 匹配删除当前页不是被勾选的数据
        const delTags = lodash.differenceBy(this.userList, data, 'id')
        const tagsModel = lodash.cloneDeep(this.tags)
        lodash.pullAllWith(tagsModel, delTags, (arrVal, othVal) => {
          if (arrVal.id === othVal.id) {
            const index = lodash.findIndex(this.tags, arrVal)
            this.tags.splice(index, 1)
          }
        })
        // 添加当前页选中的数据,如果能找到则替换
        lodash.forEach(data, (value) => {
          const index = lodash.findIndex(this.tags, value)
          if (index === -1) {
            this.tags.push(value)
          } else {
            this.tags.splice(index, 1, value)
          }
        })
      }
    }
  }
}
</script>

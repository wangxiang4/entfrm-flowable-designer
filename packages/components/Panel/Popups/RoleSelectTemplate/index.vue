<template>
  <div>
    <el-dialog ref="roleSelectTemplateDialog"
               v-bind="$attrs"
               width="800px"
               top="3vh"
               :close-on-click-modal="false"
               v-on="$listeners"
               @open="init"
    >
      <el-row :gutter="20">
        <el-col :span="18" :xs="24">
          <el-form ref="queryForm" :model="queryParams" :inline="true">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="queryParams.name"
                        placeholder="请输入角色名称"
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
          <el-table ref="roleTable"
                    v-loading="loading"
                    size="small"
                    :data="roleList"
                    height="330px"
                    @select="handleTags"
                    @select-all="handleTags"
          >
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="角色编号" prop="id" align="center"/>
            <el-table-column label="角色名称" prop="name" align="center"/>
          </el-table>
          <pagination v-show="total>0"
                      :total="total"
                      :page.sync="queryParams.current"
                      :limit.sync="queryParams.size"
                      @pagination="getList"
          />
        </el-col>
        <el-col :span="6" :xs="24">
          <div>
            <el-tag v-for="tag in tags" :key="tag.name" closable>{{ tag.name }}</el-tag>
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
import { listRole } from '@/api/panel'
import lodash from 'lodash'
import pagination from '@components/Pagination'
export default {
  name: 'RoleSelectTemplate',
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
      roleList: [],
      queryParams: {},
      total: 0,
      tags: []
    }
  },
  watch: {
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
      this.queryParams = {
        current: 1,
        size: 10,
        name: undefined,
        status: 0
      }
      this.getList()
    },
    // 查询角色集合
    getList () {
      this.loading = true
      listRole(this.queryParams).then(response => {
        this.roleList = response.data
        this.total = response.total
        this.loading = false
      }).then(() => {
        // 自动勾选标签中已经存在的数据
        const rows = lodash.intersectionBy(this.roleList, this.tags, 'id')
        rows && rows.forEach(row => {
          this.$refs.roleTable.toggleRowSelection(row, true)
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
      this.$refs.roleTemplateDialog.hide()
    },
    // 处理标签勾选数据
    handleTags (data) {
      if (data.length === 0) {
        // 如果当前选择为空则匹配删除当前页所有数据,不影响其他页
        const tagsModel = lodash.cloneDeep(this.tags)
        lodash.pullAllWith(tagsModel, this.roleList, (arrVal, othVal) => {
          if (arrVal.id === othVal.id) {
            const index = lodash.findIndex(this.tags, arrVal)
            this.tags.splice(index, 1)
          }
        })
      } else {
        // 匹配删除当前页不是被勾选的数据
        const delTags = lodash.differenceBy(this.roleList, data, 'id')
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

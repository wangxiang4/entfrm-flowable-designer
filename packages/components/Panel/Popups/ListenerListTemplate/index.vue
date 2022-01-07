<template>
  <div>
    <el-dialog ref="listenerListDialog"
               v-bind="$attrs"
               top="3vh"
               width="calc(100vh + 200px)"
               :append-to-body="true"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               v-on="$listeners"
               @open="getList"
    >
      <el-table ref="listenerTable"
                v-loading="loading"
                height="calc(100vh - 350px)"
                size="small"
                border
                :data="listenerList"
                @select="handleTags"
                @select-all="handleTags"
      >
        <el-table-column type="selection" width="45" align="center"/>
        <el-table-column label="名称" align="center" prop="name"/>
        <el-table-column label="监听器类型" align="center" prop="listenerType">
          <template slot-scope="scope">{{ scope.row.listenerType === 1 ?'执行监听器':'任务监听器' }}</template>
        </el-table-column>
        <el-table-column label="事件" align="center" prop="event"/>
        <el-table-column label="值类型" align="center" prop="valueType">
          <template slot-scope="scope">{{ {'1':'类', '2':'表达式', '3':'委托表达式'}[scope.row.valueType] }}</template>
        </el-table-column>
        <el-table-column label="值" align="center" prop="value"/>
      </el-table>
      <pagination v-show="total>0"
                  :total="total"
                  :page.sync="params.current"
                  :limit.sync="params.size"
                  @pagination="getList"
      />
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeWindow()">关闭</el-button>
        <el-button size="small" type="primary" @click="save()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listListener } from '@/api/panel'
import lodash from 'lodash'
import pagination from '@components/Pagination'
export default {
  name: 'ListenerListTemplate',
  components: {
    pagination
  },
  inheritAttrs: false,
  props: {
    queryParams: {
      type: Object,
      default: () => {
        return {}
      }
    },
    selectList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      loading: false,
      listenerList: [],
      total: 0,
      tags: [],
      params: {}
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
    },
    queryParams: {
      deep: true,
      immediate: true,
      handler (val) {
        this.params = val
      }
    }
  },
  methods: {
    /** 查询常用监听器集合 */
    getList () {
      this.loading = true
      listListener(this.params).then(response => {
        this.listenerList = response.data
        this.total = response.total
        this.loading = false
      }).then(() => {
        // 自动勾选标签中已经存在的数据
        const rows = lodash.intersectionBy(this.listenerList, this.tags, 'id')
        rows && rows.forEach(row => {
          this.$refs.listenerTable.toggleRowSelection(row, true)
        })
      })
    },
    /** 处理保存动作 */
    save () {
      // 以防恶意重复勾选,过滤重复的标签勾选数据
      const uniqueTags = lodash.uniqBy(this.tags, 'id')
      this.$emit('save', uniqueTags)
      this.closeWindow()
    },
    /** 关闭窗口动作 */
    closeWindow () {
      this.$refs.listenerListDialog.hide()
    },
    /** 处理标签勾选数据 */
    handleTags (data) {
      if (data.length === 0) {
        // 如果当前选择为空则匹配删除当前页所有数据,不影响其他页
        const tagsModel = lodash.cloneDeep(this.tags)
        lodash.pullAllWith(tagsModel, this.listenerList, (arrVal, othVal) => {
          if (arrVal.id === othVal.id) {
            const index = lodash.findIndex(this.tags, arrVal)
            this.tags.splice(index, 1)
          }
        })
      } else {
        // 匹配删除当前页不是被勾选的数据
        const delTags = lodash.differenceBy(this.listenerList, data, 'id')
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

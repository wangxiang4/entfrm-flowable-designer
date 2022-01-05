<template>
  <div>
    <el-dialog ref="buttonListTemplateDialog"
               v-bind="$attrs"
               top="3vh"
               :append-to-body="true"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               v-on="$listeners"
               @open="init"
    >
      <el-table ref="buttonTable"
                v-loading="loading"
                size="small"
                height="calc(100vh - 363px)"
                :data="buttonList"
                @select="handleTags"
                @select-all="handleTags"
      >
        <el-table-column type="selection" width="45" align="center"/>
        <el-table-column label="名称" align="center" prop="name"/>
        <el-table-column label="编码" align="center" prop="code"/>
        <el-table-column label="排序" align="center" prop="sort"/>
      </el-table>
      <pagination v-show="total>0"
                  :total="total"
                  :page.sync="queryParams.current"
                  :limit.sync="queryParams.size"
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
import { listButton } from '@/api/panel'
import lodash from 'lodash'
import pagination from '@components/Pagination'
export default {
  name: 'ButtonListTemplate',
  components: {
    pagination
  },
  inheritAttrs: false,
  props: {
    selectList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      loading: false,
      buttonList: [],
      queryParams: {},
      total: 0,
      tags: {}
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
        size: 10
      }
      this.getList()
    },
    /** 查询常用按钮集合 */
    getList () {
      this.loading = true
      listButton(this.queryParams).then(response => {
        this.buttonList = response.data
        this.total = response.total
        this.loading = false
      }).then(() => {
        // 自动勾选标签中已经存在的数据
        const rows = lodash.intersectionBy(this.buttonList, this.tags, 'code')
        rows && rows.forEach(row => {
          this.$refs.buttonTable.toggleRowSelection(row, true)
        })
      })
    },
    /** 处理保存动作 */
    save () {
      // 以防恶意重复勾选,过滤重复的标签勾选数据
      const uniqueTags = lodash.uniqBy(this.tags, 'code')
      this.$emit('save', uniqueTags)
      this.closeWindow()
    },
    /** 关闭窗口动作 */
    closeWindow () {
      this.$refs.buttonListTemplateDialog.hide()
    },
    /** 处理标签勾选数据 */
    handleTags (data) {
      if (data.length === 0) {
        // 如果当前选择为空则匹配删除当前页所有数据,不影响其他页
        const tagsModel = lodash.cloneDeep(this.tags)
        lodash.pullAllWith(tagsModel, this.buttonList, (arrVal, othVal) => {
          if (arrVal.code === othVal.code) {
            const index = lodash.findIndex(this.tags, arrVal)
            this.tags.splice(index, 1)
          }
        })
      } else {
        // 匹配删除当前页不是被勾选的数据
        const delTags = lodash.differenceBy(this.buttonList, data, 'code')
        const tagsModel = lodash.cloneDeep(this.tags)
        lodash.pullAllWith(tagsModel, delTags, (arrVal, othVal) => {
          if (arrVal.code === othVal.code) {
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

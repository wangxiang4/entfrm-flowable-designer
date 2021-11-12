<template>
  <div>
    <el-dialog ref="processExpressionSelectDialog"
               v-bind="$attrs"
               width="650px"
               top="3vh"
               :close-on-click-modal="false"
               v-on="$listeners"
               @open="init"
    >
      <el-form ref="queryForm" :model="queryParams" :inline="true" size="small">
        <el-form-item label="名称" prop="name">
          <el-input v-model="queryParams.name"
                    placeholder="请输入名称"
                    clearable
                    style="width: 180px"
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
      <el-table v-loading="loading"
                size="small"
                :data="expressionList"
                highlight-current-row
                @current-change="handleCurrentChange"
      >
        <el-table-column label="名称" align="center" prop="name"/>
        <el-table-column label="表达式" align="center" prop="expression"/>
        <el-table-column label="备注" align="center" prop="remarks"/>
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
import { listCondition } from '@/api/panel'
import lodash from 'lodash'
import pagination from '@components/Pagination'
export default {
  name: 'ProcessExpressionSelectTemplate',
  inheritAttrs: false,
  components: {
    pagination
  },
  data () {
    return {
      loading: false,
      expressionList: [],
      queryParams: {},
      total: 0,
      currentRow: {}
    }
  },
  methods: {
    init () {
      this.queryParams = {
        current: 1,
        size: 10,
        name: undefined
      }
      this.getList()
    },
    // 处理当前选择行
    handleCurrentChange (val) {
      this.currentRow = val
    },
    // 查询流程表达式
    getList () {
      this.loading = true
      listCondition(this.queryParams).then(response => {
        this.expressionList = response.data
        this.total = response.total
        this.loading = false
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
      if (lodash.isEmpty(this.currentRow)) this.$message.error('检查当前未选择数据,请选择一行')
      else {
        this.$emit('save', lodash.get(this.currentRow, 'expression', ''))
        this.closeWindow()
      }
    },
    // 关闭窗口动作
    closeWindow () {
      this.$refs.processExpressionSelectDialog.hide()
    }
  }
}
</script>

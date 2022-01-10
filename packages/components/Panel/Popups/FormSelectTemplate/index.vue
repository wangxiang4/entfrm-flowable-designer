<template>
  <div>
    <el-dialog ref="FormSelectDialog"
               v-bind="$attrs"
               top="15vh"
               width="calc(100vh - 150px)"
               :append-to-body="true"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               v-on="$listeners"
    >
      <el-form label-width="90px" size="small">
        <el-form-item label="表单选择">
          <el-select v-model="formKey"
                     clearable
                     placeholder="请选择"
                     style="width: 100%;"
          >
            <el-option v-for="item in options"
                       :key="getFormDefinitionJson(item).id"
                       :label="`${item.name} V:${getFormDefinitionJson(item).version}`"
                       :value="getFormDefinitionJson(item).id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeWindow()">关闭</el-button>
        <el-button size="small" type="primary" @click="save()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import lodash from 'lodash'
export default {
  name: 'FormSelectTemplate',
  props: {
    value: {},
    options: {
      type: Array
    }
  },
  data () {
    return {
      formKey: undefined
    }
  },
  watch: {
    formKey: {
      handler (n) {
        this.$emit('input', n)
        this.$emit('change', n)
      }
    },
    value: {
      immediate: true,
      handler () {
        this.formKey = this.value
      }
    }
  },
  methods: {
    getFormDefinitionJson (item = {}) {
      return item.formDefinitionJson || {}
    },
    closeWindow () {
      this.formKey = undefined
      this.$refs.FormSelectDialog.hide()
    },
    save () {
      const form = lodash.find(this.options, item => this.getFormDefinitionJson(item).id === this.formKey)
      if (lodash.isEmpty(form)) this.$message.error('检查当前未选择数据,请选择')
      else {
        this.$emit('save', form)
        this.closeWindow()
      }
    }
  }
}
</script>

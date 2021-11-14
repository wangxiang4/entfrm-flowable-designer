<template>
  <div>
    <el-dialog ref="listenerAddDialog"
               v-bind="$attrs"
               width="650px"
               top="16vh"
               :close-on-click-modal="false"
               v-on="$listeners"
    >
      <el-form ref="form"
               :model="form"
               :rules="rules"
               label-width="120px"
               size="small"
      >
        <el-form-item label="事件类型" prop="event">
          <el-select v-model="form.event">
            <el-option v-for="item in events"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="监听类型" prop="valueType">
          <el-radio-group v-model="form.valueType">
            <el-radio :label="1">{{ translationListenerType(1) }}</el-radio>
            <el-radio :label="2">{{ translationListenerType(2) }}</el-radio>
            <el-radio :label="3">{{ translationListenerType(3) }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="translationListenerType(form.valueType)" prop="value" :rules="validateValue">
          <el-input v-model="form.value"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="closeWindow()">关闭</el-button>
        <el-button size="small" type="primary" @click="$emit('save')">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'ListenerAddTemplate',
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      required: true
    },
    events: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      form: {},
      rules: {
        event: [
          { required: true, message: '事件类型不能为空', trigger: 'blur' }
        ],
        valueType: [
          { required: true, message: '监听类型不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 动态校验值不能为空
    validateValue () {
      const message = `${this.translationListenerType(this.form.valueType)}不能为空`
      return [{ required: true, message: message, trigger: 'blur' }]
    }
  },
  watch: {
    form: {
      deep: true,
      handler (n) {
        this.$emit('input', n)
        this.$emit('change', n)
      }
    },
    value: {
      deep: true,
      immediate: true,
      handler () {
        this.form = this.value
      }
    }
  },
  methods: {
    // 翻译监听类型
    translationListenerType (type) {
      switch (type) {
        case 1:
          return '类'
        case 2:
          return '表达式'
        case 3:
          return '委托表达式'
      }
    },
    // 外部调用保存验证方法
    validate (callback) {
      this.$refs.form.validate((valid, msg) => {
        if (valid) {
          callback(true)
        } else {
          callback(false, msg)
        }
      })
    },
    // 关闭窗口动作
    closeWindow () {
      this.$refs.listenerAddDialog.hide()
    }
  }
}
</script>

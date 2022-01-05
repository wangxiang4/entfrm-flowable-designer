<template>
  <div>
    <el-dialog ref="buttonAddTemplateDialog"
               v-bind="$attrs"
               width="700px"
               top="3vh"
               :append-to-body="true"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               v-on="$listeners"
    >
      <el-form ref="form"
               :model="form"
               :rules="rules"
               label-width="90px"
               size="small"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" :disabled="form.id"/>
        </el-form-item>
        <el-form-item>
          <div class="tip">
            <p>
              注意：按钮编码不能重复，系统按钮以_flow_开头，自定义按钮不能以_flow_开头。
              系统按钮和自定义按钮的区别是，系统按钮是绑定具体的action进行提交，如果你定义了系统按钮，必须在代码中实现对应的action方法。
              自定义按钮无需在代码中添加action方法，触发自定义按钮时调用的是【同意】按钮对应的action，并把该按钮对应的code设置为true、其他自定义按钮对应的code设置为false作为流程变量进行提交。
            </p>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="是否隐藏" prop="isHide">
          <el-select v-model="form.isHide" style="width: 100%">
            <el-option v-for="item in options"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value"
            />
          </el-select>
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
  name: 'ButtonAddTemplate',
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      options: [
        { label: '否', value: '0' },
        { label: '是', value: '1' }
      ],
      form: {},
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '编码不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ],
        isHide: [
          { required: true, message: '是否隐藏不能为空', trigger: 'blur' }
        ]
      }
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
    /** 外部调用保存验证方法 */
    validate (callback) {
      this.$refs.form.validate((valid, msg) => {
        if (valid) {
          callback(true)
        } else {
          callback(false, msg)
        }
      })
    },
    /** 关闭窗口动作 */
    closeWindow () {
      this.$refs.buttonAddTemplateDialog.hide()
    }
  }
}
</script>

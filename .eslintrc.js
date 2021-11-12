/**
 * @program: entfrm-flowable-designer
 *
 * @description: 制定统一代码规范检查配置
 *
 * 推荐使用eslint进行团队代码规范管理,方便统一代码规范
 * 具体配置可参考官方文档
 * todo:https://cn.eslint.org/docs/user-guide/configuring
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-26
 **/
module.exports = {
  //查找自身层叠配置
  root: true,
  //在一些特定的环境中运行检查js代码规范
  env: {
    browser: true,
    node: true,
    es6: true
  },
  //解析器配置
  parserOptions:{
    //使用Babel解析器(内置es语法)
    parser: 'babel-eslint',
    //使用es模块化解析
    sourceType:"module"
  },
  //继承共享配置:注意规范[plugin:代表引入eslint插件中的配置,eslint:表示引入eslint的核心中的配置]
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended'
  ],
  //定制化团队代码规范,具体配置可参考:http://eslint.cn/docs/rules/
  //可视化配置生成规则地址:https://cn.eslint.org/demo/
  //vue-eslint扩展配置具体参考:https://eslint.vuejs.org/rules/no-parsing-error.html
  "rules": {
    /** -----------------------vue-eslint配置-------------------------**/
    //强制每行的最大属性数
    "vue/max-attributes-per-line": ["error", {
      "singleline": 10,
      "multiline": {
        "max": 1,
        "allowFirstLine": true
      }
    }],
    //需要在单行元素的内容前后换行
    "vue/singleline-html-element-content-newline": "off",
    //需要在多行元素的内容前后换行
    "vue/multiline-html-element-content-newline": "off",
    //需要在没有内容的元素上自动关闭
    "vue/html-self-closing": ["error", {
      "html": {
        "void": "never",
        "normal": "always",
        "component": "always"
      },
      "svg": "always",
      "math": "always"
    }],
    //在模板中的自定义组件上使用带连字符的名称
    "vue/attribute-hyphenation": "error",
    //标签中不用于缩进的多个空格
    "vue/no-multi-spaces": ["error", {
      "ignoreProperties": false
    }],
    //关闭禁止使用 v-html 来防止 XSS 攻击
    "vue/no-v-html": "off",
    //强制使用一致的缩进 <template>
    "vue/html-indent": ["error", 2, {
      "attribute": 1,
      "baseIndent": 1,
      "closeBracket": 0,
      "alignAttributesVertically": true,
      "ignores": []
    }],
    //禁止在计算属性中执行异步操作
    "vue/no-async-in-computed-properties":"error",
    //禁止重复字段名称
    "vue/no-dupe-keys": "error",
    //要求或禁止在标签的右括号前换行
    "vue/html-closing-bracket-newline": ["error", {
      "singleline": "never",
      "multiline": "always"
    }],
    //禁止缺少结束标记
    "vue/html-end-tags": "error",
    //强制HTML属性的引号样式
    "vue/html-quotes": [ "error", "double", {
      "avoidEscape": false
    }],
    //禁止在外部作用域中声明的影子变量声明变量
    "vue/no-template-shadow": "off",
    //为 Vue 组件中的 name 属性强制执行特定大小写
    "vue/name-property-casing": ["error", "PascalCase"],
    //在标签的右括号前要求或不允许有空格
    "vue/html-closing-bracket-spacing": "off",
    //需要v-bind:key用v-for指令
    'vue/require-v-for-key': 'off',
    //需要道具的默认值
    'vue/require-default-prop': 'off',
    //在 props 中需要类型定义
    'vue/require-prop-types': 'off',

    /** -----------------------eslint配置-----------------------------**/
    //具体参考eslint-plugin-vue-libs地址:https://github.com/vuejs/eslint-plugin-vue-libs/blob/master/config.js
    'accessor-pairs': 2,
    'arrow-spacing': [2, { 'before': true, 'after': true }],
    'block-spacing': [2, 'always'],
    'brace-style': [2, '1tbs', { 'allowSingleLine': true }],
    'camelcase': [2, { 'properties': 'never' }],
    'comma-dangle': [2, 'never'],
    'comma-spacing': [2, { 'before': false, 'after': true }],
    'comma-style': [2, 'last'],
    'constructor-super': 2,
    'curly': [2, 'multi-line'],
    'dot-location': [2, 'property'],
    'eol-last': 2,
    'eqeqeq': 0,
    'generator-star-spacing': [2, { 'before': true, 'after': true }],
    'handle-callback-err': [2, '^(err|error)$' ],
    'indent': [2, 2, { 'SwitchCase': 1 }],
    'jsx-quotes': [2, 'prefer-single'],
    'key-spacing': [2, { 'beforeColon': false, 'afterColon': true }],
    'keyword-spacing': [2, { 'before': true, 'after': true }],
    'new-cap': [2, { 'newIsCap': true, 'capIsNew': false }],
    'new-parens': 2,
    'no-array-constructor': 2,
    'no-caller': 2,
    'no-class-assign': 2,
    'no-cond-assign': 2,
    'no-const-assign': 2,
    'no-delete-var': 2,
    'no-dupe-args': 2,
    'no-dupe-class-members': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-empty-character-class': 2,
    'no-empty-pattern': 2,
    'no-ex-assign': 2,
    'no-extend-native': 2,
    'no-extra-bind': 2,
    'no-extra-boolean-cast': 2,
    'no-extra-parens': [2, 'functions'],
    'no-fallthrough': 2,
    'no-floating-decimal': 2,
    'no-func-assign': 2,
    'no-implied-eval': 2,
    'no-inner-declarations': [2, 'functions'],
    'no-invalid-regexp': 2,
    'no-irregular-whitespace': 2,
    'no-iterator': 2,
    'no-label-var': 2,
    'no-labels': [2, { 'allowLoop': false, 'allowSwitch': false }],
    'no-lone-blocks': 2,
    'no-mixed-spaces-and-tabs': 2,
    'no-multi-spaces': [2, { "ignoreEOLComments": true }],
    'no-multi-str': 2,
    'no-multiple-empty-lines': [2, { 'max': 1 }],
    'no-native-reassign': 2,
    'no-negated-in-lhs': 2,
    'no-new-object': 2,
    'no-new-require': 2,
    'no-new-symbol': 2,
    'no-new-wrappers': 2,
    'no-obj-calls': 2,
    'no-octal': 2,
    'no-octal-escape': 2,
    'no-path-concat': 2,
    'no-proto': 2,
    'no-redeclare': 2,
    'no-regex-spaces': 2,
    'no-return-assign': [2, 'except-parens'],
    'no-self-assign': 2,
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-shadow-restricted-names': 2,
    'no-spaced-func': 2,
    'no-sparse-arrays': 2,
    'no-this-before-super': 2,
    'no-trailing-spaces': 2,
    'no-undef': 2,
    'no-undef-init': 2,
    'no-unexpected-multiline': 2,
    'no-unmodified-loop-condition': 2,
    'no-unneeded-ternary': [2, { 'defaultAssignment': false }],
    'no-unreachable': 2,
    'no-unsafe-finally': 2,
    'no-unused-vars': [2, { 'vars': 'all', 'args': 'none' }],
    'no-useless-call': 2,
    'no-useless-computed-key': 2,
    'no-useless-constructor': 2,
    'no-useless-escape': 0,
    'no-whitespace-before-property': 2,
    'no-with': 2,
    'one-var': [2, { 'initialized': 'never' }],
    'operator-linebreak': [2, 'after', { 'overrides': { '?': 'before', ':': 'before' } }],
    'padded-blocks': [2, 'never'],
    'quotes': [2, 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'semi': [2, 'never'],
    'semi-spacing': [2, { 'before': false, 'after': true }],
    'space-before-blocks': [2, 'always'],
    'space-before-function-paren': [2, 'always'],
    'space-in-parens': [2, 'never'],
    'space-infix-ops': 2,
    'space-unary-ops': [2, { 'words': true, 'nonwords': false }],
    'spaced-comment': [2, 'always', { 'markers': ['global', 'globals', 'eslint', 'eslint-disable', '*package', '!', ','] }],
    'template-curly-spacing': [2, 'never'],
    'use-isnan': 2,
    'valid-typeof': 2,
    'wrap-iife': [2, 'any'],
    'yield-star-spacing': [2, 'both'],
    'yoda': [2, 'never'],
    'prefer-const': 2,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'object-curly-spacing': [2, 'always', { objectsInObjects: false }],
    'array-bracket-spacing': [2, 'never'],
    'no-control-regex': 0
  }
}

<template>
  <el-select ref="elSelect"
             :value="valueTitle"
             :size="size"
             :disabled="disabled"
             :clearable="clearable"
             :placeholder="placeholderText"
             @clear="clearHandle"
  >
    <el-option :value="valueTitle" :label="valueTitle">
      <el-tree id="tree-option"
               ref="selectTree"
               :accordion="accordion"
               :data="optionData"
               :show-checkbox="showCheckbox"
               :props="props"
               highlight-current
               :node-key="props.value"
               :default-expanded-keys="defaultExpandedKey"
               @check-change="handleCheckChange"
               @node-click="handleNodeClick"
      />
    </el-option>
  </el-select>
</template>

<script>
/**
 * @program: entfrm-flowable-designer
 *
 * @description: 树形下拉框
 *
 * 造轮子,借助element-ui下拉组件与树形组件封装
 * 组件说明:
 * 提供适用与绝大多数场景的三种模式(可供选择)
 *
 * 1.支持uri地址请求:需传参url
 *
 * 2.支持list集合数据:需传参list
 *
 * 3.支持tree树形结构数据:需传参data
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-22
 **/
import globalConfig from '@/common/config/global'
import { requestDecorator } from '@utils'
export default {
  name: 'ElTreeSelect',
  props: {
    // 配置项
    props: {
      type: Object,
      default: () => {
        return {
          // ID字段名
          value: 'id',
          // 显示名称
          label: 'label',
          // 子级字段名
          children: 'children'
        }
      }
    },
    // 选项列表数据(树形结构的对象数组)
    data: {
      type: Array,
      default: () => { return [] }
    },
    // 选项列表数据(List结构的对象数组)
    list: {
      type: Array,
      default: () => { return null }
    },
    // list转换tree配置
    normalizer: {
      type: Object,
      default: () => {
        return {
          // id字段 默认 'id'
          id: 'id',
          // parentId 父节点字段 默认 'parentId'
          parentId: 'parentId',
          // children 孩子节点字段 默认 'children'
          children: 'children',
          // rootId 根Id 默认 undefined
          rootId: undefined
        }
      }
    },
    // url请求地址
    url: {
      type: String,
      default: () => { return null }
    },
    // 初始值
    value: {
      type: [Number, String],
      default: () => { return null }
    },
    // 禁用
    disabled: {
      type: Boolean,
      default: () => { return false }
    },
    // 显示复选框
    showCheckbox: {
      type: Boolean,
      default: () => { return false }
    },
    // 初始标题
    label: {
      type: String,
      default: () => { return null }
    },
    // 显示可清空选项
    clearable: {
      type: Boolean,
      default: () => { return true }
    },
    // 手风琴模式
    accordion: {
      type: Boolean,
      default: () => { return false }
    },
    // 布局大小
    size: {
      type: String,
      default: () => { return 'small' }
    },
    // 下拉框提示
    placeholder: {
      type: String,
      default: () => { return '请选择' }
    },
    // 只能选择子节点
    isOnlySelectLeaf: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  data () {
    return {
      // tree下拉框值
      valueId: this.value,
      // tree下拉框标题
      valueTitle: this.label,
      // 默认tree展开的节点key
      defaultExpandedKey: [],
      // tree下拉框提示
      placeholderText: this.placeholder,
      // 树形List集合数据
      treeList: [],
      // 树形列表数据
      valueData: this.data
    }
  },
  computed: {
    // 计算处理树形下拉数据
    optionData () {
      let TreeData = []
      if (this.list) {
        const id = this.normalizer.id
        const parentId = this.normalizer.parentId
        const children = this.normalizer.children
        const rootId = this.normalizer.rootId || Math.min.apply(Math, this.list.map(item => { return item[parentId] })) || 0
        // 对源数据深度克隆
        const cloneData = JSON.parse(JSON.stringify(this.list))
        // 循环所有项，并添加children属性
        TreeData = cloneData.filter(father => {
          // 返回每一项的子级数组
          const branchArr = cloneData.filter(child => father[id] === child[parentId])
          // 给父级添加一个children属性，并赋值
          branchArr.length > 0 ? father[children] = branchArr : ''
          // 返回第一层
          return father.parentId === rootId
        })
      } else {
        TreeData = this.valueData
      }
      this.$nextTick(() => {
        this.valueId = this.value
        this.setTreeList(TreeData)
        this.initHandle()
      })
      return TreeData
    }
  },
  watch: {
    value () {
      if (!this.value) {
        this.clearHandle()
      } else {
        this.valueId = this.value
        this.initHandle()
      }
    },
    data () {
      this.valueData = this.data
    }
  },
  created () {
    if (this.url !== null) {
      this.placeholderText = '加载数据中...'
      const interval = setInterval(() => {
        this.placeholderText = this.placeholderText + '.'
      }, 500)
      requestDecorator(globalConfig.axiosInstance({
        url: this.url,
        method: 'get'
      })).then(({ data }) => {
        this.valueData = data
        this.$nextTick(() => {
          this.placeholderText = this.placeholder
          clearInterval(interval)
        })
      })
    } else {
      this.valueData = this.data
    }
  },
  methods: {
    // 设置树形list集合数据
    setTreeList (data) {
      for (const i in data) {
        this.treeList.push(data[i])
        if (data[i].children) {
          this.setTreeList(data[i].children)
        }
      }
    },
    // 初始化值处理
    initHandle () {
      if (this.value) {
        if (this.showCheckbox) {
          const ids = this.valueId.split(',')
          this.$refs.selectTree.setCheckedKeys(ids)
          const titles = []
          ids.forEach((id) => {
            this.treeList.forEach((d) => {
              if (id === d[this.props.value]) {
                titles.push(d[this.props.label])
              }
            })
          })
          this.valueTitle = titles.join(',')
        } else if (this.$refs.selectTree.getNode(this.valueId)) {
          // 初始化显示
          this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data[this.props.label]
          // 设置默认选中
          this.$refs.selectTree.setCurrentKey(this.valueId)
          // 设置默认展开
          this.defaultExpandedKey = [this.valueId]
        }
      }
      this.initScroll()
    },
    // 提供api-获取节点
    getNode (id) {
      return this.$refs.selectTree.getNode(id)
    },
    // 隐藏下拉滚动条
    initScroll () {
      this.$nextTick(() => {
        const scrollWrap = document.querySelectorAll('.el-scrollbar .el-select-dropdown__wrap')[0]
        if (scrollWrap) { scrollWrap.style.cssText = 'margin: 0px; max-height: none; overflow: hidden;' }
      })
    },
    // 处理节点点击动作
    handleNodeClick (node) {
      if (this.showCheckbox) {
        return
      }
      if (node['disabled']) {
        this.$message.warning('节点（' + node[this.props.label] + '）被禁止选择，请重新选择。')
        return
      }
      if (this.isOnlySelectLeaf && node.children.length > 0) {
        this.$message.warning('不能选择根节点（' + node[this.props.label] + '）请重新选择。')
        return
      }
      this.valueTitle = node[this.props.label]
      this.valueId = node[this.props.value]
      this.$emit('getValue', this.valueId, this.valueTitle, node)
      this.$refs.elSelect.visible = false
    },
    // 处理节点复选框点击动作
    handleCheckChange (data, checked, indeterminate) {
      const nodes = this.$refs.selectTree.getCheckedNodes()
      this.valueTitle = nodes.map((node) => {
        return node[this.props.label]
      }).join(',')
      this.valueId = nodes.map((node) => {
        return node[this.props.value]
      }).join(',')
      this.$emit('getValue', this.valueId, this.valueTitle)
    },
    // 清除选中
    clearHandle () {
      this.valueTitle = ''
      this.valueId = null
      this.defaultExpandedKey = []
      this.clearSelected()
      this.$emit('getValue', null, null, null)
    },
    // 清空选中样式
    clearSelected () {
      const allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach((element) => element.classList.remove('is-current'))
    }
  }
}
</script>

<style scoped lang="scss">
  .el-select{
    width: 100%;
  }

  .el-scrollbar .el-scrollbar__view .el-select-dropdown__item{
    height: auto;
    max-height: 274px;
    padding: 0;
    overflow: hidden;
    overflow-y: auto;
  }

  .el-select-dropdown__item.selected{
    font-weight: normal;
  }

  ul li >>>.el-tree .el-tree-node__content{
    height:auto;
    padding: 0 20px;
  }

  .el-tree-node__label{
    font-weight: normal;
  }

  .el-tree >>>.is-current .el-tree-node__label{
    color: #409EFF;
    font-weight: 700;
  }

  .el-tree >>>.is-current .el-tree-node__children .el-tree-node__label{
    color:#606266;
    font-weight: normal;
  }
</style>

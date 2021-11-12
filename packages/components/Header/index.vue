<template>
  <el-header class="bpmn-viewer-header">
    <el-button-group>
      <el-tooltip class="item" effect="dark" content="保存并发布" placement="bottom">
        <el-button type="primary" size="mini" @click="deploy">
          <span class="icon iconfont icon-save"> 保存并发布</span>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="保存草稿" placement="bottom">
        <el-button type="primary" size="mini" @click="save">
          <span class="icon iconfont icon-save"> 保存草稿</span>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="打开流程文件" placement="bottom">
        <el-button type="primary" size="mini" @click="$refs.refFile.click()">
          <span class="icon iconfont icon-folder-open"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="创建新流程图" placement="bottom">
        <el-button type="primary" size="mini" @click="reset">
          <span class="icon iconfont icon-plus-circle"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="下载流程图" placement="bottom">
        <el-button type="primary" size="mini" @click="downloadSvg">
          <span class="icon iconfont icon-picture-o"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="下载流程文件" placement="bottom">
        <el-button type="primary" size="mini" @click="downloadBpmn">
          <span class="icon iconfont icon-download"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="撤销" placement="bottom">
        <el-button size="mini" :disabled="!canUndo" @click="undo">
          <span class="icon iconfont icon-rotate-left"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="恢复" placement="bottom">
        <el-button size="mini" :disabled="!canRedo" @click="redo">
          <span class="icon iconfont icon-rotate-right"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="缩小" placement="bottom">
        <el-button size="mini" :disabled="defaultZoom <= 0.2" @click="processZoomOut()">
          <span class="icon iconfont icon-search-minus"/>
        </el-button>
      </el-tooltip>
      <el-button size="mini" class="iconfont">
        {{ Math.ceil(defaultZoom * 10 * 10) + "%" }}
      </el-button>
      <el-tooltip class="item" effect="dark" content="放大" placement="bottom">
        <el-button size="mini" :disabled="defaultZoom >= 4" @click="processZoomIn()">
          <span class="icon iconfont icon-search-plus"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="重置" placement="bottom">
        <el-button size="mini" @click="processReZoom">
          <span class="icon iconfont icon-arrows"/>
        </el-button>
      </el-tooltip>
    </el-button-group>
    <!-- 用于打开本地文件-->
    <input id="files"
           ref="refFile"
           type="file"
           style="display: none"
           accept=".xml, .bpmn"
           @change="importLocalFile"
    >
  </el-header>
</template>

<script>

export default {
  name: 'FlowableHeader',
  props: {
    modeler: {
      type: Object
    },
    canRedo: {
      type: Boolean,
      default: false
    },
    canUndo: {
      type: Boolean,
      default: false
    },
    defaultZoom: {
      validator: () => true,
      default: 1
    }
  },
  methods: {
    deploy () {
      let _xml
      let _svg
      this.modeler.saveXML((err, xml) => {
        if (err) {
          console.error(err)
        }
        _xml = xml
      })
      this.modeler.saveSVG((err, svg) => {
        if (err) {
          console.error(err)
        }
        _svg = svg
      })
      console.log(_xml)
      console.log(_svg)
      // todo:保存发布部署操作
    },
    save () {
      let _xml
      let _svg
      this.modeler.saveXML((err, xml) => {
        if (err) {
          console.error(err)
        }
        _xml = xml
      })
      this.modeler.saveSVG((err, svg) => {
        if (err) {
          console.error(err)
        }
        _svg = svg
      })
      console.log(_xml)
      console.log(_svg)
      // todo:保存操作
    },
    reset () {
      this.$emit('restart')
    },
    downloadSvg () {
      this.$emit('handleExportSvg')
    },
    downloadBpmn () {
      this.$emit('handleExportBpmn')
    },
    undo () {
      this.modeler.get('commandStack').undo()
    },
    redo () {
      this.modeler.get('commandStack').redo()
    },
    processZoomIn (zoomStep = 0.1) {
      this.$emit('handleProcessZoomIn', zoomStep)
    },
    processZoomOut (zoomStep = 0.1) {
      this.$emit('handleProcessZoomOut', zoomStep)
    },
    processReZoom () {
      this.$emit('handleProcessReZoom')
    },
    importLocalFile () {
      const that = this
      const file = this.$refs.refFile.files[0]
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = function () {
        const xmlStr = this.result
        that.$emit('importDiagram', xmlStr)
      }
    }
  }
}

</script>

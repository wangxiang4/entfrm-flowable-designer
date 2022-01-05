<template>
  <div id="app">
    <el-dialog title="设计流程模型"
               center
               fullscreen
               class="design"
               :visible="true"
               :close-on-click-modal="false"
    >
      <flowable-designer style="height:calc(100vh - 57px)"/>
    </el-dialog>
    <!--<flowable-chart/>-->
    <!--<flowable-preview/>-->
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

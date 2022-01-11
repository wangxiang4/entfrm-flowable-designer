<template>
  <div id="app">
    <flowable-designer style="height:100vh"/>
    <!--<flowable-chart :options="chat" style="height:100vh"/>-->
    <!--<flowable-preview :options="chat" style="height:100vh"/>-->
  </div>
</template>

<script>
import request from './request'
export default {
  name: 'App',
  data () {
    return {
      chat: {}
    }
  },
  mounted () {
    this.test()
  },
  methods: {
    test () {
      request({
        url: '/workflow/process/getFlowChart/Process_FtFEFSfa:4:7832a2d9-7313-11ec-8a3b-00ff08753f51',
        method: 'get'
      }).then(({ data }) => {
        this.chat = { bpmnXml: data }
      })
    }
  }
}
</script>

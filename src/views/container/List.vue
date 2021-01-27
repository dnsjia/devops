<template>
  <div>
    <a-tabs default-active-key="1" @change="callback">
      <!--    <a-tabs default-active-key="1" @change="callback">-->
      <a-tab-pane key="1" tab="无状态">
        <Deployment></Deployment>
      </a-tab-pane>

<!--      <a-tab-pane key="2" tab="有状态" force-render>-->
<!--        功能开发中-->
<!--      </a-tab-pane>-->
<!--      <a-tab-pane key="3" tab="守护进程集">-->
<!--        功能开发中-->
<!--      </a-tab-pane>-->
<!--      <a-tab-pane key="4" tab="任务">-->
<!--        功能开发中-->
<!--      </a-tab-pane>-->
<!--      <a-tab-pane key="5" tab="定时任务">-->
<!--        功能开发中-->
<!--      </a-tab-pane>-->
      <a-tab-pane key="6" tab="容器组">
        <Pod></Pod>
      </a-tab-pane>

    </a-tabs>
  </div>
</template>

<script>
import {deployments, namespaces} from '@/api/k8s'
import Pod from "./Pod"
import Deployment from "./Deployment"


export default {
  name: "List",
  methods: {
    callback(key) {
      console.log(key);
    },
  },
  components: {
    Deployment,
    Pod,
  }
}
</script>

<style scoped>

</style>
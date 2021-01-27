<template>
    <div>
        <router-view v-if="isRouterAlive"></router-view>
    </div>
</template>


<script>
    // 其他组件
    export default {
        name: 'app',
        provide(){
            return {
                reload: this.reload,
            }
        },
        data() {
            return {
                isRouterAlive: true
            }
        },
        methods: {
            // 刷新页面
            reload(){
                this.isRouterAlive = false;
                this.$nextTick(function () {
                    this.isRouterAlive =true
                })
            }
        },
    }
</script>
<style scoped>
</style>
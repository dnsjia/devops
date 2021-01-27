import axios from './utils/request'
import Vue from "vue";

Vue.mixin({
    methods: {
        $get(url, params) {
            console.log(`GET请求了${url}`);
            const pro = axios.get(url, {
                params
            });
            pro.catch(() => {
                this.$msgerror('系统出现预期外错误!')
            });
            return pro

        },
        $post(url, params) {
            console.log(`POST请求了${url}`);
            const pro = axios.post(url, {
                params
            });
            pro.catch(() => {
                this.$msgerror('系统出现预期外错误!')
            });
            return pro

        },
        $put(url, params) {
            console.log(`PUT请求了${url}`);
            const pro = axios.put(url, {
                params
            });
            pro.catch(() => {
                this.$msgerror('系统出现预期外错误!')
            });
            return pro

        },
        $del(url, params) {
            console.log(`DELETE请求了${url}`);
            const pro = axios.delete(url, {
                params
            });
            pro.catch(() => {
                this.$msgerror('系统出现预期外错误!')
            });
            return pro

        },
        $msgsuccess(content, onClose, duration = 3) {
            return this.$message.success(content, duration, onClose)
        },
        $msgerror(content, onClose, duration = 3) {
            return this.$message.error(content, duration, onClose)
        },
        $msgwarning(content, onClose, duration = 3) {
            return this.$message.warning(content, duration, onClose)
        },
        // 删除确认提示框
        $msgconfirm(content, onOk) {
            this.$confirm({
                title: "系统提示",
                content,
                okText: '确定',
                okType: 'danger',
                cancelText: '取消',
                onOk
            });
        },
    }
});

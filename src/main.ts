import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import 'nprogress/nprogress.css'
import './plugin/index'
import VueCookies from 'vue-cookies'
import './plugin/mixin'
// es6
import "babel-polyfill"

// filter过滤器
import filter from './plugin/filter'

Object.keys(filter).forEach(filterName => {
    Vue.filter(filterName, filter[filterName])
})
import env from '@/store/env.js'
Vue.prototype.$ENV = env

import axios from 'axios'
import VueAxios from 'vue-axios'
import Editor from 'bin-ace-editor';
require('brace/mode/json')
require('brace/snippets/json')
require('brace/theme/chrome')
// 注册组件后即可使用
Vue.component(Editor.name, Editor)

Vue.use(VueAxios, axios);
Vue.use(Antd);
Vue.use(VueCookies);
Vue.config.productionTip = false;
// 允许跨域获取Cookie
axios.defaults.withCredentials = true
new Vue({
    router,
    render: h => h(App)
}).$mount('#app');

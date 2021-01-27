<template>
  <div>
  <a-form :layout="formLayout">
    <a-form-item
      :label-col="formItemLayout.labelCol"
      :wrapper-col="formItemLayout.wrapperCol"
    >

    <a-form-item label="节点类型:">
      <a-select style="width: 120px;" default-value="container"
        v-decorator="[
          'gender',
          { rules: [{ required: true, message: 'Please select your gender!' }] },
        ]"
        placeholder="Select a option and change input text above"
        @change="nodeSelectChange"
      >
        <a-select-option value="container">容器应用</a-select-option>
        <a-select-option value="tradition">传统应用</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="服务名称:">
      <a-select style="width: 180px;"
        v-decorator="[
          'gender',
          { rules: [{ required: true, message: 'Please select your gender!' }] },
        ]"
        placeholder="下拉选择服务名称"
        @change="handleSelectChange"
      >
        <a-select-option value="trip-service">trip-service</a-select-option>
        <a-select-option value="trip-mapi">trip-mapi</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="容器ID:" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
      <a-input style="width: 400px" placeholder="请输入容器ID" />
    </a-form-item>
    <a-form-item label="进程关键字:" :label-col="formItemLayout.labelCol" :wrapper-col="formItemLayout.wrapperCol">
      <a-input placeholder="请输入内容" />
    </a-form-item>
       </a-form-item>
  </a-form>
    <br>
      <a-button type="primary" @click="installApp">安装</a-button>
    <a-divider type="vertical" />
     <a-button type="danger" @click="removeApp">卸载</a-button>
  <br><br>
    <a-tabs default-active-key="1" @change="callback">
      <a-tab-pane key="1" tab="控制面板">
        <div id="xterm" class="xterm" />
        Content of Tab Pane 控制面板
      </a-tab-pane>
      <a-tab-pane key="2" tab="线程清单" force-render>
        Content of Tab Pane 2
      </a-tab-pane>
      <a-tab-pane key="3" tab="JVM信息">
        Content of Tab Pane 3
      </a-tab-pane>
      <a-tab-pane key="4" tab="系统信息">
        Content of Tab Pane 3
      </a-tab-pane>
      <a-tab-pane key="5" tab="线程堆栈">
        Content of Tab Pane 3
      </a-tab-pane>
      <a-tab-pane key="6" tab="方法追踪">
        Content of Tab Pane 3
      </a-tab-pane>
      <a-tab-pane key="7" tab="方法观测">
        Content of Tab Pane 3
      </a-tab-pane>
      <a-tab-pane key="8" tab="方法追溯">
        Content of Tab Pane 3
      </a-tab-pane>
      <a-tab-pane key="9" tab="方法监控">
        Content of Tab Pane 3
      </a-tab-pane>
      <a-tab-pane key="10" tab="源码查看">
        Content of Tab Pane 3
      </a-tab-pane>
      <a-tab-pane key="11" tab="静态属性">
        Content of Tab Pane 3
      </a-tab-pane>
      <a-tab-pane key="12" tab="环境信息">
        Content of Tab Pane 3
      </a-tab-pane>
    </a-tabs>
      <div title="fullscreen" id="fullSc" class="fullSc">
        <button id="fullScBtn" onclick="xtermFullScreen()"><img src="http://192.168.1.16:8080/fullsc.png"></button>
    </div>
  </div>
</template>

<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
export default {
  name: 'Xterm',
  props: {
    socketURI: {
      type: String,
      default: 'ws://192.168.1.16:7777/'
    },
  },
  mounted() {
    this.initSocket()
  },
  beforeDestroy() {
    this.socket.close()
    this.term.dispose()
  },
  data() {
    return {
      formLayout: 'inline',
      form: this.$form.createForm(this, { name: 'coordinated' }),
    };
  },
  computed: {
    formItemLayout() {
      const { formLayout } = this;
      return formLayout === 'horizontal'
        ? {
            labelCol: { span: 6 },
            wrapperCol: { span: 4 },
          }
        : {};
    },
    buttonItemLayout() {
      const { formLayout } = this;
      return formLayout === 'inline'
        ? {
            wrapperCol: { span: 4, offset: 6 },
          }
        : {};
    },
  },
  methods: {
    handleFormLayoutChange(e) {
      this.formLayout = e.target.value;
    },
    handleSelectChange(value) {
      console.log(value)
    },
    nodeSelectChange(value) {
      console.log(value)
    },
    callback(value) {
    // 调用arthas 方法
      console.log("这里会调用arthas的方法", value)
      if (value===1) {
        //  调用websocket

      }
    },
    installApp() {
    //  安装arthas诊断工具
      console.log("install arthas")
    },
    removeApp() {
    //  remove arthas
      console.log("remove arthas")
    },
    initTerm() {
      const term = new Terminal({
        fontSize: 14,
        cursorBlink: true
      });
      const attachAddon = new AttachAddon(this.socket);
      const fitAddon = new FitAddon();
      term.loadAddon(attachAddon);
      term.loadAddon(fitAddon);
      term.open(document.getElementById('xterm'));
      fitAddon.fit();
      term.focus();
      this.term = term
    },
    initSocket() {
      this.socket = new WebSocket(this.socketURI);
      this.socketOnClose();
      this.socketOnOpen();
      this.socketOnError();
    },
    socketOnOpen() {
      this.socket.onopen = () => {
        // 链接成功后
        this.initTerm()
      }
    },
    socketOnClose() {
      this.socket.onclose = () => {
        // console.log('close socket')
      }
    },
    socketOnError() {
      this.socket.onerror = () => {
        // console.log('socket 链接失败')
      }
    }
  }
}
</script>
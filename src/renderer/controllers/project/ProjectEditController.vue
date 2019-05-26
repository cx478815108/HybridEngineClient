<template>
  <div id="projectEdit">
    <nav class = "navigationBar">
      <div id = "navTitle">调试</div>
      <div class = "navItem">
        <Button class = "barItemButton" type="text" @click = 'onBackItemClick()'>
          <Icon size = '20' style = 'margin-right:4px' type="ios-arrow-back" />
        </Button>
      </div>
    </nav>
    <div>
      <div id = "head">
        <Table border :show-header = "false" size = "small" :columns="columns" :data="rows">
          <template slot="action" slot-scope="{ row, index }">
            <Button v-if = 'index==0' type="success" 
            size="small" style="margin-right: 5px" @click = "openFinder()">打开目录</Button>
            <Button v-if = 'index==1 && !isSocketRuning' type="success" 
            size="small" style="margin-right: 5px" @click = "onStartServerClick()">启动服务</Button>
            <div class="demo-spin-container" v-if = 'index==1 && isSocketRuning' type="text"><Spin fix v-if = 'index==1 && isSocketRuning'></Spin></div>
            <i-switch v-if = 'index==3 && isSocketRuning && iPhoneConnected'  v-model="shouldWatching" @on-change="onSwitchClick()"></i-switch>
          </template>
        </Table>
      </div>
      <div id = "toolBar">
        <div class = "barItem">
          <Button class = "barItemButton" type="text" @click = 'onCompileClick()'>
            <Icon size = '16' style = 'margin-right:4px' type="ios-construct-outline" />编译
          </Button>
          <div class = "vsep"></div>
        </div>
        <div class = "barItem">
          <Button class = "barItemButton" type="text" @click = "onTransportClick()"><Icon size = '16' style = 'margin-right:4px' type="ios-link-outline" />传输</Button>
          <div class = "vsep"></div>
        </div>
        <div class = "barItem">
          <Button class = "barItemButton" type="text" @click = "onRefreshClick()">
            <Icon size = '20' style = 'margin-right:4px' type="ios-refresh" />刷新</Button>
        </div>
      </div>
    </div>

    <div id = "workBody">
      <div id = "splitArea">
        <Split id = "split" v-model="splitRatio" mode="vertical" @on-moving = "updateFrame()">
            <CodeEditor slot="top" id = "codeEditor" ref = "monacoEditor"></CodeEditor>
            <div slot="bottom" id = "appLogContainer" >
              <div id = "logtoolbar" >
                <div class = "logtoolbarItem" @click = "onRunClick()"><Icon type="ios-play" size = "22"/></div>
                <div class = "logtoolbarItem" @click = "appLog = ''"><Icon type="ios-trash" size = "22"/></div>
              </div>
              <textarea id = "appLog" readonly="readonly" v-model = "appLog" placeholder="日志区"></textarea>  
            </div>
        </Split>
      </div>
    </div>
  </div>
</template>

<script>
  import fs from 'fs'
  import path from 'path'
  import { shell }  from 'electron'
  import MobileDebugger from '../../../debug/MobileDebugger'
  import CodeEditor from './CodeEditor'
  import Workman from '../js/Workman'
  import '../css/ProjectEdit.css'

  export default {
    components:{
        'CodeEditor' : CodeEditor,
    },
    mounted(){
      this.updateFrame();
      window.addEventListener('resize', ()=>{
        this.updateFrame();
      });
      this.workman = new Workman(this.projectConfig);
      this.onStartServerClick();
    },
    destroyed(){
      // 关闭服务
      MobileDebugger.closeServer();
      this.workman.destroy();
    },
    data(){
      return {
        iPhoneConnected: false,
        shouldWatching : false,
        splitRatio     : 0.36,
        isSocketRuning : false,
        appLog         : '',
        projectConfig  : this.$route.params,
        columns:[
          {title: '信息', key: 'title',width:110},
          {title: '详情', key: 'info'},
          {title: '操作', slot: 'action',width:100}
        ],
        rows:[
          {title:'当前项目路径', info: this.$route.params.workDirectory},
          {title:'本机IP', info: '服务未启动'},
          {title:'iPhone 状态', info: '未连接'},
          {title:'自动模式', info: '工程文件变化后会自动编译、传输、刷新App'}
        ],
        workman:null
      }
    },
    methods:{
      setAppLog(log){
        const date = new Date();
        const logInfo = (`[${date.getMinutes()}:${date.getSeconds()}]：${log}`);
        this.appLog = logInfo;
      },
      appendAppLog(log){
        const date = new Date();
        const logInfo = (`[${date.getMinutes()}:${date.getSeconds()}]：${log}\n`);
        this.appLog += logInfo;
      },
      updateFrame(){
        const split = document.getElementById('split');
        const codeEditor = document.getElementById('codeEditor');
        const appLogContainer = document.getElementById('appLogContainer');
        if(codeEditor &&codeEditor.style){
          codeEditor.style.height = `${(split.clientHeight * this.splitRatio)}px`;
        }
        appLogContainer.style.height = `${(split.clientHeight * (1- this.splitRatio)) - 4}px`;
      },
      openFinder(){
        const cwd = this.projectConfig.workDirectory;
        const result = shell.showItemInFolder(cwd);
        if(!result){
          this.$Message.error({content:"打开失败！"});
        }
      },
      onStartServerClick(){
        const self = this;
        MobileDebugger.startServer({
          onStart(ipAddress){
            self.isSocketRuning = true;
            self.rows[1].info = ipAddress;
          },
          onConnected(){
            self.iPhoneConnected = true;
            self.rows[2].info = '已连接';
            self.$Message.success({content:"iPhone客户端已连接"});
          },
          onReceiveMessage(msg){
            self.appendAppLog(msg);
          },
          onClose(){
            self.iPhoneConnected = false;
            self.rows[2].info = '未连接';
            self.$Message.error({content:"和iPhone的调试已经断开"});
          },
          onError(error){
            self.iPhoneConnected = false;
            self.isSocketRuning = false;
            self.rows[2].info = '未连接';
            self.$Message.error({content:error});
            self.appLog = error;
          }
        });
      },
      onTransportClick(){
        if(!this.iPhoneConnected) {
          return this.$Message.info({content:'iPhone未连接'});
        }
        this.workman.transportFile()
        .then(()=>{
          this.$Message.info({content:'传输完毕'});
        }).catch((error)=>{
          this.$Message.error({content:error});
          this.appLog = error;
        });
      },
      onBackItemClick(){
        this.isSocketRuning = false;
        this.$router.push({name:'manage'});
        MobileDebugger.closeServer();
      },
      onSwitchClick(){
        if(this.shouldWatching){
          this.workman.watchProject(this.setAppLog)
          .then(()=>{
            this.appendAppLog('文件监测已启动');
          })
          .catch((error)=>{
            this.appLog = error;
          });
          return ;
        }
        if(!this.workman) return ;
        this.workman.stopWatch();
        this.appendAppLog('文件监测已停止');
      },
      onCompileClick(){
        this.setAppLog('开始编译...\n');
        const process  = (item) =>{
          this.appendAppLog(item.info);
        };

        this.workman.compileProject(process)
        .then(()=>{
          this.$Message.success({content:"编译成功"});
        })
        .catch((error)=>{
          this.$Message.error({content:"编译失败"});
          this.setAppLog("" + error);
        });
      },
      onRefreshClick(){
        if(!this.iPhoneConnected) {
          return this.$Message.info({content:'iPhone未连接'});
        }
        this.workman.sendRefreshCommond();
      },
      onRunClick(){
        if(!this.iPhoneConnected) {
          return this.$Message.info({content:'iPhone未连接'});
        }
        const code = this.$refs.monacoEditor.getCode();
        this.workman.sendRunCodeCommand(code);
      }
    }
  }
</script>

<style scoped>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
</style>

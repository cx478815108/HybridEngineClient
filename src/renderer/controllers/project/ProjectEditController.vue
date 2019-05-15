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
        <Table border  :show-header = "false" size = "small" :columns="columns" :data="rows">
          <template slot="action" slot-scope="{ row, index }">
            <Button v-if = 'index==0' type="success" 
            size="small" style="margin-right: 5px" @click = "openFinder()">打开目录</Button>
            <Button v-if = 'index==1 && !isSocketRuning' type="success" 
            size="small" style="margin-right: 5px" @click = "startServer()">启动服务</Button>
            <div class="demo-spin-container" v-if = 'index==1 && isSocketRuning' type="text"><Spin fix v-if = 'index==1 && isSocketRuning'></Spin></div>
          </template>
        </Table>
        <Progress v-if = "isCompiling" :percent="progressPercent" :stroke-width="5" />
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
        <Split id = "split" v-model="splitRatio" mode="vertical" @on-moving = "onSplitMoving()">
            <CodeEditor slot="top" id = "codeEditor" ref = "monacoEditor"></CodeEditor>
            <div slot="bottom" id = "appLogContainer" >
              <div id = "logtoolbar" >
                <div class = "logtoolbarItem" @click = "onRunClick()"><Icon type="ios-play" size = "22"/></div>
                <div class = "logtoolbarItem" @click = "onTrashClick()"><Icon type="ios-trash" size = "22"/></div>
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
  import hybridcompiler from 'hybridcompiler'
  import { shell }  from 'electron'
  import MobileDebugger from '../../../debug/MobileDebugger'
  import CodeEditor from './CodeEditor'
  import '../css/ProjectEdit.css'

  export default {
    components:{
        'CodeEditor' : CodeEditor,
    },
    mounted(){
      this.updateFrame();
      window.addEventListener('resize', ()=>{
        this.updateFrame();
      })
    },
    data(){
      return {
        splitRatio:0.2,
        progressPercent:0,
        isSocketRuning:false,
        isCompiling:false,
        appLog:'12334',
        projectConfig:this.$route.params,
        columns:[
          {title: '信息', key: 'title',width:110},
          {title: '详情', key: 'info'},
          {title: '操作', slot: 'action',width:100}],
        rows:[
          {title:'当前项目路径', info: this.$route.params.workDirectory},
          {title:'本机IP', info: '服务未启动'},
          {title:'iPhone 状态', info: '未连接'}],
      }
    },
    methods:{
      updateFrame(){
        const split = document.getElementById('split');
        const codeEditor = document.getElementById('codeEditor');
        const appLogContainer = document.getElementById('appLogContainer');
        codeEditor.style.height = `${(split.clientHeight * this.splitRatio)}px`;
        appLogContainer.style.height = `${(split.clientHeight * (1- this.splitRatio)) - 4}px`;
      },
      onSplitMoving(){
        this.updateFrame();
      },
      openFinder(){
        const cwd = this.projectConfig.workDirectory;
        const result = shell.showItemInFolder(cwd);
          if(!result){
            this.$Message.error({content:"打开失败！"});
          }
      },
      startServer(){
        const self = this;
        MobileDebugger.startServer({
          onStart(ipAddress){
            self.isSocketRuning = true;
            self.rows[1].info = ipAddress;
          },
          onConnected(){
            self.rows[2].info = '已连接';
            self.$Message.success({content:"iPhone客户端已连接"});
          },
          onClose(){
            self.rows[2].info = '未连接';
            self.$Message.error({content:"和iPhone的调试已经断开"});
          },
          onError(error){
            self.isSocketRuning = false;
            self.rows[2].info = '未连接';
            self.$Message.error({content:"链接发生错误"});
          }
        });
      },
      onTransportClick(){
        MobileDebugger.transportMessage();
      },
      onBackItemClick(){
        this.$router.push({name:'manage'});
        MobileDebugger.closeServer();
        if(this.isSocketRuning){
          this.$Notice.info({
            title:'提示',
            desc:"调试服务已关闭",
            top: 10,
            duration: 2});
          this.isSocketRuning = false;
        }
      },
      onCompileClick(){
        this.isCompiling = true;
        const cwd = this.projectConfig.workDirectory;
        const jsonText = fs.readFileSync(path.join(cwd, 'tokenhybrid.config.json'));
        const json = JSON.parse(jsonText);
        hybridcompiler.build(json, (percent)=>{
          this.progressPercent = percent * 100;
        }).then(()=>{
          this.progressPercent = 100
          this.isCompiling = false;
          this.$Message.success({content:"编译成功"});
        }).catch((error)=>{
          this.$Message.error({content:"编译失败"});
        });
      },
      onRefreshClick(){

      },
      onRunClick(){
        const codes = this.$refs.monacoEditor.getCode();
        console.log("代码是：", codes);
      },
      onTrashClick(){

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

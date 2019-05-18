<template>
  <div id="createForm">
    <Modal v-model="queryFileExist" title="请注意" 
    @on-ok="createTemplate()">
    <p>{{formData.workDirectory}}</p>
    <p>目录下已经存在项目是否覆盖</p>
    </Modal>
    <Form :model="formData">
        <Row :gutter="32">
            <Col span="12">
            <FormItem label="App 唯一标识" label-position="top">
                <Input v-model="formData.identifier" placeholder="com.example.xxx" />
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="App 名" label-position="top">
                <Input v-model="formData.displayName" placeholder="App 名用于商店展示" />
            </FormItem>
            </Col>
        </Row>
        <Row :gutter="32">
            <Col span="12">
            <FormItem label="首页标题" label-position="top">
                <Input v-model="formData.title" placeholder="第一个页面标题" />
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="所有页面入口JS文件名" label-position="top">
                <Input v-model="formData.entryJS" placeholder="index.js" />
            </FormItem>
            </Col>
        </Row>
        <Row :gutter="32">
          <Col span="12">
            <FormItem label="所有页面入口HTML文件名" label-position="top">
                <Input v-model="formData.entryHTML" placeholder="index.html" />
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="所有页面入口CSS文件名" label-position="top">
                <Input v-model="formData.entryCSS" placeholder="index.css" />
            </FormItem>
            </Col>
        </Row>
        <Row :gutter="32">
            <Col span="24">
            <FormItem :label="workDirectoryInfo" label-position="top">
                <div id = "dragArea" class = 'ivu-upload ivu-upload-drag'
                    @drop = "onDrop($event)"
                    @dragover = "onDragover($event)" 
                    @click = "onDragAreaClick()">
                        <Icon type="ios-folder-open-outline" size="32" style="margin-top:8px;color: #3399ff" />
                        <div style = "margin-bottom:6px">{{workDirectoryInfo}}</div>
                </div>
            </FormItem>
            </Col>
            
        </Row>
    </Form>
    
    <div class="demo-drawer-footer">
        <Button type="success" @click="saveProject()">创建</Button>
    </div>
  </div>

</template>

<script scoped>
  const fs = require('fs');
  const { dialog } = require('electron').remote;
  import AppManager from "../../tool/AppManager";
  import AppTemplate from "../../tool/AppTemplate";
  import AppEventKeys from '../../tool/AppEventKeys'

  export default {
    data(){

      return {
        formData: {
            displayName: '',
            title: '',
            identifier: '',
            entryJS: 'index.js',
            entryHTML: 'index.html',
            workDirectory:'未选择',
            entryCSS:'index.css'
        },
        queryFileExist:false,
        workDirectoryInfo:"请选择保存的目录-可拖拽目录至此处",
        selectedFolder:false
      }
    },
    methods:{
      onDragover(event){
        event.preventDefault();
        event.stopPropagation();
      },
      onDrop(event){
        event.preventDefault();
        const list = event.dataTransfer.files;
        if(!list.length) return;
        const file = list[0].path;
        if(fs.lstatSync(file).isDirectory()){
          this.formData.workDirectory = file;
          this.workDirectoryInfo = `已选择：${file}`;
          this.selectedFolder = true;
        }
        else{
          this.$Message.error({content:"拖拽的不是目录"});
        }
      },
      onDragAreaClick(){
        const list = dialog.showOpenDialog({
            properties: ['openDirectory','createDirectory'],
            title: '请选择一个文件夹用于保存工程'
          });
        if(!list || !list.length) return;
        this.selectedFolder = true;
        this.workDirectoryInfo = `已选择：${list[0]}`;
        this.formData.workDirectory = list[0];
      },
      checkParameters(){
        const config = {};
        let result = true;

        if(this.formData.identifier.length == 0){
          config.content = '请填写App唯一标识';
          result = false;
        }
        else{
          if(!(escape(this.formData.identifier).indexOf("%u")<0)){
            this.$Message.error({content:'App唯一标识请不要包含中文'});
            return false;
          }
        }
        
        if(this.formData.displayName.length == 0){
          config.content = '请填写App展示名';
          result = false;
        }
        else if(this.formData.title.length == 0){
          config.content = '请填写App首页标题';
          result = false;
        }
        else if(this.formData.workDirectory.length == 0){
          config.content = '请选择工作目录';
          result = false;
        }
        
        if(!result){
          this.$Message.error(config);
          setTimeout(() => {
            this.$Message.destroy();
          }, 1800); 
        }
        return result;
      },
      saveProject(){
        const result = this.checkParameters();
        if(!result){ return ;}

        if(!this.selectedFolder){
          this.$Message.error({content:"请选择保存目录"});
          return ;
        }

        // 制作模型
        const data = JSON.parse(JSON.stringify(this.formData));
        const appTemplate = new AppTemplate(data);

        if(!AppManager.appTemplateExist(appTemplate)){
          this.createTemplate();
          return ;
        }
        this.queryFileExist = true;
      },
      createTemplate(){
        // 制作模型
        const data = JSON.parse(JSON.stringify(this.formData));
        const appTemplate = new AppTemplate(data);
        if(AppManager.createAppTemplate(appTemplate)){
          this.$Message.success({content:"保存成功"});
          this.bus.$emit(AppEventKeys.updateExistedProjects);
          this.bus.$emit(AppEventKeys.hiddenForms);
        }
        else{
          this.$Message.error({content:"保存失败"});
        }
      },
    }
  }
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #createForm {
    width: 100%;
    height: 100%;
  }

  #dragArea {
    width: 100%;
    height: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    -webkit-user-select: text;
  }
</style>

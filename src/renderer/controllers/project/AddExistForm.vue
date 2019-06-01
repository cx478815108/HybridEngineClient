<template>
  <div id="createForm">
    <div id = "dragArea" class = 'ivu-upload ivu-upload-drag'
        @drop = "onDrop($event)"
        @dragover = "onDragover($event)">
        <Icon type="ios-folder-open-outline" size="32" style="margin-top:8px;color: #3399ff" />
        <div style = "margin-bottom:6px">{{workDirectoryInfo}}</div>
    </div>
    <div class="demo-drawer-footer">
        <Button type="success" @click="saveProject()">确定添加</Button>
    </div>
  </div>
</template>

<script>
  import fs from 'fs';
  import path from 'path';
  import AppDB from '../../tool/AppDB'
  import AppEventKeys from '../../tool/AppEventKeys'

  export default {
    data(){
      return {
          workDirectoryInfo:"将目录拖拽至此处",
          workDirectory:"",
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
          this.workDirectory = file;
          this.workDirectoryInfo = `已选择：${file}`;
          this.selectedFolder = true;
        }
        else{
          this.$Message.error({content:"拖拽的不是目录"});
        }
      },
      saveProject(){
        const configJSONPath = path.join(this.workDirectory, 'tokenhybrid.config.json');
        if(!fs.existsSync(configJSONPath)){
            return this.$Message.error({content:"该目录下未找到tokenhybrid.config.json文件"});
        }
        try {
            const configJSON = JSON.parse(fs.readFileSync(configJSONPath).toString());
            // 更新工作目录
            configJSON.workDirectory = this.workDirectory;
            const jsonText = JSON.stringify(configJSON, null, 2);
            fs.writeFileSync(configJSONPath, jsonText);

            AppDB.saveExistProject(configJSON);
            this.$Message.success({content:"添加成功"});
            this.bus.$emit(AppEventKeys.updateExistedProjects);
            this.bus.$emit(AppEventKeys.hiddenForms);
        } catch (error) {
            this.$Message.error({content:"tokenhybrid.config.json不是有效JSON文件"});
            console.log(error);
        }
      }
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
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    -webkit-user-select: text;
  }

  .demo-drawer-footer{
      margin-top: 10px;
  }
</style>

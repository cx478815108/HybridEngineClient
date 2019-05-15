<template>
  <div id="codeEditorContainer">
    <div id = 'monaco' ></div>
  </div>
</template>

<script>
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
  export default {
    data(){
        return {
            monacoInstance:null,
            }
    },
    mounted(){
      const ele = document.getElementById("monaco");
      this.monacoInstance = monaco.editor.create(ele, {
            value:`console.log("hello,world")`,
            language:"javascript",
            automaticLayout: true,
        });
        window.addEventListener('resize', ()=>{
            this.monacoInstance.layout();
        })
    },
    methods:{
        getCode(){
            return this.monacoInstance.getValue();
        }
    },
    destroyed(){
        this.monacoInstance.dispose();
    }
  }
</script>

<style scoped>
  #codeEditorContainer {
      width: 100%;
      height: 100%;
  }
  
  #monaco{
    width: 100%;
    height: 100%;
  }
</style>

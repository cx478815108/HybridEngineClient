<template>
  <div id = "appcontainer">
    <div id = "menuContainer">
      <div id = "title">TokenHybrid</div>
      <div id = "version">版本号v1.0.4</div>
      <div id = "menuWrapper">
        <Menu width = '100%' active-name="1" 
        @on-select= "didPressedMenuItem($event)" 
        @on-open-change = "didPressedMenuItem()">
          <MenuItem name="1" to = "/project">
              <Icon type="md-document" />
              工程管理
          </MenuItem>
          <MenuItem name="2" to = '/codesegment'>
              <Icon type="ios-code" />
              代码片段
          </MenuItem>
          <MenuItem name="3" to = '/document'>
              <Icon type="ios-book-outline"/>
              开发文档
          </MenuItem>
        </Menu>
      </div>
      
    </div>

    <div class = "verticalSep"></div>
    
    <div id = "controllerContent">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'LandingPage',
    created(){
      this.$router.push({name:'project-page'})
    },
    methods: {
      didPressedMenuItem(event){
      }
    },
    data () {
        return {}
    }
  }
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #appcontainer{
    width: 100%;
    height: 100%;
    -webkit-user-select: none;
    display: flex;
    flex-direction: row;
    display: flex;
    overflow: hidden;
  }

  .verticalSep{
    /* margin-left: 2px; */
    border: 0.5px solid #eee;
    width: 0.5px;
    top: 0;
    bottom:0
  }

  #menuContainer{
    width: 200px;
    height: 100%;
    display: flex;
    flex-direction: column;
    -webkit-app-region: drag;
  }

  #menuWrapper{
    width: 100%;
    margin-top: 40px;
  }

  #controllerContent{
    flex: 1;
    background-color: white;
    display: flex;
    overflow:scroll;
  }

  #title {
      font-size: 20px;
      text-align: center;
      margin-top: 60px;
  }

  #version{
      font-size: 12px;
      text-align: center;
  }
</style>

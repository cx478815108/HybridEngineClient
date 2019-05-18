<template>
  <div class="app" id="documentController">
    <div class="demo-spin-col" v-if = "isLoading">
        <Spin fix>
            <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
            <div>Loading</div>
        </Spin>
    </div>
    <webview id="webView" :src="src" autosize :maxwidth = "webWidth" :maxheight = "webHeight"></webview>
  </div>
</template>

<script>
  
  export default {
      mounted(){
          const webview = document.querySelector('webview');
          const stop = ()=>{
              this.isLoading = false;
          }
          webview.addEventListener('did-finish-load', stop);
          webview.addEventListener('did-stop-load', stop);

          webview.addEventListener('did-fail-load', () => {
              this.isLoading = false;
              this.$Message.error({content:"加载失败"});
          });

          const documentController = document.getElementById('documentController');
          this.webHeight = documentController.clientHeight;
          this.webWidth = documentController.clientWidth;
      },
      data(){
          return {
              isLoading:true,
              webWidth:400,
              webHeight:400,
              src:'https://cx478815108.github.io/HybridDocument/#/'
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

  #documentController{
      position: relative;
      width: 100%;
      height: 100%;
  }

  #webView {
      width: 100%;
      height: 100%;
  }

  .demo-spin-icon-load{
      animation: ani-demo-spin 1s linear infinite;
  }
  
  @keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
  }
  
  .demo-spin-col{
      height: 80px;
      width: 80px;
      position: absolute;
      margin: auto;
      left: 0;right: 0;top: 0;bottom: 0;
    }

</style>

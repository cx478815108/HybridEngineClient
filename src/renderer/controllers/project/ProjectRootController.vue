<template>
  <div class="app" id="projectRootController">
    <keep-alive>
      <transition :name="transitionName">
        <router-view class="app-router-view"></router-view>
      </transition>
    </keep-alive>
  </div>
</template>

<script>
  import router from '../../router/project.js'
  import "./Transition.css";
  
  export default {
    router,
    data(){
      return {
        transitionName:'move-fade-right-to-left'
      }
    },
    watch:{
      '$route':function(to, from){
        if(from.name === 'edit'){
          this.transitionName = 'move-fade-left-to-right'
        }
        else{
          this.transitionName = 'move-fade-right-to-left'
        }
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

  #projectRootController {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  html,
  body,
  .app {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .app {
    background-color: white;
  }

  .app .app-router-view {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
    transform-style: preserve-3d;
    visibility: visible;
  }

</style>

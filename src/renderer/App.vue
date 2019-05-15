<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'engineclient',
  }

</script>

<style scoped>
  /* CSS */
  #app {
    height: 100vh;
    width: 100vw;
    position: relative;
    -webkit-app-region:drag;
  }
</style>

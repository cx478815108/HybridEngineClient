<template>
  <div id="myapp">
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
  #myapp {
    height: 100vh;
    width: 100vw;
    position: relative;
  }
</style>

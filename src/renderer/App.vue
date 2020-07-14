<template>
  <div id="app">
    <h1>hello</h1>
    <router-link :to="{ name: 'home'}">首页</router-link>
    <router-view></router-view>
    <textarea id="consolelog" disabled="disabled"></textarea>
  </div>
</template>

<script>
  export default {
    name: 'autocombyvue',
    data () {
      return {
        consolelog: { }
      }
    },
    mounted () {
      console.log('This Vue instance is mounted at element:', this.$el);
      console.log('From the element to the Vue instance:', document.getElementById('consolelog'));
    }
  }
</script>

<style>
  /* CSS */
  #consolelog {
    width: 100%;
    height: 200px;
  }
</style>

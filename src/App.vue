<template>
  <div id="app">
    <p>
      <router-link to="/Hello">Hello</router-link>
      <router-link to="/Todo">Go to Todo</router-link>
    </p>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
export default {
    name: 'App'
};
</script>

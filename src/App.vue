<template>
  <div id="app">
    <b-navbar type="info" variant="light" toggleable="md">
      <b-container>
        <b-navbar-brand to="/">Executor</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item :to="{name: 'approve'}" active-class="active">Approve</b-nav-item>
            <b-nav-item :to="{name: 'propose'}" active-class="active">Propose</b-nav-item>
            <b-nav-item :to="{name: 'history'}" active-class="active">History</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </b-container>
    </b-navbar>
    <b-container class="w-75">
      <router-view></router-view>
    </b-container>
  </div>
</template>

<script lang="ts">
export default {
  name: 'App'
};
</script>

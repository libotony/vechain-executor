<template>
    <div id="app">
        <b-navbar type="light" variant="light" toggleable="md">
            <b-container>
                <b-navbar-brand variant="success" to="/">Executor</b-navbar-brand>
                <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
                <b-collapse id="nav-collapse" is-nav>
                    <b-navbar-nav>
                        <b-nav-item :to="{name: 'overview'}" active-class="active">Overview</b-nav-item>
                        <b-nav-item :to="{name: 'operations'}" active-class="active">Operations</b-nav-item>
                        <b-nav-item :to="{name: 'history'}" active-class="active">History</b-nav-item>
                    </b-navbar-nav>
                </b-collapse>
            </b-container>
        </b-navbar>
        <b-container>
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
        </b-container>
    </div>
</template>

<script lang="ts">
export default {
    name: 'App'
};
</script>

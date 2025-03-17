<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { sidebarWidth } from './sidebar/state.js';

export default {
    setup() {
        const route = useRoute()
        const currentRouteName = computed(() => route.name)

        return { currentRouteName, sidebarWidth}
    }
}
</script>

<template>
    <div class="header-bar">
        <h1 :style="{ left: sidebarWidth}">{{ currentRouteName }}</h1>
    </div>
</template>

<style scoped>
.header-bar {
    height: 58px;
    background-color: #333333;
    margin: 0px;
    padding: 0px;
    top: 0;
    left: 0;

    position:fixed;

    width:100%;
}

.header-bar h1 {
    margin: 0;
    text-align: left;

    position: fixed;
    padding: 11px 15px;

    font-size: 28px;
    font-weight: 600;
    font-family: Arial, Helvetica, sans-serif;

    color: var(--sidebar-accent-color);

    transition: 0.3s ease;

}


</style>
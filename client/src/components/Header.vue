<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { sidebarWidth } from './sidebar/state.js';
import { socket_state } from '@/socket.js';

export default {
    setup() {
        const connectedString = computed(() => socket_state.connected ? 'connected' : 'disconnected')
        const connectedColor = computed(() => socket_state.connected ? '#00e396' : '#ff4560')
        const route = useRoute()
        const currentRouteName = computed(() => route.name)

        return { currentRouteName, sidebarWidth, connectedString, connectedColor}
    }
}
</script>

<template>
    <div class="header-bar">
        <h1 :style="{ left: sidebarWidth}">{{ currentRouteName }}</h1>
        <div class="server-status">
            Server Status: <span :style="{color: connectedColor}">{{ connectedString }}</span>
        </div>
    </div>
</template>

<style scoped>
.header-bar {
    height: 57.5px;
    background-color: var(--sidebar-bg-color);
    margin: 0px;
    padding: 0px;
    top: 0;
    left: 0;
    
    font-family: Arial, Helvetica, sans-serif;
    color: var(--sidebar-accent-color);

    border-bottom-width: 0.5px;
    border-bottom-style: solid;
    border-bottom-color: var(--sidebar-accent-color);
    box-shadow:  0px 1.5px 8px 0.2px rgba(1, 88, 138, 0.55);

    z-index: 1;

    position:fixed;

    display: flex;
    flex-direction: column;
    justify-content: center;

    width:100%;
}

.header-bar h1 {
    margin: 0;
    text-align: left;

    position: fixed;
    padding: 11px 15px;

    font-size: 28px;
    font-weight: 600;

    transition: 0.3s ease;

}

.server-status {
    text-align: right;
    padding-right: 20px;
    font-weight: 600;
    font-size: 16px;
}


</style>
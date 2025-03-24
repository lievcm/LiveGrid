<script>
import { collapsed, toggleSidebar, sidebarWidth } from './state'
import SidebarLink from './SidebarLink.vue';

export default {
    components: { SidebarLink },
    setup() {
        return { collapsed, toggleSidebar, sidebarWidth }
    }
}
</script>

<template>
    <div class="sidebar" :style="{ width: sidebarWidth}"
    @mouseover="collapsed=false" @mouseleave="collapsed=true">
        <h2>
            <span>L</span>
            <span class="anim" :style="{ width: `${collapsed ? 0 : 45}px`, opacity: `${collapsed ? 0 : 100}%`}">ive</span>
            <span>G</span>
            <span class="anim" :style="{ width: `${collapsed ? 0 : 45}px`, opacity: `${collapsed ? 0 : 100}%`}">rid</span>
        </h2>
        <SidebarLink :to="{name: 'Dashboard'}" icon="dashboard.svg">Dashboard</SidebarLink>
        <SidebarLink :to="{name: 'Monitor'}" icon="monitor.svg">Monitor</SidebarLink>
        <SidebarLink :to="{name: 'Historical'}" icon="database.svg">Historical</SidebarLink>
        <SidebarLink :to="{name: 'Settings'}" icon="settings.svg">Settings</SidebarLink>
    </div>
</template>

<style scoped>
.sidebar {
    color: white;
    background-color: var(--sidebar-bg-color);

    float: left;
    position: fixed;
    z-index: 2;
    top: 0;
    left: 0;
    bottom: 0;
    padding: 0px;

    transition: 0.3s ease;

    display: flex;
    flex-direction: column;

    overflow: hidden;

    font-family: "Helvetica", sans-serif;

    box-shadow:  1.5px 0px 8px 0.2px rgba(1, 88, 138, 0.55);
}

.accent-text {
    color: var(--sidebar-accent-color);
}

.sidebar h2 {
    align-items: center;
    text-align: center;
    padding-right: 2px;
    padding-left: 2px;
    padding-top: 10px;
    padding-bottom: 10px;
    margin: 0px;
    margin-bottom: 5px;
    font-size: 32px;

    background-color: var(--sidebar-accent-color);
}

.anim {
    overflow: hidden;
    display: inline-flex;
    transition: 0.3s ease;
}
</style>
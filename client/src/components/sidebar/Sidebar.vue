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
    <div class="sidebar" :style="{ width: sidebarWidth }" @mouseover="collapsed = false" @mouseleave="collapsed = true">
        <div class="logo">
            <img src="@/assets/logo.png" alt="Logo" />
            <div class="name" :style="{ opacity: collapsed ? 0 : 1 }">
                LiveGrid
            </div>
        </div>
        <SidebarLink :to="{ name: 'Dashboard' }" icon="dashboard.svg">Dashboard</SidebarLink>
        <SidebarLink :to="{ name: 'Monitor' }" icon="monitor.svg">Monitor</SidebarLink>
        <SidebarLink :to="{ name: 'Historical' }" icon="database.svg">Historical</SidebarLink>
        <SidebarLink :to="{ name: 'Settings' }" icon="settings.svg">Settings</SidebarLink>
        <div class="watermark" :style="{ opacity: collapsed ? 0 : 0.7 }">
            &copy; 2025 LiveGrid <br>
            <span style="font-size: 8px">All rights reserved</span>
        </div>
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

    box-shadow: 1.5px 0px 8px 0.2px rgba(1, 88, 138, 0.55);
}

.accent-text {
    color: var(--sidebar-accent-color);
}

.logo {
    height: 59px;
    width: calc(100% - 19px);
    background-color: var(--sidebar-accent-color);
    display: flex;
    justify-content: start;
    padding-left: 19px;
}

img {
    object-position: top left;
    height: 52px;
    margin-top: 3px;
}

.name {
    font-size: 24px;
    font-weight: 600;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;

    transition: 0.2s ease;
}

.watermark {
    font-size: 10px;
    position: absolute;
    bottom: 0px;
    padding-bottom: 10px;
    left: 0px;
    width: 200px;
    text-align: center;
    transition: 0.3s ease;
}
</style>
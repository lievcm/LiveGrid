<script>
import { computed } from 'vue'
import { collapsed } from './state'

export default {
    props: {
        to: { type: Object, required: true },
        icon: { type: String, required: true }
    },
    setup(props) {
        const iconURL = computed(() => new URL('../../assets/icons/' + props.icon, import.meta.url).href)
        return {collapsed, iconURL}
    }
}
</script>

<template>
    <router-link :to="to">
        <img :src="iconURL" alt="icon" class="icon" />
        <span :style="{opacity : `${collapsed ? 0 : 100}%`}" class="text">
            <slot></slot>
        </span>
    </router-link>
</template>

<style scoped>
a {
    display: flex;
    align-items: center;

    position: relative;
    font-weight: 400;
    user-select: none;

    margin: 0px;
    padding: 5px;
    padding-bottom: 9px;
    height: 40px;

    color: white;

    text-decoration: none;

    overflow: hidden;
}

a:hover {
    background-color: var(--sidebar-item-hover);
}

a.router-link-active {

    background-color: var(--sidebar-item-active);

    color: var(--sidebar-accent-color);
}

a.router-link-active img {
    filter: invert(72%) sepia(67%) saturate(2398%) hue-rotate(175deg) brightness(109%) contrast(102%);
}

.text {
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 4px;
    font-size: 18px;
    width: 100%;
    text-align: center;

    transition: 0.2s ease;

    font-weight: 600;

    overflow: hidden;
}

.icon {
    flex-shrink: 0;
    width: 35px;
    height: 35px;
    margin-right: 5px;
    margin-left: 10px;
}
</style>
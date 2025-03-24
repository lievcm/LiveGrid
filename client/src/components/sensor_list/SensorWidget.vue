<script>

import { getSensor } from '@/socket';
import { computed, ref } from 'vue';

export default {

    props: {
        origin_id: Number, required: true
    },
    setup (props) {
        const sens = computed(() => getSensor(props.origin_id))

        const active = ref(false)

        const toggleActive = () => {active.value = !active.value}

        const widgetHeight = computed(() => active.value ? 140 : 40)

        const nameColor = computed(() => sens.value.connected ? '#00e396' : '#ff4560')

        return { sens, active, toggleActive, widgetHeight, nameColor }
    }
}

</script>

<template>
    <div class="widget" :style="{height: `${widgetHeight}px`}" v-if="sens.name != 'ERR'" @click="toggleActive">
        <div class="header">
            <div class="name" :style="{color: nameColor}">
                {{ sens.name }}
            </div>
            <div class="dropdown-icon">
                <img src="@/assets/icons/plus.svg" alt="open" v-show="!active">
                <img src="@/assets/icons/minus.svg" alt="close" v-show="active">
            </div>
        </div>
        <div class="info">
            <div class="left">
                <div class="phases">
                    <p>Phase 1:</p>
                    <p>Phase 2:</p>
                    <p>Phase 3:</p>
                    <p>Neutral:</p>
                </div>
                <div class="readings">
                    <p><span class="reading">{{ sens.connected ? sens.phase1_rms.toFixed(3) : '--' }}</span>A</p>
                    <p><span class="reading">{{ sens.connected ? sens.phase2_rms.toFixed(3) : '--' }}</span>A</p>
                    <p><span class="reading">{{ sens.connected ? sens.phase3_rms.toFixed(3) : '--' }}</span>A</p>
                    <p><span class="reading">{{ sens.connected ? sens.neutral_rms.toFixed(3) : '--' }}</span>A</p>
                </div>
            </div>
            <div class="divider">

            </div>
            <div class="right">
                <p>Status: <span :style="{color: nameColor}">{{ sens.connected ? 'connected' : 'disconnected' }}</span></p>
                <p>ID: {{ sens.origin_id }}</p>
                <p>Type: {{ sens.type }}</p>
                <p>Location: <a href="#">view</a></p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.widget {
    overflow: hidden;
    width: 100%;

    transition: 0.3s ease;

    font-family: Arial, Helvetica, sans-serif;
    color: rgb(215, 215, 215);
}

.header {
    height: 38px;
    background-color: #3d3d3d;
    display: flex;
    border-top-width: 1px;
    border-top-color: #2c2c2c;
    border-top-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #2c2c2c;
    border-bottom-style: solid;
}

.header .name {
    flex: 1;
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding-left: 10px;
}

.header .dropdown-icon {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.header .dropdown-icon img {
    margin-bottom: 2px;
}

.info {
    height: 99px;
    background-color: #3a3a3a;
    display: flex;

    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: #2c2c2c;
}

.info .left {
    flex: 1.05;
    display: flex;
    padding-bottom: 0px;
}

.info .left .phases {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.info .left .phases p {
    margin-right: 0px;
    margin-left: 5px;
    margin-top: 3.5px;
    margin-bottom: 3.5px;
    font-size: 14px;
}

.info .left .readings {
    flex: 1.1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.info .left .readings p {
    margin-left: 0px;
    margin-top: 3.5px;
    margin-bottom: 3.5px;
    margin-right: 2px;
    font-size: 14px;
}

.info .left .readings .reading {
    background-color: #464646;
    text-align: center;
    width: 55px;
    display: inline-block;
    font-size: 13px;
    padding: 0;
    margin: 0;
    margin-right: 7px;
    border-radius: 3px;
    box-shadow: inset 1.1px 1.1px 5px 0px rgba(0, 54, 73, 0.603);
    color: #d1d1d1;
}

.info .divider {
    background-color: #2c2c2c;
    width: 2px;
}

.info .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.info .right p {
    margin-left: 9px;
    margin-right: 0px;
    margin-top: 2.5px;
    margin-bottom: 2.5px;
    font-size: 14px;
}

.info .right a {
    color: var(--sidebar-accent-color);
    text-decoration: none;
}

.info .right a:hover {
    color: #1046f5;
}


</style>
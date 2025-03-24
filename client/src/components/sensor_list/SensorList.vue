<script>
import { computed } from 'vue';
import SensorWidget from './SensorWidget.vue';
import { socket_state } from '@/socket';



export default {
    components: { SensorWidget },
    setup() {
        const sensor_data = computed(() => socket_state.sensor_data.sort((a, b) => a.origin_id - b.origin_id))

        return {sensor_data}
    }
}

</script>

<template>
    <div class="list-box">
        <div class="header">
            Sensors
        </div>
        <div class="divider"></div>
        <div class="widgets">
            <div class="list-end"></div>
            <SensorWidget v-for="sensor in sensor_data" :origin_id="sensor.origin_id"/>
            <div class="list-end"></div>
        </div>
    </div>
</template>

<style scoped>
.list-box{
    height: 100%;
    width: 100%;
    background-color: var(--sidebar-bg-color);
    font-family: Arial, Helvetica, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    border-width: 1px;
    border-color: var(--sidebar-accent-color);
    border-style: solid;
    border-radius: 8px;
    box-shadow:  0px 0px 18px 0.2px rgba(1, 88, 138, 0.55);
}

.header {
    height: 30px;
    color: var(--sidebar-accent-color);

    font-size: 21px;
    font-weight: 600;

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 10px;
}

.divider {
    height: 1px;
    background-color: var(--sidebar-accent-color);
}

.widgets {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
    background-color: var(--widget-bg-color);
}

.widgets .list-end {
    height: 1px;
    background-color: #2c2c2c;
}

</style>
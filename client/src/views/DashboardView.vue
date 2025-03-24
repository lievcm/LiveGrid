<script>
import OverviewGraphWidget from '@/components/OverviewGraphWidget.vue';
import OverviewMapWidget from '@/components/OverviewMapWidget.vue';
import SensorList from '@/components/sensor_list/SensorList.vue';
import { socket_state } from '@/socket';
import { computed, onMounted, ref } from 'vue';


export default {
    components: { SensorList, OverviewGraphWidget, OverviewMapWidget },
    setup() {
        const sensor_data = computed(() => socket_state.sensor_data);

        const map_selected = ref(false);

        const handleScroll = (event) => {
            if (event.wheelDelta > 0) {
                map_selected.value = false;
            }
            else {
                map_selected.value = true;
            }
        }

        const graphBottom = computed(() => map_selected.value ? '105%' : '18px');

        const mapTop = computed(() => map_selected.value ? '18px' : '105%');

        return { sensor_data, graphBottom, mapTop, handleScroll }
    }
}
</script>

<template>
    <div class="sensor-list">
        <SensorList />
    </div>
    <div class="scrolling-content" @wheel="handleScroll">
        <div class="graph" :style="{bottom: graphBottom}">
            <OverviewGraphWidget />
        </div>
        <div class="map" :style="{top: mapTop}">
            <OverviewMapWidget />
        </div>
    </div>
</template>

<style scoped>
.sensor-list {
    position: fixed;
    left: 85px;
    top: 78px;
    width: 300px;
    height: calc(100vh - 96px);
}

.scrolling-content {
    position: fixed;
    left: 385px;
    top: 60px;
    width: calc(100vw - 385px);
    height: calc(100vh - 60px);
    overflow: hidden;
}

.graph {
    position: absolute;
    height: calc(100vh - 96px);
    width: calc(100% - 40px);
    left: 20px;

    transition: bottom 0.8s ease;
}

.map {
    position: absolute;
    height: calc(100vh - 96px);
    width: calc(100% - 40px);
    left: 20px;
    top: 100%;

    transition: top 0.8s ease;
}
</style>
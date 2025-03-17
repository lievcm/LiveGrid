<script>
import Graph from '@/components/Graph.vue';
import { socket_state } from '@/socket';
import { computed } from 'vue';

export default {
    components: { Graph },
    setup() {
        const connected = computed(() => socket_state.connected)
        const sensor_data = computed(() => socket_state.sensor_data)

        return {connected, sensor_data}
    }
}

</script>

<template>
    <Graph v-for="sensor in sensor_data" :origin_id="sensor.origin_id" />
</template>
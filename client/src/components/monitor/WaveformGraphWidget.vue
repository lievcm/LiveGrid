<script setup>

import { getSensor, socket_state } from '@/socket';
import { computed, reactive, ref, watch } from 'vue';
import { handle_waveform_click } from './monitor_store';

const props = defineProps({
    origin_id: Number
})

const sens = computed(() => getSensor(props.origin_id))

const series = computed(() => [{name: 'Phase 1', data: sens.value.phase1_data},
                                {name: 'Phase 2', data: sens.value.phase2_data},
                                {name: 'Phase 3', data: sens.value.phase3_data},
                                {name: 'Neutral', data: sens.value.neutral_data}]);

const options = reactive({
    chart: {
        toolbar: {
            show: false
        },
        id:'test',
        forecolor: '#0090c9',
        zoom: {
            enabled: false
        },
        animations: {
            enabled: false
        },
        selection: {
            enabled: false
        }
    },
    xaxis: {
        type: 'numeric',
        tickAmount: 10,
        labels: {
            style: {
                colors: '#0090c9'
            }
        },
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        }
    },
    yaxis: {
        min: -30,
        max: 30,
        tickAmount: 7,
        decimalsInFloat: 3,
        labels: {
            style: {
                colors: '#0090c9'
            }
        }
    },
    legend: {
        show: false,
        position: 'top',
        fontSize: '14px',
        labels: {
            useSeriesColors: true
        },
        markers: {
            offsetX: -3,
            strokeWidth: 0,
        },
        height: 20
    },
    tooltip: {
        enabled: false
    },
    grid: {
        borderColor: '#0090c97f',
        xaxis: {
            lines: {
                show: true
            }
        },
        yaxis: {
            lines: {
                show: true
            }
        }
    },
    stroke: {
        width: 1.9,
    }
})
</script>

<template>
    <div class="graph-widget" >
        <div class="widget-header" @click="handle_waveform_click">Current Waveform</div>
        <div class="divider"></div>
        <div class="body">
            <div class="graph-wrapper">
                <apexchart type="line" height="100%" width="100%" :options="options" :series="series"></apexchart>
            </div>
        </div>
    </div>
</template>

<style scoped>
.graph-widget {
    background-color: var(--widget-bg-color);
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    font-family: Arial, Helvetica, sans-serif;
    overflow: hidden;

    border-width: 1px;
    border-color: var(--sidebar-accent-color);
    border-style: solid;
    border-radius: 8px;
    box-shadow:  0px 0px 18px 0.2px rgba(1, 88, 138, 0.55);
}

.graph-widget .widget-header {
    height: 30px;
    background-color: var(--sidebar-bg-color);
    color: var(--sidebar-accent-color);

    font-size: 17px;
    font-weight: 600;

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 10px;
}

.graph-widget .divider {
    background-color: var(--sidebar-accent-color);
    height: 1px;
}

.body {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.graph-wrapper {
    position: absolute;
    left: 10px;
    right: 8px;
    top: 0;
    bottom: 15px;

    transition: 0.5s ease;
}
</style>
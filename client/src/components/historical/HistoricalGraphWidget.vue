<script setup>

import { loading, phase1_select, phase2_select, phase3_select, neutral_select, series } from './historical_store';
import { toRaw } from 'vue';
import { computed } from 'vue';

const max = computed(() => {
    return Math.max(...series.value.map((ser) => Math.max(...ser.data.map((dat) => dat.y.constructor === Array ? dat.y[1] : dat.y))))
})

const min = computed(() => {
    return Math.min(...series.value.map((ser) => Math.min(...ser.data.map((dat) => dat.y.constructor === Array ? dat.y[0] : dat.y))))
})

const legendItems = computed(() => {
    let items = []
    if (phase1_select.value) {
        items.push("Phase 1")
    }
    if (phase2_select.value) {
        items.push("Phase 2")
    }
    if (phase3_select.value) {
        items.push("Phase 3")
    }
    if (neutral_select.value) {
        items.push("Neutral")
    }
    return items;
})

const legendColors = computed(() => {
    let colors = []
    if (phase1_select.value) {
        colors.push("#008ffb")
    }
    if (phase2_select.value) {
        colors.push("#00e396")
    }
    if (phase3_select.value) {
        colors.push("#feb019")
    }
    if (neutral_select.value) {
        colors.push("#ff4560")
    }
    return colors;
})

const options = computed(() => ({
    chart: {
        toolbar: {
            show: false
        },
        forecolor: '#0090c9',
        zoom: {
            enabled: false
        },
        animations: {
            enabled: false
        },
        selection: {
            enabled: false
        },
        width: '100%',
        height: '100%',
        type: 'rangeArea',
    },
    xaxis: {
        type: 'numeric',
        tickAmount: 6,
        labels: {
            style: {
                colors: '#0090c9'
            },
            formatter: function (value) {
                var timestamp = new Date(value)
                return `${timestamp.getMonth() + 1}/${timestamp.getDate()}/${timestamp.getFullYear()}  ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`
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
        tickAmount: 7,
        decimalsInFloat: 3,
        max: max.value + 0.3,
        min: min.value - 0.3,
        labels: {
            style: {
                colors: '#0090c9'
            }
        }
    },
    legend: {
        show: true,
        position: 'top',
        fontSize: '14px',
        customLegendItems: legendItems.value,
        labels: {
            colors: legendColors.value,
        },
        markers: {
            offsetX: -3,
            strokeWidth: 0,
            fillColors: legendColors.value,
        },
        height: 30,
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
        width: 1.9
    },
    dataLabels: {
        enabled: false
    },
    fill: {
        opacity: [0.24, 1, 0.24, 1, 0.24, 1, 0.24, 1]
    },
    stroke: {
        width: [0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1],
    }
}))

</script>

<template>
    <div class="widget">
        <div class="title">
            Graph
        </div>
        <div class="divider"></div>
        <div class="body">
            <apexchart :options="options" :series="toRaw(series)" width="100%" height="100%" v-show="!loading && series.length != 0"/>
        </div>
    </div>
</template>

<style scoped>
.widget {
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

.divider {
    height: 1px;
    background-color: var(--sidebar-accent-color);
}

.title {
    height: 30px;
    background-color: var(--sidebar-bg-color);
    color: var(--sidebar-accent-color);

    font-size: 19px;
    font-weight: 600;

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 10px;
}

.body {
    flex: 1;
    padding: 10px;
}
</style>
<script setup>
import { getSensor } from '@/socket';
import { computed, reactive, ref, watch, watchEffect } from 'vue';


const props = defineProps({
    origin_id: Number
})

const sens = computed(() => getSensor(props.origin_id))

const series = ref([{name: 'Phase 1', data: []},
                    {name: 'Phase 2', data: []},
                    {name: 'Phase 3', data: []},
                    {name: 'Neutral', data: []}])

watchEffect(() => {
    var update_date = new Date(sens.value.last_update_time)
        if(update_date.getFullYear() > 2000) {
            series.value[0].data.push([update_date.getTime(), sens.value.phase1_rms])
            series.value[1].data.push([update_date.getTime(), sens.value.phase2_rms])
            series.value[2].data.push([update_date.getTime(), sens.value.phase3_rms])
            series.value[3].data.push([update_date.getTime(), sens.value.neutral_rms])
            if (series.value[0].data.length > 44) {
                series.value.forEach((ser) => ser.data.shift())
            }
        }
})

watch(() => props.origin_id, (newVal, oldVal) => series.value.forEach((ser) => ser.data = []))

const options = reactive({
    chart: {
        toolbar: {
            show: false
        },
        id:'rms',
        forecolor: '#0090c9',
        zoom: {
            enabled: false
        },
        animations: {
            enabled: true
        },
        selection: {
            enabled: false
        },
        width: '100%',
        height: '100%'
    },
    xaxis: {
        type: 'numeric',
        range: 60000*2,
        tickAmount: 10,
        labels: {
            style: {
                colors: '#0090c9'
            },
            formatter: function (value) {
                var timestamp = new Date(value)
                return `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`
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
        max: 2,
        min: 0,
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
        width: 1.9
    }
})
</script>

<template>
    <div class="widget">
        <div class="title">
            RMS Readings
        </div>
        <div class="divider"></div>
        <div class="body">
            <div class="graph-wrapper">
                <apexchart type="line" height="100%" width="100%" :options="options" :series="series" />
            </div>
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

    font-size: 17px;
    font-weight: 600;

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 10px;
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
}

</style>
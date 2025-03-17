<script>

import { socket_state } from '@/socket';
import { computed, onMounted, reactive } from 'vue';

export default {
    props: {
        origin_id: Number
    },
    setup (props) {
        const series = computed(() => {
            for (var i = 0; i < socket_state.sensor_data.length; i++) {
                if (socket_state.sensor_data[i].origin_id == props.origin_id) {
                    return [{ name: '  Phase 1', data: socket_state.sensor_data[i].phase1_data },
                            { name: '  Phase 2', data: socket_state.sensor_data[i].phase2_data },
                            { name: '  Phase 3', data: socket_state.sensor_data[i].phase3_data },
                            { name: '  Neutral', data: socket_state.sensor_data[i].neutral_data }]
                }
            }
            return {}
        })
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
                min: 0,
                max: 4096,
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
                borderColor: '#0090c9',
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
        return { series, options }
    }
}
</script>

<template>
    <div class="graph-widget">
        <div class="widget-header">
            <img src="@/assets/icons/connected.svg" alt="conn.">
            <span>Sensor {{ this.origin_id }}</span>
        </div>
        <div class="divider"></div>
        <div class="graph-wrapper">
            <apexchart type="line" height="100%" width="100%" :options="options" :series="series"></apexchart>
        </div>
    </div>
</template>

<style scoped>
.graph-widget {
    background-color: #292929;
    height: 450px;
    width: 40vw;
    margin: 20px;
    border-radius: 15px;
    border-color: var(--sidebar-accent-color);
    border-style: solid;
    border-width: 3px;
    box-shadow: 1px 1px 6px 0px #000000;
}

.graph-widget .widget-header {
    text-align: center;
    margin: 0px;
    padding-top: 7px;
    padding-bottom: 10px;
}

.graph-widget .widget-header span {
    text-align: center;
    vertical-align: middle;
    display: inline-flex;
    color: #42f581;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 20px;
    margin: 0;
    padding: 0;
}

.graph-widget .widget-header img {
    height: 22px;
    width: 22px;
    display: inline-flex;
    margin: 0;
    margin-right: 5px;
    padding: 0;
    padding-bottom: 1px;
    vertical-align: middle;
}

.graph-widget .divider {
    margin:0;
    padding:0;
    background-color: var(--sidebar-accent-color);
    height: 1px;
}

.graph-wrapper {
    padding-top: 8px;
    padding-bottom: 15px;
    padding-left: 15px;
    padding-right: 17px;
    margin: 0px;
    height: 80%;
}
</style>
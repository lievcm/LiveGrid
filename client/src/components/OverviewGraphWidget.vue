<script>
import { socket_state } from '@/socket';
import { computed } from 'vue';


export default {
    setup() {
        const series = computed(() => {
            var phase1 = [], phase2 = [], phase3 = [], neutral = [];
            socket_state.sensor_data.sort((a, b) => a.origin_id - b.origin_id).forEach((sens) => {
                phase1.push(sens.phase1_rms);
                phase2.push(sens.phase2_rms);
                phase3.push(sens.phase3_rms);
                neutral.push(sens.neutral_rms);
            });
            return [{name: 'Phase 1', data: phase1},
                    {name: 'Phase 2', data: phase2},
                    {name: 'Phase 3', data: phase3},
                    {name: 'Neutral', data: neutral}]
        })

        const categories = computed(() => {
            var categs = [];
            socket_state.sensor_data.sort((a, b) => a.origin_id - b.origin_id).forEach((sens) => {
                categs.push(sens.name)
            })
            return categs;
        })

        const options = computed(() => {
            return {
                chart: {
                    toolbar: {
                        show: false
                    },
                    zoom: {
                        enabled: false
                    },
                    animations: {
                        enabled: false
                    },
                    type: 'bar',
                    selection: {
                        enabled: false
                    }
                },
                dataLabels: {
                    enabled: false
                },
                grid: {
                    borderColor: '#0090c9',
                },
                legend: {
                    position: 'top',
                    labels: {
                        useSeriesColors: true,
                    },
                    markers: {
                        shape: 'circle',
                        offsetX: -3,
                        strokeWidth: 0
                    },
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '60%',
                        borderRadius: 3,
                        borderRadiusApplication: 'end'
                    }
                },
                states: {
                    active: {
                        filter: {
                            type: 'none'
                        }
                    },
                    hover: {
                        filter: {
                            type: 'none'
                        }
                    }
                },
                xaxis: {
                    categories: categories.value,
                    labels: {
                        style: {
                            colors: '#0090c9'
                        }
                    },
                    axisBorder: {
                        color: '#0090c9'
                    },
                    axisTicks: {
                        color: '#0090c9'
                    },
                    tooltip: {
                        enabled: false
                    },
                    crosshairs: {
                        opacity: 0.2,
                        fill: {
                            type: 'solid',
                            color: '#0090c9'
                        }
                    }
                },
                yaxis: {
                    tickAmount: 6,
                    decimalsInFloat: 3,
                    labels: {
                        style: {
                            colors: '#0090c9'
                        }
                    },
                    title: {
                        text: 'RMS Load Current (A)',
                        offsetX: -4,
                        style: {
                            color: '#0090c9',
                            fontSize: '13px'
                        }
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                tooltip: {
                    shared: true,
                    intersect: false,
                    onDatasetHover: {
                        highlightDataSeries: false
                    },
                    y: {
                        formatter: function(value, {series, seriesIndex, dataPointInex, w}) {
                            return value.toFixed(4) + "A"
                        }
                    }
                }
            }
        })

        return { series, categories, options }
    }
}
</script>

<template>
    <div class="widget">
        <div class="title">
            Current Readings
        </div>
        <div class="divider"></div>
        <div class="body">
            <apexchart height="100%" width="100%" :options="options" :series="series" />
        </div>
    </div>
</template>

<style scoped>
:deep(.apexcharts-tooltip) {
    background-color: var(--widget-bg-color) !important;
    border-width: 0.5px !important;
    border-color: var(--sidebar-accent-color) !important;
    box-shadow:  0px 0px 10px 0.2px rgba(1, 88, 138, 0.55) !important;
    padding-bottom: 5px !important;
    align-items: center !important;
}

:deep(.apexcharts-tooltip-title) {
    color: var(--sidebar-accent-color) !important;
    background-color: var(--sidebar-bg-color) !important;
    border-bottom-width: 0.5px !important;
    border-bottom-color: var(--sidebar-accent-color) !important;
    font-weight: 600 !important;
    margin-bottom: 2px !important;
    width: 100% !important;
    text-align: center !important;
    font-size: 13px !important;
}

:deep(.apexcharts-tooltip-marker) {
    padding-bottom: 3px !important;
}

:deep(.apexcharts-tooltip-series-group) {
    padding-bottom: 0px !important;
}

:deep(.apexcharts-tooltip-series-group-0) {
    color: #008ffb !important;
}

:deep(.apexcharts-tooltip-series-group-1) {
    color: #00e396 !important;
}

:deep(.apexcharts-tooltip-series-group-2) {
    color: #feb019 !important;
}

:deep(.apexcharts-tooltip-series-group-3) {
    color: #ff4560 !important;
}

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

    font-size: 21px;
    font-weight: 600;

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 10px;
}

.body {
    flex: 1;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
    padding-bottom: 15px;
}
</style>
<script setup>
import { getSensor, socket_state } from '@/socket';
import { circle } from 'leaflet';
import { computed } from 'vue';

const props = defineProps({
    origin_id: Number
})

const sens = computed(() => getSensor(props.origin_id))

const phase2_transform = computed(() => `rotate(${-sens.value.delta_phase2.toFixed(2)}deg)`)
const phase3_transform = computed(() => `rotate(${-sens.value.delta_phase3.toFixed(2)}deg)`)

const phase2_dash_array = computed(() => `${-94.25*sens.value.delta_phase2 / 360 } 500`)
const phase3_dash_array = computed(() => `${-157*sens.value.delta_phase3 / 360 } 500`)


const max_rms = computed(() => Math.max(sens.value.phase1_rms, sens.value.phase2_rms, sens.value.phase3_rms))

const phase1_arrow_width = computed(() => 96*sens.value.phase1_rms/max_rms.value)
const phase2_arrow_width = computed(() => 96*sens.value.phase2_rms/max_rms.value)
const phase3_arrow_width = computed(() => 96*sens.value.phase3_rms/max_rms.value)

const css_p1_a_width = computed(() => `${phase1_arrow_width.value}px`)
const css_p2_a_width = computed(() => `${phase2_arrow_width.value}px`)
const css_p3_a_width = computed(() => `${phase3_arrow_width.value}px`)

function getLabelX(w, theta) {
    return (w+30)*Math.cos(Math.PI*(theta)/180)-20
}

function getLabelY(w, theta) {
    return (w+30)*Math.sin(Math.PI*(theta)/180)-12
}
</script>

<template>
    <div class="widget">
        <div class="title">
            Phasor Diagram
        </div>
        <div class="divider"></div>
        <div class="body">
            <div class="grid-line"></div>
            <div class="grid-line" style="transform: rotate(90deg);"></div>
            <div class="grid-line" style="transform: rotate(30deg);"></div>
            <div class="grid-line" style="transform: rotate(-30deg);"></div>
            <div class="grid-line" style="transform: rotate(60deg);"></div>
            <div class="grid-line" style="transform: rotate(-60deg);"></div>
            <svg width="100%" height="100%">
                <circle cx="50%" cy="50%" r="15px" class="phase2-arc" :stroke-dasharray="phase2_dash_array"/>
                <circle cx="50%" cy="50%" r="25px" class="phase3-arc" :stroke-dasharray="phase3_dash_array"/>
                <circle cx="50%" cy="50%" r="20px" class="grid-ring"/>
                <circle cx="50%" cy="50%" r="40px" class="grid-ring"/>
                <circle cx="50%" cy="50%" r="60px" class="grid-ring"/>
                <circle cx="50%" cy="50%" r="80px" class="grid-ring"/>
                <circle cx="50%" cy="50%" r="100px" class="grid-ring"/>
                <circle cx="50%" cy="50%" r="120px" class="grid-ring"/>
            </svg>

            <div class="arrow-container">
                <div class="phase1-arrow arrow" :style="{width: css_p1_a_width}"></div>
                <div class="phase2-arrow arrow" :style="{transform: phase2_transform, width: css_p2_a_width}"></div>
                <div class="phase3-arrow arrow" :style="{transform: phase3_transform, width: css_p3_a_width}"></div>
            </div>

            <div class="phase1-label label" :style="{
                left: `calc(50% + ${getLabelX(phase1_arrow_width, 0)}px)`,
                bottom: `calc(50% + ${getLabelY(phase1_arrow_width, 0)}px)`
            }">
                I: {{ sens.phase1_rms.toFixed(2) }}A <br>
                &Phi;: 0
            </div>
            <div class="phase2-label label" :style="{
                left: `calc(50% + ${getLabelX(phase2_arrow_width, sens.delta_phase2)}px)`,
                bottom: `calc(50% + ${getLabelY(phase2_arrow_width, sens.delta_phase2)}px)`
            }">
                I: {{ sens.phase2_rms.toFixed(2) }}A <br>
                &Phi;: {{ sens.delta_phase2.toFixed(2) }}&deg;
            </div>
            <div class="phase3-label label" :style="{
                left: `calc(50% + ${getLabelX(phase3_arrow_width, sens.delta_phase3)}px)`,
                bottom: `calc(50% + ${getLabelY(phase3_arrow_width, sens.delta_phase3)}px)`
            }">
                I: {{ sens.phase3_rms.toFixed(2) }}A <br>
                &Phi;: {{ sens.delta_phase3.toFixed(2) }}&deg;
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
}

svg {
    position: absolute;
}

.grid-ring {
    fill: none;
    stroke: var(--sidebar-accent-color);
    opacity: 0.5;
    stroke-width: 1px;
}

.grid-line {
    background-color: var(--sidebar-accent-color);
    opacity: 0.5;
    width: 240px;
    top: calc(50% - 0.5px);
    height: 1px;
    left: calc(50% - 120px);
    position: absolute;
}

.phase2-arc {
    fill: none;
    stroke: #00e396;
    stroke-width: 2px;
}

.phase3-arc {
    fill: none;
    stroke: #feb019;
    stroke-width: 2px;
}

.arrow-container {
    position: absolute;
    left: 50%;
    top: 0;
    height: 100%;
    width: 50%;

    display: flex;
    justify-content: left;
    align-items: center;
}

.arrow {
    height: 4px;
    position: absolute;
    transform-origin: left center;

    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
}

.arrow::after {
    content: "";
    position: absolute;
    right: -5px; /* Extends further */
    top: 50%;
    transform: translateY(-50%) rotate(0deg);
    width: 0;
    height: 0;
    border-left: 10px solid;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
}


.phase1-arrow {
    background-color: #008ffb;
}
.phase1-arrow::after {
    border-left-color: #008ffb;
}

.phase2-arrow {
    background-color: #00e396;
}
.phase2-arrow::after {
    border-left-color: #00e396;
}

.phase3-arrow {
    background-color: #feb019;
}
.phase3-arrow::after {
    border-left-color: #feb019;
}

.label {
    position: absolute;
    font-size: 11px;
    font-weight: 600;
}

.phase1-label {
    color: #008ffb;
}

.phase2-label {
    color: #00e396;
}

.phase3-label {
    color: #feb019;
}


</style>
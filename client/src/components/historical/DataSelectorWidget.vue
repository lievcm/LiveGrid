<script setup>
import { socket_state } from '@/socket';
import { start } from '@popperjs/core';
import { ref } from 'vue';
import { computed } from 'vue';
import TimePicker from './TimePicker.vue';
import { selected_sensor_id, selected_date_range, loadSeries,
        phase1_select, phase2_select, phase3_select, neutral_select } from './historical_store.js';

const sensor_data_processed = computed(() => socket_state.sensor_data.sort((a, b) => a.origin_id - b.origin_id))

function plotData() {
    if (!loadSeries()) {
        alert("Please select a sensor and a time range.");
        return;
    }
}

</script>

<template>
    <div class="widget">
        <div class="title">
            Data Series
        </div>
        <div class="divider"></div>
        <div class="body">
            <div class="sensor-select">
                <p>Sensor:</p>
                <v-select :options="sensor_data_processed" label="name" :searchable="false" :multiple="false"
                    placeholder="Select Sensor" :clearable="false" v-model="selected_sensor_id" :reduce="option => option.origin_id">
                    <template v-slot:selected-option="option">
                        <span :style="{ color: option.connected ? '#00e396' : '#ff4560', fontSize: '14px' }">{{
                            option.name }}</span>
                    </template>
                    <template v-slot:option="option">
                        <span :style="{ color: option.connected ? '#00e396' : '#ff4560' }">{{ option.name }}</span>
                    </template>
                </v-select>
            </div>
            <div class="divider"></div>
            <div class="time-period">
                <p>Time Range:</p>
                <VDatePicker mode="date" v-model.range="selected_date_range" style="width: 100%; height:100%;" borderless
                    transparent />
                <div class="divider" style="opacity: 0.5;"></div>
                <div style="display: flex; flex-direction: row; flex-basis: 80px; flex-shrink: 0;">
                    <TimePicker v-model="selected_date_range.start" style="flex: 1; margin: 0px 5px;" />
                    <div style="width: 1px; background-color: var(--sidebar-accent-color); opacity: 0.5;"></div>
                    <TimePicker v-model="selected_date_range.end" style="flex: 1; margin: 0px 5px;" />
                </div>
            </div>
            <div class="divider"></div>
            <div class="series-select">
                <p>Series Options:</p>
                <div style="height: 65px; display:flex;">
                    <div style="flex: 1; display:flex; flex-direction: column; justify-content: center;">
                        <label class="container">Phase 1:
                            <input type="checkbox" id="phase1" name="phase1" v-model="phase1_select"/>
                            <span class="checkmark"></span>
                        </label>
                        <label class="container">Phase 2:
                            <input type="checkbox" id="phase2" name="phase2" v-model="phase2_select"/>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div style="flex: 1; display:flex; flex-direction: column; justify-content: center;">
                        <label class="container">Phase 3:
                            <input type="checkbox" id="phase3" name="phase3" v-model="phase3_select"/>
                            <span class="checkmark"></span>
                        </label>
                        <label class="container">Neutral:
                            <input type="checkbox" id="neutral" name="neutral" v-model="neutral_select"/>
                            <span class="checkmark" style="margin-left: 7px;"></span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="divider"></div>
            <div class="start">
                <button type="button" @click="plotData">Plot Data</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/*#region Select-Style*/
:deep(.vs__search) {
    caret-color: transparent;
    color: var(--sidebar-accent-color) !important;
    font-size: 14px !important;
}

:deep(.vs__open-indicator) {
    stroke: var(--sidebar-accent-color);
    fill: var(--sidebar-accent-color);
}

:deep(.vs__dropdown-menu) {
    background-color: var(--sidebar-bg-color);
    border-radius: 5px;
    border: 1px solid var(--sidebar-accent-color);
    box-shadow: 0px 0px 18px 0.2px rgba(1, 88, 138, 0.55);
    margin-top: 3px;
    padding: 0px;
}

:deep(.vs__dropdown-option) {
    padding: 5px;
    margin: 0px;
    font-size: 14px;
}

:deep(.vs__dropdown-option--selected) {
    background-color: var(--sidebar-item-active);
}

:deep(.vs__dropdown-option:hover) {
    background-color: var(--sidebar-item-hover);
}

:deep(.vs__dropdown-option--highlight) {
    background-color: var(--sidebar-item-hover);
}

:deep(.vs__selected) {
    opacity: 100% !important;
}

/*#endregion*/

/*#region Widget-Layout*/
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
    box-shadow: 0px 0px 18px 0.2px rgba(1, 88, 138, 0.55);
}

.divider {
    flex-basis: 1px;
    flex-shrink: 0;
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
    display: flex;
    flex-direction: column;
    overflow: auto;
}

/*#endregion*/

/*#region Sensor-Select*/
.sensor-select {
    color: var(--sidebar-accent-color);
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.sensor-select p {
    margin-top: 8px;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 15px;
}

.sensor-select .v-select {
    background-color: var(--sidebar-bg-color);
    border-radius: 5px;
    border: 1px solid var(--sidebar-accent-color);
    margin-bottom: 10px;
}

/*#endregion*/

/*#region Time-Period*/
.time-period {
    color: var(--sidebar-accent-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.time-period p {
    margin-top: 8px;
    margin-bottom: 8px;
    padding-left: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 15px;
}

:deep(.vc-arrow) {
    border: 1px solid var(--sidebar-accent-color) !important;
    background-color: var(--sidebar-bg-color) !important;
    color: var(--sidebar-accent-color) !important;
    height: 25px !important;
}

:deep(.vc-header) {
    margin-bottom: 5px !important;
    height: 30px !important;
}

:deep(.vc-title) {
    border: 1px solid var(--sidebar-accent-color) !important;
    background-color: var(--sidebar-bg-color) !important;
    color: var(--sidebar-accent-color) !important;
    font-size: 12px !important;
    line-height: 25px !important;
}

:deep(.vc-weekday) {
    color: var(--sidebar-accent-color) !important;
}

:deep(.vc-day) {
    color: rgb(255, 255, 255) !important;
    opacity: 0.6 !important;
    min-height: 26px !important;
}

:deep(.vc-day-content) {
    font-size: 11px !important;
    height: 24px !important;
    width: 24px !important;
    line-height: 24px !important;
}

:deep(.vc-highlight) {
    width: 22px;
    height: 22px;
}

:deep(.vc-highlight-bg-solid) {
    background-color: var(--sidebar-accent-color);
}


:deep(.vc-popover-content) {
    background-color: var(--widget-bg-color) !important;
    border: 1px solid var(--sidebar-accent-color) !important;
    box-shadow: 0px 0px 18px 0.2px rgba(1, 88, 138, 0.55) !important;
    border-radius: 5px !important;
}

:deep(.vc-nav-title) {
    border: 1px solid var(--sidebar-accent-color) !important;
    background-color: var(--sidebar-bg-color) !important;
    color: var(--sidebar-accent-color) !important;
    font-size: 12px !important;
}

:deep(.vc-nav-arrow) {
    border: 1px solid var(--sidebar-accent-color) !important;
    background-color: var(--sidebar-bg-color) !important;
    color: var(--sidebar-accent-color) !important;
}

:deep(.vc-nav-item) {
    border: 1px solid var(--sidebar-accent-color) !important;
    background-color: var(--sidebar-bg-color) !important;
    color: var(--sidebar-accent-color) !important;
    font-size: 11px !important;
}

:deep(.vc-focus:focus-within) {
    box-shadow: none !important;
}

:deep(.vc-nav-items) {
    grid-column-gap: 4px !important;
    grid-row-gap: 4px !important;
    margin-top: 4px !important;
}

:deep(.vc-highlight-bg-outline) {
    border-color: var(--sidebar-accent-color) !important;
    border-width: 1.5px !important;
    background-color: rgb(75, 75, 75) !important;
}

:deep(.vc-highlight-bg-light) {
    background-color: var(--sidebar-bg-color) !important;
    border-top: 1px solid var(--sidebar-accent-color) !important;
    border-bottom: 1px solid var(--sidebar-accent-color) !important;
}

:deep(.vc-highlight-content-outline) {
    color: var(--sidebar-accent-color) !important;
}

:deep(.vc-highlight-content-light) {
    color: var(--sidebar-accent-color) !important;
}

:deep(.vc-day-content:hover) {
    background-color: #22222259 !important;
}

/*#endregion*/

/*#region Series-Select*/
.series-select {
    color: var(--sidebar-accent-color);
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.series-select p {
    margin-top: 8px;
    margin-bottom: 6px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 15px;
}

.container{
    text-align: center;
    padding-right: 13px;
    font-size: 12px;
    color: var(--sidebar-accent-color);
    margin: 2px 0px;
    position: relative;
    cursor: pointer;
}

.container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.checkmark {
    position: absolute;
    margin-left: 5px;
    height: 13px;
    width: 13px;
    background-color: #2d2d2d;
    border: 1px solid var(--sidebar-accent-color);
    border-radius: 2px;
    box-shadow: inset 0px 0px 3px 0.2px rgba(1, 88, 138, 0.55);
}

.container:hover input ~ .checkmark {
    background-color: var(--sidebar-item-hover);
}

.container input:checked ~ .checkmark {
    background-color: var(--sidebar-bg-color);
}

.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

.container input:checked ~ .checkmark:after {
    display: block;
}

.container .checkmark:after {
    left: 4px;
    top: 1px;
    width: 3px;
    height: 7px;
    border: solid #00e396;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}
/*#endregion*/

/*#region Start-Button*/
.start {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-basis: 60px;
    flex-grow: 1;
    flex-shrink: 0;
}

.start button {
    background-color: var(--sidebar-bg-color);
    color: #00e396;
    border: solid 1px var(--sidebar-accent-color);
    border-radius: 5px;
    padding: 8px 20px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
}

.start button:hover {
    background-color: var(--sidebar-item-hover);
}
/*#endregion*/
</style>
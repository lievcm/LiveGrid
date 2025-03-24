<script setup>
import { getSensor, socket_state } from '@/socket';
import { computed, onMounted, ref, watch } from 'vue';
import WaveformGraphWidget from '@/components/monitor/WaveformGraphWidget.vue';
import PhasorGraphWidget from '@/components/monitor/PhasorGraphWidget.vue';
import RmsGraphWidget from '@/components/monitor/RmsGraphWidget.vue';

const sensor_data_processed = computed(() => socket_state.sensor_data.sort((a, b) => a.origin_id - b.origin_id).filter((sens) => sens.connected));

const selected_oid = ref(null)

const sens = computed(() => getSensor(selected_oid.value))

const last_update_time_string = computed(() =>  {
    var time = new Date(sens.value.last_update_time)
    return time.toLocaleString();
})

const rms_active = ref(true)
const waveform_active = ref(true)
const handle_rms_click = () => {
    // had to write a truth table for this one lmfaooo
    rms_active.value = true;
    waveform_active.value = !waveform_active.value;
}
const handle_waveform_click = () => {
    waveform_active.value = true;
    rms_active.value = !rms_active.value;
}


watch(sensor_data_processed, (newVal, oldVal) => {
    if (selected_oid.value == null && sensor_data_processed.value.length > 0) {
        selected_oid.value = sensor_data_processed.value[0].origin_id; // set selected to first val if not already done
    }
})

onMounted(() => {
    if (sensor_data_processed.value.length > 0) {
        selected_oid.value = sensor_data_processed.value[0].origin_id;
    }
})
</script>

<template>
    <div class="wrapper">
        <div class="left">
            <div class="sensor-info">
                <div class="widget">
                    <div class="title">
                        Sensor Info
                    </div>
                    <div class="divider"></div>
                    <div class="body">
                        <div class="info">
                            <div class="sensor-name">
                                Name: 
                                <select v-model="selected_oid">
                                    <option v-for="sen in sensor_data_processed" :value="sen.origin_id">{{ sen.name }}</option>
                                </select>
                            </div>
                            <div class="sensor-type-id">
                                <div>Type: {{ sens.type }}</div>
                                <div>ID: {{ sens.origin_id }}</div>
                            </div>
                            <div class="sensor-location">
                                Location: {{ sens.location }}
                            </div>
                            <div class="sensor-last-message">
                                Last Message: {{ last_update_time_string }}
                            </div>
                        </div>
                        <div class="divider"></div>
                        <div class="readings">
                            <div class="rms-readings">
                                <div class="heading">RMS Data</div>
                                <div class="readings-wrapper">
                                    <div class="names">
                                        <p class="phase1">I<sub>P1</sub>:</p>
                                        <p class="phase2">I<sub>P2</sub>:</p>
                                        <p class="phase3">I<sub>P3</sub>:</p>
                                        <p class="neutral">I<sub>N</sub>:</p>
                                    </div>
                                    <div class="values">
                                        <p><span class="reading phase1">{{ sens.connected ? sens.phase1_rms.toFixed(5) + 'A' : '--' }}</span></p>
                                        <p><span class="reading phase2">{{ sens.connected ? sens.phase2_rms.toFixed(5) + 'A' : '--' }}</span></p>
                                        <p><span class="reading phase3">{{ sens.connected ? sens.phase3_rms.toFixed(5) + 'A' : '--' }}</span></p>
                                        <p><span class="reading neutral">{{ sens.connected ? sens.neutral_rms.toFixed(5) + 'A' : '--' }}</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="v-divider"></div>
                            <div class="phase-readings">
                                <div class="heading">Phase Deltas</div>
                                <div class="readings-wrapper">
                                    <div class="names">
                                        <p class="phase1">&Phi;<sub>P1</sub>:</p>
                                        <p class="phase2">&Phi;<sub>P2</sub>:</p>
                                        <p class="phase3">&Phi;<sub>P3</sub>:</p>
                                    </div>
                                    <div class="values">
                                        <p><span class="reading phase1">{{ sens.connected ? Number(0).toFixed(3) + '&deg;' : '--' }}</span></p>
                                        <p><span class="reading phase2">{{ sens.connected ? sens.delta_phase2.toFixed(3) + '&deg;' : '--' }}</span></p>
                                        <p><span class="reading phase3">{{ sens.connected ? sens.delta_phase3.toFixed(3) + '&deg;' : '--' }}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="phase-graph">
                <PhasorGraphWidget :origin_id="selected_oid" />
            </div>
        </div>
        <div class="right">
            <div class="rms-graph" :style="{flexGrow: Number(rms_active)}" @click="handle_rms_click">
                <RmsGraphWidget :origin_id="selected_oid" />
            </div>
            <div class="waveform-graph" :style="{flexGrow: Number(waveform_active)}" @click="handle_waveform_click">
                <WaveformGraphWidget :origin_id="selected_oid" />
            </div>
        </div>
    </div>
</template>

<style scoped>

.wrapper {
    position: fixed;
    left: 65px;
    top: 58px;
    width: calc(100vw - 85px); /* added 20 to 65 & 58 to account for 10px padding per side*/
    height: calc(100vh - 78px);/* dont ask my why padding increases width */
    display: flex;
    padding: 10px;
}

.left {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.sensor-info {
    flex: 1;
    margin: 10px;
}

.phase-graph {
    flex-basis: 320px;
    flex-grow: 0.1;
    flex-shrink: 0;
    margin: 10px;
}

.right {
    flex: 2.7;
    display: flex;
    flex-direction: column;
}

.rms-graph {
    margin: 10px;
    flex-basis: 40px;

    transition: 0.5s ease;
}

.waveform-graph {
    flex-basis: 40px;
    margin: 10px;

    transition: 0.5s ease;
}

.widget {
    background-color: var(--widget-bg-color);
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    font-family: Arial, Helvetica, sans-serif;
    overflow: hidden;

    color: var(--sidebar-accent-color);

    border-width: 1px;
    border-color: var(--sidebar-accent-color);
    border-style: solid;
    border-radius: 8px;
    box-shadow:  0px 0px 18px 0.2px rgba(1, 88, 138, 0.55);
}

.widget .divider {
    height: 1px;
    background-color: var(--sidebar-accent-color);
}

.widget .title {
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

.widget .body {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.widget .body .info {
    flex: 1.1;
    display: flex;
    flex-direction: column;
    font-size: 2vh;
    padding: 5px;
}

.widget .sensor-name {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.widget .sensor-name select{
    background-color: var(--sidebar-bg-color);
    border-width: 1px;
    border-radius: 3px;
    border-style: solid;
    border-color: var(--sidebar-accent-color);
    color: #00e396;
    margin-left: 10px;
    font-size: 1.4vh;
    padding: 3px;
}

.widget .sensor-name option{
    appearance: none;
    font-size: 1.3vh;
    text-align: center;
    padding-right: 2px;
}


.widget .sensor-type-id {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.widget .sensor-type-id div {
    margin: 0 5%;
}

.widget .sensor-location {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

}
.widget .sensor-last-message {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.widget .body .readings {
    flex: 1;
    display: flex;
    font-size: 2vh;
}

.widget .rms-readings {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.widget .v-divider {
    width: 1px;
    background-color: var(--sidebar-accent-color);
    opacity: 0.5;
}

.widget .body .divider {
    opacity: 0.5;
}

.widget .phase-readings {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.widget .heading {
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8vh;
    font-weight: 600;
}

.widget .readings-wrapper {
    flex: 1;
    display: flex;
    padding-bottom: 5%;
    padding-top: 5%;
}

.widget .names {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.widget .names p {
    margin: 0px;
    margin-left: 15%;
    flex: 1;
    display: flex;
    align-items: center;
}

.widget .values{
    flex: 2.5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.widget .values p {
    flex: 1;
    margin: 0px;
    display: flex;
    align-items: center;
}

.widget .values .reading {
    background-color: #242424;
    text-align: center;
    width: 85px;
    display: inline-block;
    font-size: 13px;
    padding: 2px;
    margin: 0;
    margin-right: 7px;
    border-radius: 3px;
    box-shadow: inset 0px 0px 5px 0px rgba(0, 0, 0, 0.55);
}

.widget sub {
    margin-top: 11px;
    font-size: 9px;
}

.phase1 {
    color: #008ffb;
}

.phase2 {
    color: #00e396;
}

.phase3 {
    color: #feb019;
}

.neutral {
    color: #ff4560;
}

</style>
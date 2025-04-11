import { getSensor } from "@/socket";
import { computed, watch } from "vue";
import { ref, watchEffect } from "vue";

export const selected_oid = ref(null);

export const rms_active = ref(true);
export const waveform_active = ref(true);
export const handle_rms_click = () => {
    // had to write a truth table for this one lmfaooo
    rms_active.value = true;
    waveform_active.value = !waveform_active.value;
} 
export const handle_waveform_click = () => {
    waveform_active.value = true;
    rms_active.value = !rms_active.value;
}

export const series = ref([{name: 'Phase 1', data: []},
                           {name: 'Phase 2', data: []},
                           {name: 'Phase 3', data: []},
                           {name: 'Neutral', data: []}])

watch(() => selected_oid.value, (newVal, oldVal) => series.value.forEach((ser) => ser.data = []))

import { ref } from "vue";

export const selected_sensor_id = ref(null)

export const selected_date_range = ref({ start: new Date(), end: new Date() })

export const phase1_select = ref(true)
export const phase2_select = ref(true)
export const phase3_select = ref(true)
export const neutral_select = ref(true)

export const series = ref([])

export const loading = ref(false)

export function loadSeries() {
    loading.value = true;
    var range_size = selected_date_range.value.end - selected_date_range.value.start;
    if (range_size <= 0 || selected_sensor_id.value == null || 
        !(phase1_select.value || phase2_select.value || phase3_select.value || neutral_select.value)) {
        return false
    }
    series.value = []
    if (phase1_select.value) {
        series.value.push({ name: "Phase 1 Range", type: 'rangeArea', data: [], color: '#008ffb' })
        series.value.push({ name: "Phase 1 Average", type: 'line', data: [], color: '#008ffb' })
    }
    if (phase2_select.value) {
        series.value.push({ name: "Phase 2 Range", type: 'rangeArea', data: [], color: '#00e396' })
        series.value.push({ name: "Phase 2 Average", type: 'line', data: [], color: '#00e396' })
    }
    if (phase3_select.value) {
        series.value.push({ name: "Phase 3 Range", type: 'rangeArea', data: [], color: '#feb019' })
        series.value.push({ name: "Phase 3 Average", type: 'line', data: [], color: '#feb019' })
    }
    if (neutral_select.value) {
        series.value.push({ name: "Neutral Range", type: 'rangeArea', data: [], color: '#ff4560' })
        series.value.push({ name: "Neutral Average", type: 'line', data: [], color: '#ff4560' })
    }
    if (range_size < 1000 * 60 * 5) { // use 5 minutes as threshold for seconds data
        fetch(`http://localhost:3000/api/sensor_data/seconds/${selected_sensor_id.value}/${selected_date_range.value.start.valueOf()}-${selected_date_range.value.end.valueOf()}`).then((response) => {
            if (response.ok) {
                response.json().then((data) => data.forEach((item) => {
                    let i = 0;
                    if (phase1_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.time).valueOf(),
                            y: [item.phase1_rms, item.phase1_rms]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.time).valueOf(),
                            y: item.phase1_rms
                        })
                        i++;
                    }
                    if (phase2_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.time).valueOf(),
                            y: [item.phase2_rms, item.phase2_rms]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.time).valueOf(),
                            y: item.phase2_rms
                        })
                        i++;
                    }
                    if (phase3_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.time).valueOf(),
                            y: [item.phase3_rms, item.phase3_rms]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.time).valueOf(),
                            y: item.phase3_rms
                        })
                        i++;
                    }
                    if (neutral_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.time).valueOf(),
                            y: [item.neutral_rms, item.neutral_rms]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.time).valueOf(),
                            y: item.neutral_rms
                        })
                        i++;
                    }
                }))
            }
            else {
                return false
            }
        }).then(() => loading.value = false)
    }
    else if (range_size < 1000 * 60 * 60 * 5) { // use 5 hours as threshold for minutes data    
        fetch(`http://localhost:3000/api/sensor_data/minutes/${selected_sensor_id.value}/${selected_date_range.value.start.valueOf()}-${selected_date_range.value.end.valueOf()}`).then((response) => {
            if (response.ok) {
                response.json().then((data) => data.forEach((item) => {
                    let i = 0;
                    if (phase1_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.minute).valueOf(),
                            y: [item.phase1_rms_min, item.phase1_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.minute).valueOf(),
                            y: item.phase1_rms_avg
                        })
                        i++;
                    }
                    if (phase2_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.minute).valueOf(),
                            y: [item.phase2_rms_min, item.phase2_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.minute).valueOf(),
                            y: item.phase2_rms_avg
                        })
                        i++;
                    }
                    if (phase3_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.minute).valueOf(),
                            y: [item.phase3_rms_min, item.phase3_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.minute).valueOf(),
                            y: item.phase3_rms_avg
                        })
                        i++;
                    }
                    if (neutral_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.minute).valueOf(),
                            y: [item.neutral_rms_min, item.neutral_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.minute).valueOf(),
                            y: item.neutral_rms_avg
                        })
                        i++;
                    }
                }))
            }
            else {
                return false
            }
        }).then(() => loading.value = false)
    }
    else if (range_size < 1000 * 60 * 60 * 24 * 5) { // use 5 days as threshold for hours data
        fetch(`http://localhost:3000/api/sensor_data/hours/${selected_sensor_id.value}/${selected_date_range.value.start.valueOf()}-${selected_date_range.value.end.valueOf()}`).then((response) => {
            if (response.ok) {
                response.json().then((data) => data.forEach((item) => {
                    let i = 0;
                    if (phase1_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.hour).valueOf(),
                            y: [item.phase1_rms_min, item.phase1_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.hour).valueOf(),
                            y: item.phase1_rms_avg
                        })
                        i++;
                    }
                    if (phase2_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.hour).valueOf(),
                            y: [item.phase2_rms_min, item.phase2_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.hour).valueOf(),
                            y: item.phase2_rms_avg
                        })
                        i++;
                    }
                    if (phase3_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.hour).valueOf(),
                            y: [item.phase3_rms_min, item.phase3_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.hour).valueOf(),
                            y: item.phase3_rms_avg
                        })
                        i++;
                    }
                    if (neutral_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.hour).valueOf(),
                            y: [item.neutral_rms_min, item.neutral_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.hour).valueOf(),
                            y: item.neutral_rms_avg
                        })
                        i++;
                    }
                }))
            }
            else {
                return false
            }
        }).then(() => loading.value = false)
    }
    else { // use days data
        fetch(`http://localhost:3000/api/sensor_data/days/${selected_sensor_id.value}/${selected_date_range.value.start.valueOf()}-${selected_date_range.value.end.valueOf()}`).then((response) => {
            if (response.ok) {
                response.json().then((data) => data.forEach((item) => {
                    let i = 0;
                    if (phase1_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.day).valueOf(),
                            y: [item.phase1_rms_min, item.phase1_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.day).valueOf(),
                            y: item.phase1_rms_avg
                        })
                        i++;
                    }
                    if (phase2_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.day).valueOf(),
                            y: [item.phase2_rms_min, item.phase2_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.day).valueOf(),
                            y: item.phase2_rms_avg
                        })
                        i++;
                    }
                    if (phase3_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.day).valueOf(),
                            y: [item.phase3_rms_min, item.phase3_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.day).valueOf(),
                            y: item.phase3_rms_avg
                        })
                        i++;
                    }
                    if (neutral_select.value) {
                        series.value[i].data.push({
                            x: new Date(item.day).valueOf(),
                            y: [item.neutral_rms_min, item.neutral_rms_max]
                        })
                        i++;
                        series.value[i].data.push({
                            x: new Date(item.day).valueOf(),
                            y: item.neutral_rms_avg
                        })
                        i++;
                    }
                }))
            }
            else {
                return false
            }
        }).then(() => loading.value = false)
    }
    return true
}
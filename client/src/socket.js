import { computed, reactive } from "vue";
import { io } from "socket.io-client";
import router from "./router";

export const socket_state = reactive({
    connected: false,
    sensor_data: []
})

export function getSensor(id) {
    var sen = socket_state.sensor_data.filter((sens) => sens.origin_id == id)
    if (sen.length == 0) {
        return {
            origin_id: -1,
            name: "ERR",
            location: "ERR",
            type: "ERR",
            connected: false,
            last_update_time: 0,
            phase1_data: [],
            phase2_data: [],
            phase3_data: [],
            neutral_data: [],
            trigger_index: 0,
            delta_phase2: 0,
            delta_phase3: 0,
            phase1_rms: 0.0,
            phase2_rms: 0.0,
            phase3_rms: 0.0,
            neutral_rms: 0.0
        }
    }
    else {
        return sen[0]
    }
}

const url = "http://localhost:3000"

export const socket = io(url);

socket.on("connect", () => {
    socket_state.connected = true;
})

socket.on("disconnect", () => {socket_state.connected = false;})

socket.on("sensor_data", (msg) => {
    if(router.currentRoute.value.name == "Monitor") {
        for (var i = 0; i < socket_state.sensor_data.length; i++) {
            if (socket_state.sensor_data[i].origin_id == msg.origin_id) {
                socket_state.sensor_data[i].phase1_data = msg.phase1_data;
                socket_state.sensor_data[i].phase2_data = msg.phase2_data;
                socket_state.sensor_data[i].phase3_data = msg.phase3_data;
                socket_state.sensor_data[i].neutral_data = msg.neutral_data;
                socket_state.sensor_data[i].trigger_index = msg.trigger_index;
                socket_state.sensor_data[i].delta_phase2 = msg.delta_phase2;
                socket_state.sensor_data[i].delta_phase3 = msg.delta_phase3;
                break;
            }
        }
    }
})

socket.on("processed_sensor_data", (msg) => {
    socket_state.sensor_data.forEach(sensor => {
        if(sensor.origin_id == msg.origin_id) {
            sensor.phase1_rms = msg.phase1_rms;
            sensor.phase2_rms = msg.phase2_rms;
            sensor.phase3_rms = msg.phase3_rms;
            sensor.neutral_rms = msg.neutral_rms;
            sensor.last_update_time = msg.time;
        }
    })
})

socket.on("sensors", msg => {
    msg.forEach(sensor => {
        var found = false;
        socket_state.sensor_data.forEach(sens => {
            if (sens.origin_id == sensor.id) {
                sens.connected = sensor.connected;
                found = true;
            }
        })
        if (!found) {
            var newSensor = {
                origin_id: sensor.id,
                name: sensor.name,
                location: sensor.location,
                type: sensor.type,
                connected: sensor.connected,
                last_update_time: 0,
                phase1_data: [],
                phase2_data: [],
                phase3_data: [],
                neutral_data: [],
                trigger_index: 0,
                delta_phase2: 0,
                delta_phase3: 0,
                phase1_rms: 0.0,
                phase2_rms: 0.0,
                phase3_rms: 0.0,
                neutral_rms: 0.0
            }
            socket_state.sensor_data.push(newSensor)
        }
    })
})


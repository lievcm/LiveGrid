import { reactive } from "vue";
import { io } from "socket.io-client";

export const socket_state = reactive({
    connected: false,
    sensor_data: []
})

const url = "http://localhost:3000"

export const socket = io(url);

socket.on("connect", () => {
    socket_state.connected = true;
})

socket.on("disconnect", () => {socket_state.connected = false;})

socket.on("sensor_data", (msg) => {
    var sens_found = false;
    for (var i = 0; i < socket_state.sensor_data.length; i++) {
        if (socket_state.sensor_data[i].origin_id == msg.origin_id) {
            sens_found = true
            switch (msg.phase) {
                case 0:
                    socket_state.sensor_data[i].phase1_data = msg.data
                    break;
                case 1:
                    socket_state.sensor_data[i].phase2_data = msg.data
                    break;
                case 2:
                    socket_state.sensor_data[i].phase3_data = msg.data
                    break;
                case 3:
                    socket_state.sensor_data[i].neutral_data = msg.data
                    break;
                default:
                    break;
            }
            break;
        }
    }
    if (!sens_found) {
        let sensor = {}
        sensor.origin_id = msg.origin_id;
        switch (msg.phase) {
            case 0:
                sensor.phase1_data = msg.data
                break;
            case 1:
                sensor.phase2_data = msg.data
                break;
            case 2:
                sensor.phase3_data = msg.data
                break;
            case 3:
                sensor.neutral_data = msg.data
                break;
            default:
                break;
        }
        socket_state.sensor_data.push(sensor)
    }
})


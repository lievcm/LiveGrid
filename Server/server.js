//----------------Imports & Configuration-----------------
// Path
const path = require('path');

// Server configuration
const user_config = require('./user_config.json');

// Web server (Express & friends lol)
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const server = require('http').createServer(app);

app.use(bodyParser.json());

corsOpts = {
    origin: "http://localhost:5173"
}

app.use(cors(corsOpts));

// mqtt (data streaming from sensor)
const mqtt = require('mqtt');
client = mqtt.connect(user_config.mqtt_options);

// Socket.io (data streaming to client)
const { Server } = require('socket.io');
const io = new Server(server, {cors : corsOpts});

// Sequelize (Database access (postgres))
const Sequelize = require('sequelize');
const sequelize = new Sequelize(user_config.dboptions);
let sensor_data = sequelize.define('sensor_data', {
    time: {
        primaryKey: true,
        type: Sequelize.DATE
    },
    origin_id: {
        type: Sequelize.INTEGER
    },
    phase1_rms: {
        type: Sequelize.DOUBLE
    },
    phase2_rms: {
        type: Sequelize.DOUBLE
    },
    phase3_rms: {
        type: Sequelize.DOUBLE
    },
    neutral_rms: {
        type: Sequelize.DOUBLE
    }
}, { timestamps: false, id: false});
let sensors = sequelize.define('sensors', {
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    name: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    },
    location: {
        type: Sequelize.STRING
    },
    connected: {
        type: Sequelize.BOOLEAN
    },
    last_transmission: {
        type: Sequelize.DATE
    }
}, { timestamps: false, id: false })
sequelize.authenticate().then(() => {
    console.log('Database connected');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// Scheduler
const schedule = require('node-schedule');

//----------------Event Handlers-----------------

// Web Server
server.listen(user_config.webserver_options.port, () => {
    console.log('Web server running on port ' + user_config.webserver_options.port);
});

// Routes for website
app.use("/", express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.redirect('/dashboard.html');
});

// API
app.get('/api/:originId/data/:startTime-:endTime', (req, res) => {
    var oid = req.params.originId;
    var startTime = new Date(req.params.startTime);
    var endTime = new Date(req.params.endTime);
});

// Socket.io
io.on('connection', (socket) => {
    console.log('Socket connected: ' + socket.id);
    sensors.findAll().then((sensrs) => {
        io.emit("sensors", sensrs)
    })
});

// Scheduler
const job = schedule.scheduleJob("*/30 * * * * *", async function() {
    var updated = false;
    const sensrs = await sensors.findAll();
    sensrs.forEach(sens => {
        if ((Date.now() - Date.parse(sens.last_transmission) > 60000) && sens.connected) {
            updated = true;
            sens.update({ connected: false });
        }
    })
    if (updated) {
        io.emit("sensors", sensrs);
    }
});

// MQTT
client.on("error", (err) => {
    console.log(err);
});

client.on("connect", () => {
    console.log("Connected to MQTT Broker, client id: " + client.options.clientId);
    client.subscribe("sensor_data/#", {qos: 0});
});

client.on("message", async (topic, message, packet) => {
    if (topic.toString() == "sensor_data/raw") {
        let message_data = {};
        let lines = message.toString().trim().split("\n");
        message_data.origin_id = Number('0x' + lines[0])
        let init_time = Number('0x' + lines[1].split(",")[0])
        var phase1_data = []
        var phase2_data = []
        var phase3_data = []
        var neutral_data = []
        for (var i = 1 ; i < lines.length ; i++){
            var line = lines[i].split(",")
            phase1_data[i-1] = [Number('0x' + line[0]) - init_time, 3.3*(Number('0x' + line[1])-2048)/4096]
            phase2_data[i-1] = [Number('0x' + line[0]) - init_time, 3.3*(Number('0x' + line[2])-2048)/4096]
            phase3_data[i-1] = [Number('0x' + line[0]) - init_time, 3.3*(Number('0x' + line[3])-2048)/4096]
            neutral_data[i-1] = [Number('0x' + line[0]) - init_time, 3.3*(Number('0x' + line[4])-2048)/4096]
        }
        var trigger_index = 0;
        var zero_crossing = 0;
        var delta_phase2 = 0;
        var delta_phase3 = 0;
        for (var i = 1 ; i < phase1_data.length; i++) {
            if (phase1_data[i][1] > 0 && phase1_data[i-1][1] < 0) {
                trigger_index = i-1;
                y1 = phase1_data[i-1][1]
                x1 = phase1_data[i-1][0]
                y2 = phase1_data[i][1]
                x2 = phase1_data[i][0]
                zero_crossing = x1 - y1 * (x2-x1) / (y2-y1)
                break;
            }
        }
        for (var i = trigger_index; i < phase1_data.length; i++) {
            if (phase2_data[i][1] > 0 && phase2_data[i-1][1] < 0) {
                y1 = phase2_data[i-1][1]
                x1 = phase2_data[i-1][0]
                y2 = phase2_data[i][1]
                x2 = phase2_data[i][0]
                delta_phase2 = -(x1 - y1 * (x2-x1) / (y2-y1)) + zero_crossing;
                delta_phase2 = 360*delta_phase2/16666.667
                break;
            }
        }
        for (var i = trigger_index; i < phase1_data.length; i++) {
            if (phase3_data[i][1] > 0 && phase3_data[i-1][1] < 0) {
                y1 = phase3_data[i-1][1]
                x1 = phase3_data[i-1][0]
                y2 = phase3_data[i][1]
                x2 = phase3_data[i][0]
                delta_phase3 = -(x1 - y1 * (x2-x1) / (y2-y1)) + zero_crossing;
                delta_phase3 = 360*delta_phase3/16666.667
                break;
            }
        }
        message_data.trigger_index = trigger_index;
        message_data.delta_phase2 = delta_phase2;
        message_data.delta_phase3 = delta_phase3;
        message_data.phase1_data = phase1_data;
        message_data.phase2_data = phase2_data;
        message_data.phase3_data = phase3_data;
        message_data.neutral_data = neutral_data;
        io.emit("sensor_data", message_data);
    }
    else if (topic.toString() == "sensor_data/processed") {
        let parsedMessage = JSON.parse(message);
        try {
            const sensor = await sensors.findOne({
                where: {
                    id: parsedMessage.origin_id,
                },
            })
            await sensor.update({
                last_transmission: new Date(Date.now())
            });
            if (!sensor.connected) {
                await sensor.update({
                    connected: true
                });
                const sensrs = await sensors.findAll();
                io.emit("sensors", sensrs);
            }
            socket_message = {
                time: new Date(parsedMessage.time),
                origin_id: parsedMessage.origin_id,
                phase1_rms: Math.sqrt(parsedMessage.data.phase1) * 3.3 / 4095,
                phase2_rms: Math.sqrt(parsedMessage.data.phase2) * 3.3 / 4095,
                phase3_rms: Math.sqrt(parsedMessage.data.phase3) * 3.3 / 4095,
                neutral_rms: Math.sqrt(parsedMessage.data.neutral) * 3.3 / 4095
            }
            io.emit("processed_sensor_data", socket_message)
            //console.log(Date.now() - Date.parse(sensor.dataValues.last_transmission))
            sensor_data.create(socket_message);
    
            console.log("[" + new Date(parsedMessage.time).toString() + "] Data inserted into database");
        } catch (err) {
            console.log(err);
        }
    }
    else {
        console.log("MQTT message received and NOT processed!");
    }

    
});
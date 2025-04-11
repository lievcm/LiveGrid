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
const { sensors_model, sensor_data_model, mn_sensor_data_model,
        hr_sensor_data_model, dy_sensor_data_model } = require('./models.js');
let sensor_data = sequelize.define('sensor_data', sensor_data_model, { timestamps: false, id: false});
let sensors = sequelize.define('sensors', sensors_model, { timestamps: false, id: false });
let mn_sensor_data = sequelize.define('mn_sensor_data', mn_sensor_data_model, { timestamps: false, id: false});
let hr_sensor_data = sequelize.define('hr_sensor_data', hr_sensor_data_model, { timestamps: false, id: false });
let dy_sensor_data = sequelize.define('dy_sensor_data', dy_sensor_data_model, { timestamps: false, id: false});
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

// API routes

// route for getting all sensor data
app.get('/api/sensors', (req, res) => {
    sensors.findAll().then((sensrs) => {
        res.json(sensrs);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error retrieving sensors from database.");
    });
});

// route for getting individual sensor data
app.get('/api/sensors/:id', (req, res) => {
    var id = Number(req.params.id);
    sensors.findOne({
        where: {
            id: id,
        },
    }).then((sensor) => {
        if (sensor) {
            res.json(sensor);
        } else {
            res.status(404).send("Sensor not found.");
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error retrieving sensor from database.");
    });
});

// route for getting sensor data by the second
app.get('/api/sensor_data/seconds/:originId/:startTime-:endTime', (req, res) => {
    console.log("Seconds route called")
    var oid = req.params.originId;
    var startTime = new Date(Number(req.params.startTime));
    var endTime = new Date(Number(req.params.endTime));
    sensor_data.findAll({
        where: {
            origin_id: oid,
            time: {
                [Sequelize.Op.gte]: startTime,
                [Sequelize.Op.lte]: endTime,
            },
        },
    }).then((data) => {
        res.json(data);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error retrieving sensor data from database.");
    })
});

// route for getting sensor data by the minute
app.get('/api/sensor_data/minutes/:originId/:startTime-:endTime', (req, res) => {
    console.log("Minutes route called")
    var oid = req.params.originId;
    var startTime = new Date(Number(req.params.startTime));
    var endTime = new Date(Number(req.params.endTime));
    mn_sensor_data.findAll({
        where: {
            origin_id: oid,
            minute: {
                [Sequelize.Op.gte]: startTime,
                [Sequelize.Op.lte]: endTime,
            },
        },
    }).then((data) => {
        res.json(data);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error retrieving sensor data from database.");
    })
});

// route for getting sensor data by the hour
app.get('/api/sensor_data/hours/:originId/:startTime-:endTime', (req, res) => {
    console.log("Hours route called")
    var oid = req.params.originId;
    var startTime = new Date(Number(req.params.startTime));
    var endTime = new Date(Number(req.params.endTime));
    hr_sensor_data.findAll({
        where: {
            origin_id: oid,
            hour: {
                [Sequelize.Op.gte]: startTime,
                [Sequelize.Op.lte]: endTime,
            },
        },
    }).then((data) => {
        res.json(data);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error retrieving sensor data from database.");
    })
});

// route for getting sensor data by the day
app.get('/api/sensor_data/days/:originId/:startTime-:endTime', (req, res) => {
    console.log("Days route called")
    var oid = req.params.originId;
    var startTime = new Date(Number(req.params.startTime));
    var endTime = new Date(Number(req.params.endTime));
    dy_sensor_data.findAll({
        where: {
            origin_id: oid,
            day: {
                [Sequelize.Op.gte]: startTime,
                [Sequelize.Op.lte]: endTime,
            },
        },
    }).then((data) => {
        res.json(data);
    }).catch(err => {
        console.log(err);
        res.status(500).send("Error retrieving sensor data from database.");
    })
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
            phase1_data[i-1] = [Number('0x' + line[0]) - init_time, 330*(Number('0x' + line[1])-2048)/4096]
            phase2_data[i-1] = [Number('0x' + line[0]) - init_time, 330*(Number('0x' + line[2])-2048)/4096]
            phase3_data[i-1] = [Number('0x' + line[0]) - init_time, 330*(Number('0x' + line[3])-2048)/4096]
            neutral_data[i-1] = [Number('0x' + line[0]) - init_time, 330*(Number('0x' + line[4])-2048)/4096]
        }
        var trigger_index = 1;
        var zero_crossing = 0;
        var delta_phase2 = 0;
        var delta_phase3 = 0;
        for (var i = 1 ; i < phase1_data.length; i++) {
            if (phase1_data[i][1] > 0 && phase1_data[i-1][1] < 0) {
                trigger_index = i;
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
                phase1_rms: Math.sqrt(parsedMessage.data.phase1) * 330 / 4095,
                phase2_rms: Math.sqrt(parsedMessage.data.phase2) * 330 / 4095,
                phase3_rms: Math.sqrt(parsedMessage.data.phase3) * 330 / 4095,
                neutral_rms: Math.sqrt(parsedMessage.data.neutral) * 330 / 4095
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
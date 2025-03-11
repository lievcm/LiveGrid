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

// mqtt (data streaming from sensor)
const mqtt = require('mqtt');
client = mqtt.connect(user_config.mqtt_options);

// Socket.io (data streaming to client)
const { Server } = require('socket.io');
const io = new Server(server);

// Sequelize (Database access (postgres))
const Sequelize = require('sequelize');
const sequelize = new Sequelize(user_config.dboptions);
let sensor_data = sequelize.define('sensor_data', {
    time: {
        primaryKey: true,
        type: Sequelize.DATE
    },
    origin_id: {
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    phase1_data: {
        type: Sequelize.DOUBLE
    },
    phase2_data: {
        type: Sequelize.DOUBLE
    },
    phase3_data: {
        type: Sequelize.DOUBLE
    },
    neutral_data: {
        type: Sequelize.DOUBLE
    }
}, { timestamps: false, id: false});
sequelize.authenticate().then(() => {
    console.log('Database connected');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

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

// Socket.io
io.on('connection', (socket) => {
    console.log('Socket connected: ' + socket.id);
});

// MQTT
client.on("error", (err) => {
    console.log(err);
});

client.on("connect", () => {
    console.log("Connected to MQTT Broker, client id: " + client.options.clientId);
    client.subscribe("sensor_data/processed", {qos: 1});
});


client.on("message", async (topic, message, packet) => {
    if (topic.toString() == "sensor_data/raw") {
        message = {};
        var datapoints = [[], [], [], [], []];
        let datapoints_raw = message.toString().trim().split("\n");
        message.origin_id = datapoints_raw[0];
        for (var i = 1 ; i < datapoints_raw.length ; i++){
            let line = datapoints_raw[i].split(",");
            for (var j = 0; j < line.length; j++) {
                datapoints [j][i-1] = Number("0x" + line[j]);
            }
        }
        message.datapoints = datapoints;
        io.emit("sensor_data", message);
    }
    else if (topic.toString() == "sensor_data/processed") {
        let parsedMessage = JSON.parse(message);
        try {
            await sensor_data.create({
                time: new Date(parsedMessage.time),
                origin_id: parsedMessage.origin_id,
                phase1_data: Math.sqrt(parsedMessage.data.phase1) * 3.3 / 4095,
                phase2_data: Math.sqrt(parsedMessage.data.phase2) * 3.3 / 4095,
                phase3_data: Math.sqrt(parsedMessage.data.phase3) * 3.3 / 4095,
                neutral_data: Math.sqrt(parsedMessage.data.neutral) * 3.3 / 4095
            });
    
            console.log("[" + new Date(parsedMessage.time).toString() + "] Data inserted into database");
        } catch (err) {
            console.log(err);
        }
    }
    else {
        console.log("MQTT message received and NOT processed!");
    }

    
});
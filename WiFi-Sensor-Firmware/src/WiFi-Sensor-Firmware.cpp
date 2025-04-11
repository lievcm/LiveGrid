// This #include statement was automatically added by the Particle IDE.
#include <MQTT.h>

// Include Particle Device OS APIs
#include "Particle.h"

// include print64 for printing 64 bit ints
#include <Print64.h>

// include sensor_processing for reading and processing input data
#include "sensor_processing.h"

// include sd_card for writing data and config to sd card
#include "sd_card.h"

// Let Device OS manage the connection to the Particle Cloud
SYSTEM_MODE(SEMI_AUTOMATIC);
SYSTEM_THREAD(ENABLED);

// Show system, cloud connectivity, and application logs over USB
// View logs with CLI using 'particle serial monitor --follow'
//SerialLogHandler logHandler(LOG_LEVEL_INFO);
SerialLogHandler logHandler(LOG_LEVEL_NONE, {
  { "app.MQTT", LOG_LEVEL_ALL }
});

// MQTT Client Object & callback function
void callback(char* topic, byte* payload, unsigned int length){}
byte server[] = {192, 168, 137, 1};
MQTT client(server, 1883, 2048, callback);

// Inputs corresponding to BNC J1-J4 on PCB
uint16_t IN_J1 = A2; // Phase 1 Input
uint16_t IN_J2 = A5; // Phase 2 Input
uint16_t IN_J3 = A1; // Phase 3 Input
uint16_t IN_J4 = A0; // Neutral Input

// Timestamp for timing measurements
uint32_t initial_meas_time;

// setup() runs once, when the device is first turned on
void setup() {
  Serial.begin();
  WiFi.on();
  WiFi.connect();
  waitUntil(WiFi.ready);

  Particle.connect();
  waitUntil(Particle.connected);

  // connect MQTT client
  client.connect("sensor-1", "admin", "1234");
  if (client.isConnected()) {
    client.publish("/test", "hello world!");
  }

  // set analog pins as inputs
  pinMode(IN_J1, INPUT);
  pinMode(IN_J2, INPUT);
  pinMode(IN_J3, INPUT);
  pinMode(IN_J4, INPUT);

  // setup sensor processing
  uint32_t inputs[4] = {IN_J1, IN_J2, IN_J3, IN_J4};
  sensor_processing::init(inputs, 3);

  // setup sd card
  sd_card::init(S3);

  initial_meas_time = millis();

  Particle.disconnect();

}

// loop() runs over and over again, as quickly as it can execute.
void loop() {
  // reconnect if not connected
  if (!client.isConnected()) {
    WiFi.connect();
    client.clear();
    client.connect("sensor-1", "admin", "1234");
  }

  sensor_processing::loop();

  if (millis() - initial_meas_time > 1000 && sensor_processing::is_ready()) {
    initial_meas_time = millis();
    char** rms_data = sensor_processing::get_rms_data();
    char* waveform_data = sensor_processing::get_waveform_csv();
    sd_card::write_rolling_backup(rms_data[1]);
    if (client.isConnected()) {
      bool raw_pub = client.publish("sensor_data/raw", waveform_data);
      bool processed_pub = client.publish("sensor_data/processed", rms_data[0]);
      if (!raw_pub || !processed_pub) {
        client.disconnect();
      }    
      char* retransmission = sd_card::get_lost_connection_backup();
      if (retransmission != NULL) {
        if (!client.publish("sensor_data/processed", retransmission)) { // can simply publish to same topic since timestamped and formatted
          client.disconnect();
        }
      }
    }
    else {
      Serial.println("Writing LC Backup");
      sd_card::write_lost_connection_backup(rms_data[0]);
    }
  }

  client.loop();

}
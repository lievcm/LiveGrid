// This #include statement was automatically added by the Particle IDE.
#include <MQTT.h>

// Include Particle Device OS APIs
#include "Particle.h"

// include print64 for processing print statements
#include <Print64.h>

// include sensor_processing for reading and processing input data
#include "sensor_processing.h"

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
MQTT client(server, 1883, 1024, callback);

// Inputs corresponding to BNC J1-J4 on PCB
uint16_t IN_J1 = A0; // Phase 1 Input
uint16_t IN_J2 = A1; // Phase 2 Input
uint16_t IN_J3 = A5; // Phase 3 Input
uint16_t IN_J4 = A2; // Neutral Input

// setup() runs once, when the device is first turned on
void setup() {
  Serial.begin();
  WiFi.on();
  WiFi.connect();
  waitUntil(WiFi.ready);

  Particle.connect();
  waitUntil(Particle.connected);

  // connect MQTT client
  client.connect("sensor-0", "admin", "1234");
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

  sensor_processing::init(inputs, 1);

  Particle.disconnect();

}

// loop() runs over and over again, as quickly as it can execute.
void loop() {
  // reconnect if not connected
  if (!client.isConnected()) {
    WiFi.disconnect();
    WiFi.connect();
    waitUntil(WiFi.ready);
    client.clear();
    client.connect("sensor-0", "admin", "1234");
  }

  sensor_processing::loop();

  if (sensor_processing::is_ready_csv()) {
    char* csv = sensor_processing::get_chunk_csv();
    if (client.isConnected()) {
      if (!client.publish("sensor_data/raw", csv)) {
        client.disconnect();
      }
      delay(250);
    }
  }

  if (sensor_processing::is_ready_json()) {
    char* json = sensor_processing::get_rms_json();
    if (client.isConnected()) {
      if (!client.publish("sensor_data/processed", json)) {
        client.disconnect();
      }
    }
  }

  client.loop();

}
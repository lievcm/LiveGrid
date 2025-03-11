// This #include statement was automatically added by the Particle IDE.
#include <MQTT.h>

// Include Particle Device OS APIs
#include "Particle.h"

// include print64 for processing print statements
#include <Print64.h>

// Let Device OS manage the connection to the Particle Cloud
SYSTEM_MODE(AUTOMATIC);

// Show system, cloud connectivity, and application logs over USB
// View logs with CLI using 'particle serial monitor --follow'
//SerialLogHandler logHandler(LOG_LEVEL_INFO);

// MQTT Client Object & callback function
void callback(char* topic, byte* payload, unsigned int length);
byte server[] = {192, 168, 137, 1};
MQTT client(server, 1883, 2048, callback);

// csv write function, starts at start, returns new start
uint32_t csv_write_line(char* csv, uint32_t time, uint16_t* data, uint32_t length, uint32_t start);

char hex_nibble_to_string (uint8_t nibble);

void callback(char* topic, byte* payload, unsigned int length) {
  // No need to worry about receieved messages
}

#define TIME_DELAY_MS 1000 // delay in ms measurement processing & sending
#define READINGS_PER_RAW_UPLOAD 35 // readings per raw data upload
#define ORIGIN_ID 123 // id of origin sensor


// Inputs corresponding to BNC J1-J4 on PCB
int IN_J1 = A0; // Phase 1 Input
int IN_J2 = A1; // Phase 2 Input
int IN_J3 = A5; // Phase 3 Input
int IN_J4 = A2; // Neutral Input

int64_t start_time;
uint32_t upload_time;
int32_t squares_buffer[4][256] = {0}; // 32 bit ints are faster on 32 bit mcu??...idk
uint32_t iterator; // iterator for buffer, does shift register stuff
char raw_data_csv[1500] = {0}; // raw data csv string
uint32_t csv_iterator; //iterator for csv buffer
uint32_t csv_data_counter; // counter for csv data

// setup() runs once, when the device is first turned on
void setup() {
  // connect MQTT client
  client.connect("sensor-1", "admin", "1234");
  
  // unused subject, just for testing
  if (client.isConnected()) {
    client.publish("test", "hello world!");
  }

  // set analog pins as inputs
  pinMode(IN_J1, INPUT);
  pinMode(IN_J2, INPUT);
  pinMode(IN_J3, INPUT);
  pinMode(IN_J4, INPUT);

  // initialize timestamp (start time is permanent, measurement time is faster and used for timing measuremens)
  start_time = (int64_t)1000*Time.now() - (int64_t)System.millis(); //64 bit time that wont overflow for 584942417355 years
  upload_time = millis();     
  Serial.printf("starting at " + toString(start_time))      ;         //32 bit time that will overflow after 49.7 days

  // initialize buffer iterator
  iterator = 0;

  // initialize raw data csv
  csv_iterator = 0;
  csv_data_counter = 0;
}

// loop() runs over and over again, as quickly as it can execute.
void loop() {
  // run mqtt client loop if connected
  if (client.isConnected()) {
    client.loop();

    // write header if at beginning of csv
    if (csv_data_counter == 0) {
      // write csv header
      for (int i = 0; i < 2; i++) {
        raw_data_csv[csv_iterator++] = hex_nibble_to_string(ORIGIN_ID>>(4*(1-i)) & 0xF);
      }
      raw_data_csv[csv_iterator++] = '\n';
    }

    // read input data
    uint16_t phase1 = (uint16_t)analogRead(IN_J1);
    uint16_t phase2 = (uint16_t)analogRead(IN_J2);
    uint16_t phase3 = (uint16_t)analogRead(IN_J3);
    uint16_t neutral = (uint16_t)analogRead(IN_J4);
    uint16_t csv_data[] = {phase1, phase2, phase3, neutral};
    
    // add raw data to csv
    csv_iterator = csv_write_line(raw_data_csv, micros(), csv_data, 4, csv_iterator);

    // upload raw data when done reading enough data
    if (csv_data_counter == READINGS_PER_RAW_UPLOAD) {
      // upload raw data
      raw_data_csv[csv_iterator] = '\0'; // null terminate csv string
      client.publish("sensor_data/raw", raw_data_csv);
      csv_iterator = 0;
      csv_data_counter = 0;
      delay(100);
    } else {
      csv_data_counter++;
    }

    // populate buffer
    squares_buffer[0][iterator] = phase1 - 2048;
    squares_buffer[1][iterator] = phase2 - 2048;
    squares_buffer[2][iterator] = phase3 - 2048;
    squares_buffer[3][iterator] = neutral - 2048;

    // increment iterator
    iterator = iterator == 255 ? 0 : iterator + 1;
  
    //Serial.println("Uploading raw data:\n");
    //Serial.println(raw_data_csv);
    //Serial.println("\n\n\n");
  
    // upload data if delay time has passed;
    if (millis() - upload_time > TIME_DELAY_MS) {
      uint32_t sum[4] = {0}; // stores sum of squares
      for (int i = 0; i < 256; i++) {
        // sum squares
        sum[0] += squares_buffer[0][i]*squares_buffer[0][i];
        sum[1] += squares_buffer[1][i]*squares_buffer[1][i];
        sum[2] += squares_buffer[2][i]*squares_buffer[2][i];
        sum[3] += squares_buffer[3][i]*squares_buffer[3][i];
      }
  
      // calculate rms values
      uint32_t rms[4] = {0};
      for (int i = 0; i < 4; i++) {
        rms[i] = sum[i]>>8; // >>8 equiv /256
      }

      char *json = (char*)malloc(200*sizeof(char));

      snprintf(json, 200*sizeof(char),  "{\"origin_id\": %d, \"time\": %s, \"data\": { \"phase1\": %ld, \"phase2\": %ld,\"phase3\": %ld,\"neutral\": %ld} }", ORIGIN_ID, toString(start_time + (int64_t)System.millis()).c_str(), rms[0], rms[1], rms[2], rms[3]);
  
      // publish processed data
      client.publish("sensor_data/processed", json);

      free(json);
  
      // reset upload time
      //Serial.println("Uploading processed data");
  
      upload_time = millis();
    }
  }
  if (!client.isConnected()) {
    Serial.println("Failed to connect to MQTT broker");
    client.connect("sensor-1", "admin", "1234");
  }
}

uint32_t csv_write_line(char* csv, uint32_t time, uint16_t* data, uint32_t length, uint32_t start) {
  // write time
  uint32_t csv_ptr = start;
  for (int i = 0; i < 8; i++) {
    csv[csv_ptr++] = hex_nibble_to_string((time >> 4*(7-i)) & 0xF);
  }

  // write data
  for (uint32_t i = 0; i < length; i++) {
    csv[csv_ptr++] = ',';
    for (int j = 0; j < 3; j++) {
      csv[csv_ptr++] = hex_nibble_to_string((data[i] >> 4*(2-j)) & 0xF);
    }
  }

  // write newline
  csv[csv_ptr++] = '\n';

  return csv_ptr;
}

char hex_nibble_to_string (uint8_t nibble) {
  if (nibble < 10) {
    return '0' + nibble;
  } else {
    return 'A' + nibble - 10;
  }
}
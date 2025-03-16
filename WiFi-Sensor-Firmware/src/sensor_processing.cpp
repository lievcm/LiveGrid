#include "sensor_processing.h"
#include "Particle.h"

#include <Print64.h>

#define MAX_READ_COUNT 64

using namespace sensor_processing;

uint32_t write_header_csv(char* csv, uint32_t oid, uint32_t phase);
uint32_t write_line_csv(char* csv, uint32_t time, uint16_t* data, uint32_t length, uint32_t start);
char hex_nibble_to_char(uint8_t nibble);

// fsm states
sensor_processing::STATE state_csv, state_json;

// origin id (for header)
uint32_t origin_id;

// unix millis when setup is called
int64_t start_time;

// buffers
char* csv_buffer;
char* json_buffer;

uint32_t inputs[4] = {0}; //input pins
uint32_t current_input;   //input currently being read

uint32_t current_reading; //reading number of current iteration
uint32_t csv_current_offset; // current location in csv buff
uint32_t json_sums_counter; // number of full readings (on all 4 pins)

uint32_t rms_sums[4] = {0}; // stores accumulation for rms readings

void sensor_processing::init(uint32_t* ins, uint32_t oid) {

    inputs[0] = ins[0]; // theres definitely a better way to do this
    inputs[1] = ins[1];
    inputs[2] = ins[2];
    inputs[3] = ins[3];

    origin_id = oid;

    csv_buffer = (char*)malloc(1500*sizeof(char)); // will not be freeing these
    json_buffer = (char*)malloc(200*sizeof(char));

    state_csv = STATE::READING;   // start in the reading state
    state_json = STATE::READING;

    current_reading = 0;        // initialize all counters to 0
    csv_current_offset = 0;
    current_input = 0;
    json_sums_counter = 0;

    // store the start time
    start_time = (int64_t)1000*Time.now() - (int64_t)System.millis(); //64 bit time that wont overflow for 584942417355 years

}

void sensor_processing::loop() {

    if (state_csv == STATE::READING) {

        if (current_reading == 0) { // write header if at the start
            csv_current_offset = write_header_csv(csv_buffer, origin_id, current_input);
        }

        // store time and adc input
        uint32_t time = micros();
        uint16_t reading = (uint16_t)analogRead(inputs[current_input]);

        // write data to csv
        csv_current_offset = write_line_csv(csv_buffer, time, &reading, 1, csv_current_offset);

        // add data to rms accumulation if not full
        if (json_sums_counter < 4) {
            int32_t reading_calib = (int32_t)reading - 2048;
            rms_sums[current_input] += reading_calib * reading_calib;
        }

        // move to next state when max read count is reached
        if (current_reading == MAX_READ_COUNT-1) {
            
            // update current input & json sum counter
            if (current_input == 3) {
                current_input = 0;
                json_sums_counter++;
            }
            else {
                current_input++;
            }

            csv_buffer[csv_current_offset-1] = '\0'; // terminate csv
            state_csv = STATE::READY;
            current_reading = 0;
            csv_current_offset = 0;

        }
        else current_reading++;

    }

    if (state_json == STATE::READING) {

        // if 256 sums have been accumulated
        // create json and move to next state
        if (json_sums_counter >= 4) {

            for (int i = 0; i < 4; i++) {
                rms_sums[i] = rms_sums[i]>>8;
            }

            snprintf(json_buffer, 200*sizeof(char),  "{\"origin_id\": %ld, \"time\": %s, \"data\": { \"phase1\": %ld, \"phase2\": %ld,\"phase3\": %ld,\"neutral\": %ld} }", 
                        origin_id, toString(start_time + (int64_t)System.millis()).c_str(), rms_sums[0], rms_sums[1], rms_sums[2], rms_sums[3]);
            
            state_json = STATE::READY;
        }

    }

}

char* sensor_processing::get_chunk_csv() {

    if (state_csv == STATE::READY) {

        state_csv = STATE::READING;

        return csv_buffer;

    }
    else return NULL;

}

char* sensor_processing::get_rms_json() {
    
    if (state_json == STATE::READY) {

        state_json = STATE::READING;

        json_sums_counter = 0;

        return json_buffer;

    }
    else return NULL;

}

bool sensor_processing::is_ready_csv() {
    return state_csv == STATE::READY;
}

bool sensor_processing::is_ready_json() {
    return state_json == STATE::READY;
}

uint32_t write_header_csv(char* csv, uint32_t oid, uint32_t phase) {
    uint32_t csv_iterator = 0;
    for (int i = 0; i < 3; i++) {
        csv_buffer[csv_iterator++] = hex_nibble_to_char((oid>>4*(2-i)) & 0xF);
    }
    csv[csv_iterator++] = ',';
    csv[csv_iterator++] = hex_nibble_to_char(phase & 0xF);
    csv[csv_iterator++] = '\n';
    return csv_iterator;
}

uint32_t write_line_csv(char* csv, uint32_t time, uint16_t* data, uint32_t length, uint32_t start) {
    // write time
    uint32_t csv_ptr = start;
    for (int i = 0; i < 8; i++) {
      csv[csv_ptr++] = hex_nibble_to_char((time >> 4*(7-i)) & 0xF);
    }
  
    // write data
    for (uint32_t i = 0; i < length; i++) {
      csv[csv_ptr++] = ',';
      for (int j = 0; j < 3; j++) {
        csv[csv_ptr++] = hex_nibble_to_char((data[i] >> 4*(2-j)) & 0xF);
      }
    }
  
    // write newline
    csv[csv_ptr++] = '\n';
  
    return csv_ptr;
}

char hex_nibble_to_char(uint8_t nibble) {
    if (nibble < 10) {
        return '0' + nibble;
    } else {
        return 'A' + nibble - 10;
    }
}

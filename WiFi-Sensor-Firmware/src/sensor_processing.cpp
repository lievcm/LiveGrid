#include "sensor_processing.h"
#include "Particle.h"

#include <Print64.h>

#define MAX_READ_COUNT_CSV 40
#define MAX_READ_COUNT_JSON 256

using namespace sensor_processing;

uint32_t write_header_csv(char* csv, uint32_t oid);
uint32_t write_line_csv(char* csv, uint32_t time, uint16_t* data, uint32_t length, uint32_t start);
char hex_nibble_to_char(uint8_t nibble);

// fsm states
sensor_processing::STATE state;

// flags for switching states from ready to reading
bool waveform_read;
bool rms_read;

// origin id (for header)
uint32_t origin_id;

// unix millis when setup is called
int64_t start_time;

// buffers
char* waveform_csv_buffer;
char* rms_json_buffer;
char* rms_csv_buffer;
char* rms_data_ptr[2] = {0};

uint32_t inputs[4] = {0}; //input pins

uint32_t current_reading; //reading number of current iteration
uint32_t waveform_csv_offset; // current location in csv buff
uint32_t rms_csv_offset; // current location in rms buff

uint32_t rms_sums[4] = {0}; // stores accumulation for rms readings

void sensor_processing::init(uint32_t* ins, uint32_t oid) {

    inputs[0] = ins[0]; // theres definitely a better way to do this
    inputs[1] = ins[1];
    inputs[2] = ins[2];
    inputs[3] = ins[3];

    origin_id = oid;

    waveform_csv_buffer = (char*)malloc(2048*sizeof(char)); // will not be freeing these
    rms_json_buffer = (char*)malloc(200*sizeof(char));
    rms_csv_buffer = (char*)malloc(200*sizeof(char));

    rms_data_ptr[0] = rms_json_buffer; // json string
    rms_data_ptr[1] = rms_csv_buffer; // csv string

    state = STATE::READING;

    current_reading = 0;        // initialize all counters to 0
    waveform_csv_offset = 0;
    rms_csv_offset = 0;

    waveform_read = false;
    rms_read = false;

    // store the start time
    start_time = (int64_t)1000*Time.now() - (int64_t)System.millis(); //64 bit time that wont overflow for 584942417355 years

}

void sensor_processing::loop() {

    if (state == STATE::READING) {

        if (current_reading == 0) { // write header if at the start
            waveform_csv_offset = write_header_csv(waveform_csv_buffer, origin_id);
        }

        // store time and adc input
        uint32_t time = micros();
        uint16_t readings[] = {(uint16_t)analogRead(inputs[0]), (uint16_t)analogRead(inputs[1]), (uint16_t)analogRead(inputs[2]), (uint16_t)analogRead(inputs[3])};

        // write data to csv
        if (current_reading < MAX_READ_COUNT_CSV) {
            waveform_csv_offset = write_line_csv(waveform_csv_buffer, time, readings, 4, waveform_csv_offset);
        }

        // add data to rms accumulation
        for (int i = 0; i < 4; i++) {
            int32_t reading_calib = (int32_t)readings[i] - 2048;
            rms_sums[i] += reading_calib * reading_calib;
        }

        // move to next state when max read count is reached
        if (current_reading == MAX_READ_COUNT_JSON-1) {

            Serial.println("done reading");

            // create json string
            for (int i = 0; i < 4; i++) {
                rms_sums[i] = rms_sums[i]>>8;
            }

            snprintf(rms_json_buffer, 200*sizeof(char),  "{\"origin_id\": %ld, \"time\": %s, \"data\": { \"phase1\": %ld, \"phase2\": %ld,\"phase3\": %ld,\"neutral\": %ld} }", 
                        origin_id, toString(start_time + (int64_t)System.millis()).c_str(), rms_sums[0], rms_sums[1], rms_sums[2], rms_sums[3]);

            snprintf(rms_csv_buffer, 150*sizeof(char), "%s,%ld,%ld,%ld,%ld", toString(start_time + (int64_t)System.millis()).c_str(), rms_sums[0], rms_sums[1], rms_sums[2], rms_sums[3]);

            for (int i = 0; i < 4; i++) {
                rms_sums[i] = 0;
            }

            waveform_csv_buffer[waveform_csv_offset-1] = '\0'; // terminate csv

            state = STATE::READY;
            current_reading = 0;
            waveform_csv_offset = 0;

        }
        else current_reading++;

    }
}

char* sensor_processing::get_waveform_csv() {

    if (state == STATE::READY) {

        if (rms_read) {
            state = STATE::READING;
            rms_read = false;
        } else {
            waveform_read = true;
        }

        return waveform_csv_buffer;

    }
    else return NULL;

}

char** sensor_processing::get_rms_data() {
    
    if (state == STATE::READY) {

        if (waveform_read) {
            state = STATE::READING;
            waveform_read = false;
        } else {
            rms_read = true;
        }

        return rms_data_ptr;
    }
    else return NULL;

}

bool sensor_processing::is_ready() {
    return state == STATE::READY;
}

uint32_t write_header_csv(char* csv, uint32_t oid) {
    uint32_t csv_iterator = 0;
    for (int i = 0; i < 3; i++) {
        waveform_csv_buffer[csv_iterator++] = hex_nibble_to_char((oid>>4*(2-i)) & 0xF);
    }
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

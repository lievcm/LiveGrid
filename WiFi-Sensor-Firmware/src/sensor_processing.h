#ifndef SENSOR_PROCESSING_H
#define SENSOR_PROCESSING_H

#include "Particle.h" 

// no i will not be using classes
namespace sensor_processing {

    // enum for state
    enum STATE {
        READING,
        READY
    };

    // bootleg constructor??!
    // ins: input pin array (4)
    // oid: origin id (sensor id)
    void init(uint32_t* ins, uint32_t oid);

    // gets called in main loop
    void loop();

    // returns waveform csv or NULL depending on state
    char* get_waveform_csv();

    // returns rms data array, index 0 points to json, index 1 to csv
    char** get_rms_data();

    // gets state for fsm
    bool is_ready();

}

#endif
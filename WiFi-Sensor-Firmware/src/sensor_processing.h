#ifndef SENSOR_PROCESSING_H
#define SENSOR_PROCESSING_H

#include "Particle.h" 

// no i will not be using classes
// fuck you
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

    // returns csv chunk or NULL depending on state
    char* get_chunk_csv();

    // returns rms json or NULL depending on state
    char* get_rms_json();

    // gets state for csv fsm
    bool is_ready_csv();

    // gets state for json fsm
    bool is_ready_json();

}

#endif
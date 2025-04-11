#ifndef SD_CARD_H
#define SD_CARD_H

#include "Particle.h"

// whats a class?
namespace sd_card {

    // bootleg constructor
    void init(uint8_t cs_pin);

    void write_rolling_backup(char* csv_line);

    void write_lost_connection_backup(char* json);

    char* get_lost_connection_backup();

}

#endif
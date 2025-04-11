#include "sd_card.h"
#include "SdFat.h"
#include "Print64.h"

#define F_CPU 200000000UL

using namespace sd_card;

struct Date {
    uint32_t year;
    uint32_t month;
    uint32_t day;
};

Date rolling_backup_dates[5];
uint8_t backup_dates_count;
uint8_t current_date_index;

uint64_t lc_backup_count; // lost connection backup count

SdFat sd;

bool sd_connected;
int64_t start_time_sd; // unix time when setup is called
uint8_t cs;

char* lc_backup_buffer;

void dateTime(uint16_t* date, uint16_t* time) {
    // convert unix time to date and time
    int64_t time_stamp = start_time_sd + (int64_t)System.millis();
    time_stamp = time_stamp / 1000; // convert to seconds
    *date = FAT_DATE(Time.year(time_stamp), Time.month(time_stamp), Time.day(time_stamp));
    *time = FAT_TIME(Time.hour(time_stamp), Time.minute(time_stamp), Time.second(time_stamp));
}

void load_rolling_backup_days() {
    sd.chdir();
    File dir = sd.open("rolling_backup");
    File file = dir.openNextFile(O_WRITE);

    backup_dates_count = 0;

    while (file) {
        if (!file.isDir()) {
            if (backup_dates_count < 5) {
                char* name = (char*)malloc(20*sizeof(char));
                file.getName(name, 20*sizeof(char));
                Serial.println(name);
                char* end_ptr;
                rolling_backup_dates[backup_dates_count].month = strtoul(name, &end_ptr, 10);
                rolling_backup_dates[backup_dates_count].day = strtoul(end_ptr + sizeof(char), &end_ptr, 10);
                rolling_backup_dates[backup_dates_count].year = strtoul(end_ptr + sizeof(char), NULL, 10);
                Serial.printlnf("Loaded backup with date: %ld/%ld/%ld", rolling_backup_dates[backup_dates_count].month, rolling_backup_dates[backup_dates_count].day, rolling_backup_dates[backup_dates_count].year);
                backup_dates_count++;
                free(name);
            }
            else {
                file.remove();
            }
        }
        file = dir.openNextFile(O_WRITE);
    }

    file.close();

    if (backup_dates_count == 0) {
        current_date_index = 0;
        backup_dates_count = 1;

        int64_t time_stamp = start_time_sd + (int64_t)System.millis();
        time_stamp = time_stamp / 1000; // convert to seconds

        rolling_backup_dates[current_date_index].month = Time.month(time_stamp);
        rolling_backup_dates[current_date_index].day = Time.day(time_stamp);
        rolling_backup_dates[current_date_index].year = Time.year(time_stamp);
    }
    else {
        // this isn't leetcode, I will not be using some fancy ass sorting algorithm to sort 5 elements
        int i, j;
        int len = backup_dates_count;

        for (i = 0; i < len-1; i++) {
            int min_index = i;

            for (j = i + 1; j < len; j++) {
                if ((rolling_backup_dates[j].year < rolling_backup_dates[min_index].year) ||
                    (rolling_backup_dates[j].year == rolling_backup_dates[min_index].year && rolling_backup_dates[j].month < rolling_backup_dates[min_index].month) ||
                    (rolling_backup_dates[j].year == rolling_backup_dates[min_index].year && rolling_backup_dates[j].month == rolling_backup_dates[min_index].month && rolling_backup_dates[j].day < rolling_backup_dates[min_index].day)) {
                    min_index = j;
                }
            }

            if (min_index != i) {
                Date temp = rolling_backup_dates[i];
                rolling_backup_dates[i] = rolling_backup_dates[min_index];
                rolling_backup_dates[min_index] = temp;
            }
        }
        current_date_index = backup_dates_count - 1;
    }
}

void load_lc_backup_count() {
    sd.chdir(); // move to root
    File dir = sd.open("connection_loss_backup");
    File file = dir.openNextFile();

    lc_backup_count = 0;

    while(file) {
        if (!file.isDir()) {
            lc_backup_count++;
        }
        file = dir.openNextFile();
    }
}

void sd_card::init(uint8_t cs_pin) {
    cs = cs_pin;
    if (!sd.begin(cs_pin, SPI_DIV6_SPEED)) {
        sd_connected = false;
        Serial.println("unale to connect to sd card");
    }
    else {
        sd_connected = true;

        // setup file timestamps
        start_time_sd = (int64_t)1000*Time.local() - (int64_t)System.millis();
        SdFile::dateTimeCallback(dateTime);

        // setup lost connection file read buffer
        lc_backup_buffer = (char*)malloc(200*sizeof(char));

        // setup file system
        if (!sd.exists("rolling_backup")) {
            Serial.println("making rolling backup directory");
            sd.mkdir("rolling_backup");
        }
        if (!sd.exists("connection_loss_backup")) {
            Serial.println("making connection loss backup directory");
            sd.mkdir("connection_loss_backup");
        }
        if (!sd.exists("config")) {
            Serial.println("making config directory");
            sd.mkdir("config");
        }

        load_rolling_backup_days();
        load_lc_backup_count();
    }
}

void sd_card::write_rolling_backup(char* csv_line) {
    if (!sd_connected) {
        init(cs);
        if (!sd_connected) {
            return;
        }
    }

    sd.chdir();
    sd.chdir("rolling_backup");

    int64_t time_stamp = start_time_sd + (int64_t)System.millis();
    time_stamp = time_stamp / 1000; // convert to seconds

    if ((int)rolling_backup_dates[current_date_index].month != Time.month(time_stamp) ||
        (int)rolling_backup_dates[current_date_index].day != Time.day(time_stamp) ||
        (int)rolling_backup_dates[current_date_index].year != Time.year(time_stamp)) {

        Serial.println("creating new backup file");
        
        if (backup_dates_count != 5) {
            current_date_index++;
            backup_dates_count++;
        }
        else {
            current_date_index = current_date_index == 4 ? 0 : current_date_index + 1;
            char* fname = (char*)malloc(20*sizeof(char));
            snprintf(fname, 20*sizeof(char), "%ld-%ld-%ld.txt", 
                    rolling_backup_dates[current_date_index].month,
                    rolling_backup_dates[current_date_index].day,
                    rolling_backup_dates[current_date_index].year);
            File f = sd.open(fname, O_WRITE);
            f.remove();
            free(fname);
            f.close();
        }
        
        rolling_backup_dates[current_date_index].month = Time.month(time_stamp);
        rolling_backup_dates[current_date_index].day = Time.day(time_stamp);
        rolling_backup_dates[current_date_index].year = Time.year(time_stamp);
        
    }


    char* fname = (char*)malloc(20*sizeof(char));
    snprintf(fname, 20*sizeof(char), "%ld-%ld-%ld.txt", 
            rolling_backup_dates[current_date_index].month,
            rolling_backup_dates[current_date_index].day,
            rolling_backup_dates[current_date_index].year);
    File f = sd.open(fname, O_WRITE | O_CREAT | O_APPEND);

    f.println(csv_line);

    f.close();

    free(fname);

}

void sd_card::write_lost_connection_backup(char* json) {
    if (!sd_connected) {
        init(cs);
        if (!sd_connected) {
            return;
        }
    }

    sd.chdir();
    sd.chdir("connection_loss_backup");

    char* fname = (char*)malloc(30*sizeof(char));
    snprintf(fname, 30*sizeof(char), "%s.json", toString(System.millis()).c_str());
    File f = sd.open(fname, O_WRITE | O_CREAT | O_TRUNC);
    if (f) {
        Serial.printlnf("Writing LC backup to file: %s", fname);
        f.write(json, 30*sizeof(char));
        f.close();
        lc_backup_count++;
    }

    free(fname);
}

char* sd_card::get_lost_connection_backup() {
    if (lc_backup_count != 0) {
        sd.chdir();
        File dir = sd.open("connection_loss_backup");
        File file = dir.openNextFile(O_RDWR);
        if (file && !file.isDir()) {
            char c;
            int index = 0;
            // all my homies love memory safe string operations
            int close_bracket_count = 0;
            while ((c = (char)file.read()) >= 0 && index < 199) { 
                if (c == '}') {
                    close_bracket_count++;
                }// read until file empty or buff is full
                lc_backup_buffer[index++] = c;
                if (close_bracket_count == 2) {
                    break;
                }
            }
            lc_backup_buffer[index] = '\0';
            file.remove();
            file.close();
            lc_backup_count--;
            return lc_backup_buffer;
        }
    }
    return NULL;
}
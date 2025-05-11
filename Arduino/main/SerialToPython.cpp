#include "SerialToPython.h"
#include <Arduino.h>


void Serial_to_python::send_data(float acceleration, float deceleration, int32_t steering_angle, bool handbreak, char gear , char turn_signal) {
    Serial.write(HEADER);                      // Send header byte
    Serial.write((uint8_t*)&acceleration, 4);  // Send acceleration (4 bytes)
    Serial.write((uint8_t*)&deceleration, 4);  // Send deceleration (4 bytes)
    Serial.write((uint8_t*)&steering_angle, 4);                         // Send RPM (4 byte)
    Serial.write(handbreak);
    Serial.write(gear);
    Serial.write(turn_signal);
}
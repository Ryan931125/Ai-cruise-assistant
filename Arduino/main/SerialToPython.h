#define SERIAL_To_Python_H
#ifdef SERIAL_To_Python_H

#include <Arduino.h>

const uint8_t HEADER = 0xAA; // Header byte

namespace Serial_to_python{
    void send_data(float acceleration, float deceleration, int32_t steering_angle, bool handbreak, char gear , char turn_signal);
}

#endif
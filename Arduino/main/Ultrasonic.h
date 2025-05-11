#ifndef ULTRASONIC_H
#define ULTRASONIC_H

#include <Arduino.h>

// Pin definitions // 1 for aceleration , 2 for deceleration

class Ultrasonic {
    public:
        Ultrasonic();
        void begin();  // Function to initialize pins
        float measure_acceleration();  // Function to measure distance
        float measure_deceleration();  // Function to measure distance
    private:
        int trig_1_pin;
        int echo_1_pin;
        int trig_2_pin;
        int echo_2_pin;
};

#endif
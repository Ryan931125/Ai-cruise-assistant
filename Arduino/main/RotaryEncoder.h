#ifndef ROTARY_ENCODER_H
#define ROTARY_ENCODER_H

#include <Arduino.h>
#include <stdint.h>

class RotaryEncoder {
public:
    // Constructor
    RotaryEncoder();

    // Initialize the rotary encoder
    void begin();

    // Update the angle based on encoder signals
    void update();

    // Get the current steering angle
    int32_t getAngle();

    // Reset the angle to zero
    void resetAngle();

private:
    uint8_t pinA;       // Encoder pin A
    uint8_t pinB;       // Encoder pin B
    int32_t angle;          // Current steering angle (in steps)
    int lastStateA;     // Last state of pin A
};

#endif
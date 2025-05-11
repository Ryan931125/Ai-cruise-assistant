#include "RotaryEncoder.h"

#define _pinA 42
#define _pinB 44

// Constructor
RotaryEncoder::RotaryEncoder()
    : pinA(_pinA), pinB(_pinB), angle(0), lastStateA(LOW) {}

// Initialize the rotary encoder
void RotaryEncoder::begin() {
    pinMode(pinA, INPUT);
    pinMode(pinB, INPUT);
    lastStateA = digitalRead(pinA);  // Read the initial state of pin A
    // attachInterrupt(digitalPinToInterrupt(_pinA), RotaryEncoder::update, CHANGE);
}

// Update the angle based on encoder signals
void RotaryEncoder::update() {
    int clkValue = digitalRead(pinA);
    if(lastStateA == HIGH && clkValue == LOW) {
    // Serial.print("dtValue = ");
    // Serial.println(dtValue);
    // Serial.print("clkValue = ");
    // Serial.println(clkValue);
    int dtValue = digitalRead(pinB);
        if(dtValue == LOW) {
            angle--;
            Serial.println("CounterClockwise");
        } else {
            angle++;
            Serial.println("clockwise");
        }
    }
    lastStateA = clkValue;  // Update the last state of pin A
}

// Get the current steering angle
int32_t RotaryEncoder::getAngle() {
    return angle;
}

// Reset the angle to zero
void RotaryEncoder::resetAngle() {
    angle = 0;
}
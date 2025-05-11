#ifndef JOYSTICK_CONTROLLER_H
#define JOYSTICK_CONTROLLER_H

#include <Arduino.h>

#define JOYSTICK_X_PIN A0  // Default pin for X-axis
#define JOYSTICK_Y_PIN A1  // Default pin for Y-axis\

class JoystickController {
public:
    // Constructor: xPin and yPin for analog joystick axes, buttonPin for the push-button
    JoystickController()
        : xPin(JOYSTICK_X_PIN), yPin(JOYSTICK_Y_PIN), gear_state('P') {}  // Default pin numbers;

    // Initialize the joystick (set pin modes)

    // Read the X-axis value (0-1023)
    int readX();

    // Read the Y-axis value (0-1023)
    int readY();

    // Read the push-button state (HIGH or LOW)
    bool readButton();

    char get_gear_status();

private:
    uint8_t xPin;
    uint8_t yPin;
    char gear_state;  // 'D' for drive, 'R' for reverse, 'P' for parking
};

#endif
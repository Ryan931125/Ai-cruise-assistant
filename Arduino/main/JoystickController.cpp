#include "JoystickController.h"

// Read the X axis value (0-1023)
int JoystickController::readX() {
    return analogRead(xPin);
}

// Read the Y axis value (0-1023)
int JoystickController::readY() {
    return analogRead(yPin);
}

char JoystickController::get_gear_status() {
    int x_value = readX();
    int y_value = readY();


    // 0 < x, y < 1023
    if (y_value < 300) {
        gear_state = 'D';  // Drive 搖桿往上是D
    } else if (y_value > 700) {
        gear_state = 'R';  // Reverse 搖桿往下是R
    } else if (x_value < 300) {
        gear_state = 'P';  // Park
    }

    return gear_state;
}
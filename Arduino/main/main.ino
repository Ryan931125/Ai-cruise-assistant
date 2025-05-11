#include "Ultrasonic.h"         // Include the ultrasonic module
#include "SerialToPython.h"     // Include the serial module
#include "RotaryEncoder.h"      // Include the rotary encoder module
#include "JoystickController.h" // Include the joystick controller module
#include "LED8x8Matrix.h"
#include "TurnSignal.h" // Include the turn signal module
#include <stdint.h>

float acceleration;
float deceleration;
int32_t steering_angle = 0; // Steering angle in degrees
bool handbreak = true;      // true for handbrake engaged, false for disengaged
char gear;                  // 'D' for drive, 'R' for reverse, 'P' for parking
char turn_signal;           // 'R' for right, 'L' for left, 'N' for none

#define HandBreak_Button_PIN 11 // Pin for handbrake
#define HandBreak_LED_pin 12

// Create a RotaryEncoder instance
RotaryEncoder encoder;       // Connect encoder pins A and B to pins 2 and 3
JoystickController joystick; // Create a JoystickController instance
Ultrasonic ultrasonic;       // Create an Ultrasonic instance
LED8x8Matrix matrix;         // Create an LED8x8Matrix instance
TurnSignal turnsignal;       // Create a TurnSignal instance

void setup()
{
    Serial.begin(115200); // Initialize ultrasonic sensors
    encoder.begin();      // Initialize the rotary encoder
    ultrasonic.begin();
    matrix.begin();     // Initialize the LED matrix
    turnsignal.begin(); // Initialize the turn signal
    encoder.resetAngle();
    pinMode(HandBreak_Button_PIN, INPUT_PULLUP); // Set handbrake pin as input
    pinMode(HandBreak_LED_pin, OUTPUT);          // Set handbrake LED pin as output
}

void loop()
{
    // // Measure acceleration and deceleration
    acceleration = ultrasonic.measure_acceleration();
    deceleration = ultrasonic.measure_deceleration();

    // // Update the steering angle
    encoder.update();
    steering_angle = encoder.getAngle();
    // Serial.print("Steering Angle: ");
    // Serial.println(steering_angle);
    gear = joystick.get_gear_status();
    matrix.displayGear(gear);
    turn_signal = turnsignal.read_signal();
    handbreak = (digitalRead(HandBreak_Button_PIN) == LOW);
    if (handbreak)
    {
        digitalWrite(HandBreak_LED_pin, HIGH); // Turn on the LED if handbrake is engaged
    }
    else
    {
        digitalWrite(HandBreak_LED_pin, LOW); // Turn off the LED if handbrake is disengaged
    }

    // Serial.print("Turn Signal: ");
    // Serial.println(turn_signal);

    // Send data to Python
    Serial_to_python::send_data(acceleration, deceleration, steering_angle, handbreak, gear, turn_signal);

    // delay(50); // Wait for 100ms before the next update
}
#include "Ultrasonic.h"

#define TRIG_1_PIN 6
#define ECHO_1_PIN 7
#define TRIG_2_PIN 9
#define ECHO_2_PIN 10

Ultrasonic::Ultrasonic() : trig_1_pin(TRIG_1_PIN), echo_1_pin(ECHO_1_PIN), trig_2_pin(TRIG_2_PIN), echo_2_pin(ECHO_2_PIN) {}

void Ultrasonic::begin() {
    pinMode(trig_1_pin, OUTPUT);
    pinMode(echo_1_pin, INPUT);
    pinMode(trig_2_pin, OUTPUT);
    pinMode(echo_2_pin, INPUT);
}

float Ultrasonic::measure_acceleration() {
    // Send a 10-microsecond pulse to the trigger pin
    digitalWrite(trig_1_pin, LOW);
    delayMicroseconds(2);
    digitalWrite(trig_1_pin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trig_1_pin, LOW);

    // Read the echo pin and measure the duration of the pulse
    long duration = pulseIn(echo_1_pin, HIGH);

    // Calculate the distance and transfer it to acceleration
    return duration;
}

float Ultrasonic::measure_deceleration(){
    digitalWrite(trig_2_pin, LOW);
    delayMicroseconds(2);
    digitalWrite(trig_2_pin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trig_2_pin, LOW);

    // Read the echo pin and measure the duration of the pulse
    long duration = pulseIn(echo_2_pin, HIGH);

    // Calculate the distance and transfer it to deceleration
    return duration;
}
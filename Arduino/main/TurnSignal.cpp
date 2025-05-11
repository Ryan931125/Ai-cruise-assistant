#include "TurnSignal.h"
#include <Arduino.h>

#define TURN_RIGHT_SIGNAL_PIN 3 // Pin for turn signal
#define TURN_LEFT_SIGNAL_PIN 4 // Pin for turn signal
#define TURN_SIGNAL_OFF_PIN 5 // Pin for turn signal

TurnSignal::TurnSignal() : turn_right_signal_pin(TURN_RIGHT_SIGNAL_PIN), turn_left_signal_pin(TURN_LEFT_SIGNAL_PIN), turn_signal_off_pin(TURN_SIGNAL_OFF_PIN), turn_signal_state('N') {}

void TurnSignal::begin() {
    pinMode(turn_right_signal_pin, INPUT_PULLUP); // Set the pin as input with pull-up resistor
    pinMode(turn_left_signal_pin, INPUT_PULLUP);
    pinMode(turn_signal_off_pin, INPUT_PULLUP);
}

char TurnSignal::read_signal() {
    if (digitalRead(turn_right_signal_pin) == LOW) {
        turn_signal_state = 'R'; // Right turn signal
    } else if (digitalRead(turn_left_signal_pin) == LOW) {
        turn_signal_state = 'L'; // Left turn signal
    } else if (digitalRead(turn_signal_off_pin) == LOW) {
        turn_signal_state = 'N'; // Turn signal off
    }
    return turn_signal_state;
}
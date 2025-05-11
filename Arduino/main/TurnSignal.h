#define TurnSignal_h
#ifdef TurnSignal_h
#include<Arduino.h>


class TurnSignal {
    public:
        TurnSignal();
        void begin(); // Initialize the turn signal pins
        char read_signal();
    private:
        char turn_signal_state; // 'R' for right, 'L' for left, 'N' for none
        int turn_right_signal_pin; // Pin number for the turn signal
        int turn_left_signal_pin; // Pin number for the turn signal off
        int turn_signal_off_pin; // Pin number for the turn signal off

};
#endif

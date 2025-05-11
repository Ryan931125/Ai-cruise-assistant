#ifndef LED8X8MATRIX_H
#define LED8X8MATRIX_H

#include <Arduino.h>

class LED8x8Matrix {
public:
    // Constructor: dinPin: Data In, csPin: Chip Select, clkPin: Clock
    LED8x8Matrix();

    // Initializes the MAX7219-based LED matrix
    void begin();

    // Clear the display buffer (set all pixels off)
    void clear();

    // Set an individual pixel (x, y) with state (true = ON, false = OFF)
    void setPixel(uint8_t x, uint8_t y, bool state);

    // Update the LED matrix display with the buffer contents
    void updateDisplay();

    void displayGear(char gear); // Display the gear status on the matrix

private:
    uint8_t din;          // Data input pin
    uint8_t cs;           // Chip select pin
    uint8_t clk;          // Clock pin
    uint8_t displayBuffer[8]; // Buffer to hold 8 rows (one byte per row)

    // Low-level function to send a byte to a MAX7219 register
    void sendByte(uint8_t address, uint8_t data);
};

#endif
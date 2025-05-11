#include "LED8x8Matrix.h"

#define DINPIN 30
#define CSPIN 32
#define CLKPIN 34

LED8x8Matrix::LED8x8Matrix()
    : din(DINPIN), cs(CSPIN), clk(CLKPIN)
{
    clear();
}

const uint8_t letterD[8] = {
    0b01111000, // .####...
    0b01000100, // .#....#.
    0b01000010, // .#....#.
    0b01000010, // .#....#.
    0b01000010, // .#....#.
    0b01000010, // .#....#.
    0b01000100, // .#...#..
    0b01111000  // .####...
};

const uint8_t letterR[8] = {
    0b00000000, // 
    0b01000100,
    0b01000100,
    0b01001000,
    0b01111000,
    0b01000100,
    0b01000100,
    0b01111000  // 
};

const uint8_t letterP[8] = {
    0b00000000, // ........
    0b00100000, // .#......
    0b00100000, // .#......
    0b00100000, // .#......
    0b00111100, // .###....
    0b00100010, // .#..#...
    0b00100010, // .#..#...
    0b00111100  // .###....
};

void LED8x8Matrix::begin() {
    pinMode(din, OUTPUT);
    pinMode(cs, OUTPUT);
    pinMode(clk, OUTPUT);
    digitalWrite(cs, HIGH);

    // MAX7219 setup:
    sendByte(0x09, 0x00); // Disable decode mode for all digits
    sendByte(0x0A, 0x0F); // Intensity: adjust brightness (0x00 to 0x0F)
    sendByte(0x0B, 0x07); // Scan limit: display all 8 digits/rows
    sendByte(0x0C, 0x01); // Normal operation mode (turn off shutdown)
    sendByte(0x0F, 0x00); // Disable display test
    updateDisplay();
}

void LED8x8Matrix::clear() {
    for (int i = 0; i < 8; i++) {
        displayBuffer[i] = 0x00;
    }
}

void LED8x8Matrix::setPixel(uint8_t x, uint8_t y, bool state) {
    if (x >= 8 || y >= 8) return; // Out-of-bounds check
    if (state) {
        displayBuffer[y] |= (1 << x);
    } else {
        displayBuffer[y] &= ~(1 << x);
    }
}

void LED8x8Matrix::updateDisplay() {
    // MAX7219 registers 1 to 8 correspond to rows 0 to 7
    for (uint8_t row = 0; row < 8; row++) {
        sendByte(row + 1, displayBuffer[row]);
    }
}

void LED8x8Matrix::displayGear(char gear) {
    clear();
    switch (gear) {
        case 'D':
            for (uint8_t row = 0; row < 8; row++) {
                for (uint8_t col = 0; col < 8; col++) {
                    // Check if the bit corresponding to the current column is set.
                    // Bit 7 is leftmost so shift accordingly.
                    bool pixelOn = (letterD[row] >> (7 - col)) & 0x01;
                    setPixel(col, row, pixelOn);
                }
            }
            break;
        case 'R':
            for (uint8_t row = 0; row < 8; row++) {
                for (uint8_t col = 0; col < 8; col++) {
                    // Check if the bit corresponding to the current column is set.
                    // Bit 7 is leftmost so shift accordingly.
                    bool pixelOn = (letterR[row] >> (7 - col)) & 0x01;
                    setPixel(col, row, pixelOn);
                }
            }
            break;
        case 'P':
            for (uint8_t row = 0; row < 8; row++) {
                for (uint8_t col = 0; col < 8; col++) {
                    // Check if the bit corresponding to the current column is set.
                    // Bit 7 is leftmost so shift accordingly.
                    bool pixelOn = (letterP[row] >> (7 - col)) & 0x01;
                    setPixel(col, row, pixelOn);
                }
            }
            break;
        default:
            break;
    }
    updateDisplay();
}

void LED8x8Matrix::sendByte(uint8_t address, uint8_t data) {
    digitalWrite(cs, LOW);
    // Shift out the address and data with MSB first
    shiftOut(din, clk, MSBFIRST, address);
    shiftOut(din, clk, MSBFIRST, data);
    digitalWrite(cs, HIGH);
}
# 2D Driving Simulator

This project is a 2D driving simulator with three scenes: highway, parking lot, and intersection. The simulator uses Python for the backend physics simulation and React for the frontend visualization.

## Project Structure

```
driving-simulator/
├── backend/
│   ├── main.py           # Main Python server
│   ├── car_physics.py    # Car physics simulation
│   └── arduino_handler.py # Arduino data processing
├── frontend/
│   ├── public/
│   │   └── assets/       # Images and other static files
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── Car.js
│   │   │   ├── Highway.js
│   │   │   ├── ParkingLot.js
│   │   │   └── Intersection.js
│   │   └── utils/
│   │       └── socketHandler.js
│   └── package.json
└── README.md
```

## Features

- 2D driving simulation with realistic physics
- Three different scenes: highway, parking lot, and intersection
- Arduino interface for hardware controls
- Websocket communication between Python backend and React frontend
- Car centered in the window with moving background
- Clear distinction between front and back of the car

## Requirements

### Backend

- Python 3.8+
- WebSockets (`pip install websockets`)
- PySerial (for Arduino communication, `pip install pyserial`)

### Frontend

- Node.js 14+
- React 18
- React Scripts
- WebSocket API (built into modern browsers)

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd driving-simulator/backend
   ```

2. Install the required Python packages:

   ```
   pip install websockets pyserial
   ```

3. Run the Python server:

   ```
   python main.py
   ```

   Optional arguments:

   - `--use-arduino`: Use real Arduino hardware (default: False)
   - `--arduino-port PORT`: Serial port for Arduino (default: /dev/ttyUSB0)
   - `--host HOST`: Host to bind the WebSocket server to (default: localhost)
   - `--port PORT`: Port to bind the WebSocket server to (default: 8765)

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd driving-simulator/frontend
   ```

2. Install the required Node.js packages:

   ```
   npm install
   ```

3. Start the React development server:

   ```
   npm start
   ```

4. Open your browser and go to http://localhost:3000

## Arduino Setup

The Arduino code should send data in the following format:

```
acceleration,deceleration,steering_angle,gear
```

Example:

```
10,5,15,D
```

Where:

- `acceleration` is the acceleration rate (0-100)
- `deceleration` is the deceleration rate (0-100)
- `steering_angle` is the steering angle (-45 to 45 degrees)
- `gear` is the gear ('P', 'D', or 'R')

## Python Interface

The Python backend provides an interface to:

- Set acceleration
- Set deceleration
- Set steering angle
- Set gear (P, D, R)
- Get car speed
- Get car position
- Get car direction

Example Arduino code:

```cpp
#include <Arduino.h>

// Define analog input pins
#define ACCEL_PIN A0
#define BRAKE_PIN A1
#define STEERING_PIN A2

// Define digital input pins
#define GEAR_P_PIN 2
#define GEAR_D_PIN 3
#define GEAR_R_PIN 4

void setup() {
  Serial.begin(9600);

  // Set up input pins
  pinMode(ACCEL_PIN, INPUT);
  pinMode(BRAKE_PIN, INPUT);
  pinMode(STEERING_PIN, INPUT);
  pinMode(GEAR_P_PIN, INPUT_PULLUP);
  pinMode(GEAR_D_PIN, INPUT_PULLUP);
  pinMode(GEAR_R_PIN, INPUT_PULLUP);
}

void loop() {
  // Read analog inputs
  int accelValue = analogRead(ACCEL_PIN);
  int brakeValue = analogRead(BRAKE_PIN);
  int steeringValue = analogRead(STEERING_PIN);

  // Map analog values to appropriate ranges
  int acceleration = map(accelValue, 0, 1023, 0, 100);
  int deceleration = map(brakeValue, 0, 1023, 0, 100);
  int steeringAngle = map(steeringValue, 0, 1023, -45, 45);

  // Read gear inputs
  char gear = 'P'; // Default to Park
  if (digitalRead(GEAR_D_PIN) == LOW) {
    gear = 'D';
  } else if (digitalRead(GEAR_R_PIN) == LOW) {
    gear = 'R';
  }

  // Send data to Python
  Serial.print(acceleration);
  Serial.print(",");
  Serial.print(deceleration);
  Serial.print(",");
  Serial.print(steeringAngle);
  Serial.print(",");
  Serial.println(gear);

  // Delay to prevent flooding the serial port
  delay(100);
}
```

## Usage

### Keyboard Controls

If you don't have Arduino hardware, you can use the keyboard controls:

- Arrow Up: Accelerate
- Arrow Down: Brake/Reverse
- Arrow Left: Steer left
- Arrow Right: Steer right
- P: Park
- D: Drive
- R: Reverse

### Scene Selection

You can switch between scenes using the buttons at the top of the simulator:

- Highway: A simple straight road with lane markings
- Parking Lot: A parking lot with parking spaces and parked cars
- Intersection: A four-way intersection with traffic lights

## Extending the Project

### Adding New Scenes

1. Create a new scene component in `frontend/src/components/`
2. Add the scene to the main App.js file
3. Add the scene to the scene selector in the UI
4. Add the scene to the Python backend in `main.py`

### Improving Physics

You can enhance the car physics in `backend/car_physics.py`:

- Add more realistic friction
- Add inertia
- Add collision detection
- Add skidding behavior

### Adding Multiple Cars

You can add AI-controlled cars by:

1. Expanding the car_physics.py to handle multiple cars
2. Adding logic for car AI behavior
3. Adding car rendering in the frontend

## License

MIT

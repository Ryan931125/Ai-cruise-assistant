"""
Arduino handler module for the driving simulator.
This handles the communication with the Arduino hardware.
"""
import serial
import json
import time
import threading


class ArduinoHandler:
    def __init__(self, port="/dev/ttyUSB0", baudrate=9600):
        """Initialize the Arduino handler.

        Args:
            port (str): Serial port the Arduino is connected to
            baudrate (int): Baud rate for serial communication
        """
        self.port = port
        self.baudrate = baudrate
        self.serial = None
        self.connected = False
        self.data = {
            "acceleration": 0,
            "deceleration": 0,
            "steering_angle": 0,
            "gear": "P"  # Default to Park
        }
        self.running = False
        self.thread = None

    def connect(self):
        """Connect to the Arduino."""
        try:
            self.serial = serial.Serial(self.port, self.baudrate, timeout=1)
            self.connected = True
            print(f"Connected to Arduino on {self.port}")
            return True
        except Exception as e:
            print(f"Failed to connect to Arduino: {e}")
            self.connected = False
            return False

    def disconnect(self):
        """Disconnect from the Arduino."""
        if self.serial and self.serial.is_open:
            self.serial.close()
        self.connected = False
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1)
        print("Disconnected from Arduino")

    def start_reading(self):
        """Start reading data from the Arduino in a separate thread."""
        if not self.connected:
            if not self.connect():
                return False

        self.running = True
        self.thread = threading.Thread(target=self._read_loop)
        self.thread.daemon = True
        self.thread.start()
        return True

    def _read_loop(self):
        """Main loop for reading data from the Arduino."""
        while self.running and self.connected:
            try:
                if self.serial.in_waiting > 0:
                    line = self.serial.readline().decode('utf-8').strip()
                    self._parse_data(line)
            except Exception as e:
                print(f"Error reading from Arduino: {e}")
                self.connected = False
                break
            time.sleep(0.01)  # Small delay to prevent CPU hogging

    def _parse_data(self, data_string):
        """Parse the data received from Arduino.

        Expected format: acceleration,deceleration,steering_angle,gear
        Example: "10,5,15,D"
        """
        try:
            parts = data_string.split(',')
            if len(parts) >= 4:
                self.data["acceleration"] = float(parts[0])
                self.data["deceleration"] = float(parts[1])
                self.data["steering_angle"] = float(parts[2])
                gear = parts[3].strip().upper()
                if gear in ["P", "D", "R"]:
                    self.data["gear"] = gear
        except Exception as e:
            print(f"Error parsing Arduino data: {e}")

    def get_data(self):
        """Get the latest data from the Arduino."""
        return self.data

    def send_command(self, command):
        """Send a command to the Arduino.

        Args:
            command (str): Command to send
        """
        if self.connected and self.serial:
            try:
                self.serial.write(f"{command}\n".encode('utf-8'))
                return True
            except Exception as e:
                print(f"Error sending command to Arduino: {e}")
                return False
        return False

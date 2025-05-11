"""
Car physics module for the driving simulator.
This handles the physics calculations for the car movement.
Fixed to ensure proper movement in Drive and Reverse gears with gradual stopping.
"""
import math
import time
import logging

# Set up logging
logger = logging.getLogger(__name__)


class CarPhysics:
    def __init__(self):
        # Car state
        self.position = {"x": 0, "y": 0}  # Position in the world
        self.speed = 0  # Current speed in pixels/second
        self.direction = 0  # Direction in degrees (0 is up, 90 is right)
        self.gear = "P"  # P: Park, D: Drive, R: Reverse
        self.turn_signal = "N"  # N: None, L: Left, R: Right
        self.handbrake = False  # Handbrake state

        # Car properties
        self.max_speed = 250  # Maximum speed in pixels/second
        self.acceleration_rate = 0  # Current acceleration rate
        self.deceleration_rate = 0  # Current deceleration rate
        self.steering_angle = 0  # Current steering angle
        self.car_length = 80  # Car length in pixels (increased)
        self.car_width = 30  # Car width in pixels (increased)

        # Physics properties
        # Friction coefficient (increased for smoother deceleration)
        self.friction = 0.99
        self.turning_factor = 3.0  # Increased turning sensitivity for sharper turns
        self.last_update_time = time.time()

        # Debug flag
        self.debug = True

    def set_acceleration(self, acceleration):
        """Set the current acceleration rate."""
        # Convert to float to ensure numerical operations work
        acceleration = float(acceleration)
        self.acceleration_rate = acceleration
        if self.debug:
            logger.debug(f"Acceleration set to {acceleration}")

    def set_deceleration(self, deceleration):
        """Set the current deceleration rate."""
        # Convert to float to ensure numerical operations work
        deceleration = float(deceleration)
        self.deceleration_rate = deceleration
        if self.debug:
            logger.debug(f"Deceleration set to {deceleration}")

    def set_steering(self, angle):
        """Set the steering wheel angle."""
        # Convert to float to ensure numerical operations work
        angle = float(angle)
        # Limit steering angle to reasonable values (-45 to 45 degrees)
        self.steering_angle = max(-45, min(45, angle))
        if self.debug:
            logger.debug(f"Steering angle set to {self.steering_angle}")

    def set_turn_signal(self, signal):
        """Set the turn signal (L, R, N)."""
        if signal in ["L", "R", "N"]:
            self.turn_signal = signal
            if self.debug:
                logger.debug(f"Turn signal set to {signal}")
        else:
            logger.warning("Invalid turn signal. Must be 'L', 'R', or 'N'.")

    def set_gear(self, gear):
        """Set the current gear (P, D, R)."""
        if gear in ["P", "D", "R"]:
            old_gear = self.gear
            self.gear = gear
            if gear == "P":
                self.speed = 0  # Stop the car when in Park

            # When changing between D and R, make sure the car stops first
            if (old_gear == "D" and gear == "R") or (old_gear == "R" and gear == "D"):
                # Apply significant deceleration to stop quickly when changing gear direction
                self.speed *= 0.5

            if self.debug:
                logger.debug(f"Gear changed from {old_gear} to {gear}")

    def set_handbrake(self, handbrake):
        """Set the handbrake state (True or False)."""
        if handbrake:
            # Apply significant deceleration when handbrake is engaged
            self.handbrake = True
            if self.debug:
                logger.debug("Handbrake engaged")
        else:
            if self.debug:
                logger.debug("Handbrake released")

    def update(self):
        """Update the car's position and state based on physics."""
        current_time = time.time()
        dt = current_time - self.last_update_time
        self.last_update_time = current_time

        # Apply acceleration based on gear
        if self.gear == "P":
            # In park, car doesn't move
            self.speed = 0
        elif self.gear == "D":
            # In drive, only allow forward motion
            # Ensure the car can't go backward in Drive gear
            if self.speed < 0:
                self.speed = 0
            # Apply acceleration if it's non-zero
            elif self.acceleration_rate > 0:
                self.speed += self.acceleration_rate * dt
            elif self.deceleration_rate > 0:
                # Apply deceleration if it's non-zero
                self.speed -= self.deceleration_rate * dt

            # If acceleration is zero, gradually slow down
            if self.acceleration_rate == 0 and self.speed > 0:
                # If very slow, just stop completely
                if abs(self.speed) < 1.0:
                    self.speed = 0

        elif self.gear == "R":
            # In reverse, only allow backward motion
            if self.speed > 0:
                self.speed = 0
            elif self.acceleration_rate > 0:
                # Negative acceleration in reverse
                self.speed -= self.acceleration_rate * dt
            elif self.deceleration_rate > 0:
                # Apply deceleration if it's non-zero
                self.speed += self.deceleration_rate * dt
            # Ensure the car can't go forward in Reverse gear

            # If acceleration is zero, gradually slow down
            if self.acceleration_rate == 0 and self.speed < 0:

                # If very slow, just stop completely
                if abs(self.speed) < 1.0:
                    self.speed = 0

        # Apply standard friction
        self.speed *= self.friction

        # Limit speed to max_speed
        self.speed = max(-self.max_speed, min(self.max_speed, self.speed))

        # Update direction based on steering angle and speed
        # Only turn if the car is moving
        if abs(self.speed) > 0.1:
            # Apply more turning effect at higher speeds
            turn_amount = self.steering_angle * self.turning_factor * \
                (abs(self.speed) / self.max_speed) * dt

            # If in reverse, invert the steering effect
            if self.gear == "R":
                turn_amount = -turn_amount

            self.direction += turn_amount

            # Normalize direction to -180 to 180
            self.direction = ((self.direction+180) % 360)-180

        # Calculate movement based on speed and direction
        rad_direction = math.radians(self.direction)
        dx = math.sin(rad_direction) * self.speed * dt
        dy = -math.cos(rad_direction) * self.speed * dt

        # Update position (in this simulation, we're keeping the car fixed
        # at the center and moving the background)
        # These values will be used to move the background
        self.position["x"] += dx
        self.position["y"] += dy

        # Debug log significant changes
        if abs(dx) > 0.5 or abs(dy) > 0.5:
            logger.debug(
                f"Car moved: dx={dx:.2f}, dy={dy:.2f}, speed={self.speed:.2f}, dir={self.direction:.1f}")

    def get_state(self):
        """Get the current state of the car for rendering."""
        return {
            "position": self.position,
            "speed": self.speed,
            "direction": self.direction,
            "gear": self.gear,
            "steering_angle": self.steering_angle,
            "acceleration_rate": self.acceleration_rate,
            "deceleration_rate": self.deceleration_rate,
            "car_length": self.car_length,
            "car_width": self.car_width,
            "turn_signal": self.turn_signal
        }

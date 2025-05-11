"""
Main server module for the driving simulator.
This handles the WebSocket communication between the Python backend and React frontend.
Fixed to ensure stable connection while moving in any gear.
"""
import asyncio
import json
import websockets
import argparse
import logging
from car_physics import CarPhysics
from pyserial import ArduinoReader
from state_manager import StateManager


# Set up logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class DrivingSimulatorServer:
    def __init__(self, use_arduino=False, arduino_port="/dev/ttyUSB0",
                 host="localhost", port=8765):
        """Initialize the driving simulator server.

        Args:
            use_arduino (bool): Whether to use real Arduino hardware
            arduino_port (str): Serial port for the Arduino
            host (str): Host to bind the WebSocket server to
            port (int): Port to bind the WebSocket server to
        """
        self.host = host
        self.port = port
        self.car_physics = CarPhysics()
        self.state_manager = StateManager(self.car_physics)

        # Set up Arduino handler
        self.arduino = ArduinoReader()

        self.connected_clients = set()
        self.current_scene = "highway"  # Default scene
        self.running = False

    async def handle_connection(self, websocket):
        """Handle a WebSocket connection."""
        # Add the new client to our set
        self.connected_clients.add(websocket)
        client_id = id(websocket)  # Generate a unique ID for logging
        logger.info(
            f"Client {client_id} connected. Total clients: {len(self.connected_clients)}")

        try:
            # Send initial state to the client
            await self.send_state(websocket)

            # Handle messages from the client
            async for message in websocket:
                try:
                    await self.handle_message(websocket, message)
                except Exception as e:
                    # Handle message errors gracefully without closing the connection
                    logger.error(
                        f"Error processing message from client {client_id}: {e}")
        except websockets.exceptions.ConnectionClosed as e:
            logger.info(f"Client {client_id} connection closed: {e}")
        except Exception as e:
            logger.error(f"Unexpected error with client {client_id}: {e}")
        finally:
            # Remove the client from our set
            self.connected_clients.remove(websocket)
            logger.info(
                f"Client {client_id} disconnected. Total clients: {len(self.connected_clients)}")

    async def handle_message(self, websocket, message):
        """Handle a message from a client."""
        client_id = id(websocket)  # For consistent logging

        try:
            data = json.loads(message)
            # Log the received message
            logger.info(f"Received message from client {client_id}: {data}")

            # Handle different message types
            if data.get("type") == "set_scene":
                # Change the scene
                scene = data.get("scene")
                if scene in ["highway", "parking_lot", "intersection"]:
                    self.current_scene = scene
                    logger.info(
                        f"Scene changed to {scene} by client {client_id}")

                    # Reset car position when changing scenes
                    self.car_physics.position = {"x": 0, "y": 0}
                    self.car_physics.speed = 0
                    self.car_physics.direction = 0
                    self.car_physics.gear = "P"

                    # Notify all clients about the scene change
                    await self.broadcast({"type": "scene_changed", "scene": scene})

            elif data.get("type") == "manual_control":
                # Apply manual control from the web interface
                controls = data.get("controls", {})
                # Log the control commands
                logger.info(
                    f"Manual control from client {client_id}: {controls}")

                # Update car physics based on controls
                if "acceleration" in controls:
                    self.car_physics.set_acceleration(controls["acceleration"])

                if "steering_angle" in controls:
                    self.car_physics.set_steering(controls["steering_angle"])

                if "gear" in controls:
                    # Set gear (P, D, R)
                    self.car_physics.set_gear(controls["gear"])

                # Debug log current car state
                logger.debug(f"Current car state: speed={self.car_physics.speed}, "
                             f"dir={self.car_physics.direction}, "
                             f"gear={self.car_physics.gear}, "
                             f"pos={self.car_physics.position}")

            elif data.get("type") == "request_state":
                # Client is requesting the current state
                await self.send_state(websocket)

        except json.JSONDecodeError:
            logger.error(
                f"Invalid JSON received from client {client_id}: {message}")
        except Exception as e:
            logger.error(
                f"Error handling message from client {client_id}: {e}")
            # Re-raise to be caught by the outer try block
            raise

    async def send_state(self, websocket):
        """Send the current state to a specific client."""
        try:
            state = {
                "type": "state_update",
                "car": self.car_physics.get_state(),
                "scene": self.current_scene
            }
            await websocket.send(json.dumps(state))
            logger.debug(f"Sent state to client {id(websocket)}")
        except Exception as e:
            logger.error(f"Error sending state to client {id(websocket)}: {e}")
            raise

    async def broadcast(self, message):
        """Broadcast a message to all connected clients."""
        if not self.connected_clients:
            return  # No clients to broadcast to

        # Log the broadcast
        logger.debug(
            f"Broadcasting message to {len(self.connected_clients)} clients: {message}")

        # Create a list to track clients with failed sends
        failed_clients = []

        for client in self.connected_clients:
            try:
                await client.send(json.dumps(message))
            except Exception as e:
                client_id = id(client)
                logger.error(f"Failed to send to client {client_id}: {e}")
                failed_clients.append(client)

        # Remove any clients that failed to receive the broadcast
        for failed in failed_clients:
            if failed in self.connected_clients:
                self.connected_clients.remove(failed)
                logger.info(f"Removed client {id(failed)} due to send failure")

    async def update_loop(self):
        logger.info("Starting update loop")
        """Main update loop for the simulation."""
        try:
            last_time = asyncio.get_event_loop().time()
            update_count = 0  # Counter for logging purposes

            while self.running:
                try:
                    # Calculate time elapsed
                    current_time = asyncio.get_event_loop().time()
                    dt = current_time - last_time
                    last_time = current_time

                    # Apply friction more aggressively to avoid system instability
                    if abs(self.car_physics.speed) < 0.1:
                        self.car_physics.speed = 0

                    # Get data from Arduino if connected
                    if self.arduino.connected:
                        arduino_data = self.arduino.get_data()
                        # Apply Arduino data to car physics
                        if arduino_data:  # Check if we received valid data
                            if "acc" in arduino_data:
                                self.car_physics.set_acceleration(
                                    int(max(700 - arduino_data["acc"], 0)/4))

                            if "dec" in arduino_data:
                                self.car_physics.set_deceleration(
                                    int(max(400 - arduino_data["dec"], 0)/15))

                            if "steeringAngle" in arduino_data:
                                self.car_physics.set_steering(
                                    arduino_data["steeringAngle"]*3)

                            if "gear" in arduino_data:
                                self.car_physics.set_gear(arduino_data["gear"])

                            if "turnSignal" in arduino_data:
                                self.car_physics.set_turn_signal(
                                    arduino_data["turnSignal"])

                            if "handbreak" in arduino_data:
                                self.car_physics.set_handbrake(
                                    arduino_data["handbreak"])

                            if "turnSignal" in arduino_data:
                                self.car_physics.set_turn_signal(
                                    arduino_data["turnSignal"])

                            # Log the applied Arduino data at debug level
                            logger.debug(
                                f"Applied Arduino data: {arduino_data}")

                    # Update car physics
                    old_pos = dict(self.car_physics.position)
                    self.car_physics.update()

                    # Log if position changes significantly
                    new_pos = self.car_physics.position
                    if abs(new_pos["x"] - old_pos["x"]) > 1 or abs(new_pos["y"] - old_pos["y"]) > 1:
                        logger.debug(f"Car position changed: {old_pos} -> {new_pos}, "
                                     f"speed={self.car_physics.speed}, dir={self.car_physics.direction}")

                    # Periodically log update count to verify loop is running
                    update_count += 1
                    if update_count % 600 == 0:  # Log roughly every 10 seconds
                        logger.info(
                            f"Update loop running. Count: {update_count}")
                    if update_count % 60 == 0:  # Log every second
                        self.state_manager.get_complete_state()

                    # Broadcast state to all clients
                    if self.connected_clients:
                        await self.broadcast({
                            "type": "state_update",
                            "car": self.car_physics.get_state(),
                            "scene": self.current_scene
                        })

                    # Sleep for a short time to maintain a stable frame rate
                    # Aiming for approximately 60 FPS
                    await asyncio.sleep(1/60)

                except Exception as e:
                    # Catch and log errors in the update loop but keep it running
                    logger.error(f"Error in update cycle: {e}")
                    await asyncio.sleep(1/10)  # Slower retry rate on error

        except asyncio.CancelledError:
            logger.info("Update loop cancelled")
        except Exception as e:
            logger.error(f"Fatal error in update loop: {e}")
            self.running = False

    async def start_server(self):
        """Start the WebSocket server."""
        # Connect to Arduino
        # self.arduino.connect()
        # self.arduino.start_reading()

        # Start the update loop
        self.running = True
        update_task = asyncio.create_task(self.update_loop())

        try:
            # Start the WebSocket server
            async with websockets.serve(
                self.handle_connection,
                self.host,
                self.port,
                ping_interval=30,  # Send ping every 30 seconds
                ping_timeout=10    # Wait 10 seconds for pong response
            ):
                logger.info(f"Server started at ws://{self.host}:{self.port}")
                await asyncio.Future()  # Run forever
        except Exception as e:
            logger.error(f"Server error: {e}")
        finally:
            # Clean up
            self.running = False
            update_task.cancel()
            try:
                await update_task
            except asyncio.CancelledError:
                pass
            self.arduino.disconnect()
            logger.info("Server shutdown")

    def run(self):
        """Run the server."""
        try:
            asyncio.run(self.start_server())
        except KeyboardInterrupt:
            logger.info("Server stopped by user")
        except Exception as e:
            logger.error(f"Error running server: {e}")
        finally:
            # Clean up
            self.running = False
            # self.arduino.disconnect()
            logger.info("Server shutdown complete")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Driving Simulator Server')
    parser.add_argument('--use-arduino', action='store_true',
                        help='Use real Arduino hardware instead of mock')
    parser.add_argument('--arduino-port', default='/dev/ttyUSB0',
                        help='Serial port for Arduino connection')
    parser.add_argument('--host', default='localhost',
                        help='Host to bind the WebSocket server to')
    parser.add_argument('--port', type=int, default=8765,
                        help='Port to bind the WebSocket server to')
    parser.add_argument('--debug', action='store_true',
                        help='Enable debug logging')

    args = parser.parse_args()

    # Set log level
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    server = DrivingSimulatorServer(
        use_arduino=args.use_arduino,
        arduino_port=args.arduino_port,
        host=args.host,
        port=args.port
    )
    server.run()


if __name__ == "__main__":
    main()

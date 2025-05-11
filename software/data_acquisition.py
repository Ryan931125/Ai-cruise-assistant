# data_acquisition.py

import os
import time
import argparse
from main import main_loop
from driving_simulator.backend.pyserial import ArduinoReader

# —— command-line flags —— #
parser = argparse.ArgumentParser(
    description="Data acquisition with optional test mode"
)
parser.add_argument(
    "--scenario",
    choices=["highway", "intersection", "parking"],
    default="highway",
    help="Choose scenario for real or test mode"
)
parser.add_argument(
    "--test",
    action="store_true",
    help="Run in test mode with canned sample data"
)
args = parser.parse_args()
SCENARIO = args.scenario

# —— sample data generator —— #


def get_test_samples(scenario):
    """
    Return a list of data dicts that exercise each rule for 'scenario'.
    """
    common = {
        "scenario": scenario,
        "throttle": 0,
        "brake": 0,
        "steering_angle": 0.0,
        "turn_signal": False,
        "handbrake": False,
        "speed": 0.0,
        "front_distance": float('inf'),
        "safe_distance_threshold": 10.0,
        "steering_change": False,
        "mode": "forward",
        "corner_distances": [0.0, 0.0, 0.0, 0.0],
        "distance_sum_threshold": 12.0
    }

    samples = []
    if scenario == "highway":
        # overspeed
        s1 = common.copy()
        s1.update(speed=120.0)
        samples.append(s1)
        # unsafe_distance
        s2 = common.copy()
        s2.update(front_distance=5.0)
        samples.append(s2)
        # lane_change_no_signal
        s3 = common.copy()
        s3.update(steering_change=True, turn_signal=False)
        samples.append(s3)

    elif scenario == "intersection":
        # missing_signal
        s1 = common.copy()
        s1.update(steering_change=True, turn_signal=False)
        samples.append(s1)
        # overspeed
        s2 = common.copy()
        s2.update(speed=60.0)
        samples.append(s2)
        # harsh_acceleration
        s3 = common.copy()
        s3.update(throttle=80)
        samples.append(s3)

    elif scenario == "parking":
        # handbrake_not_released
        s1 = common.copy()
        s1.update(handbrake=True, mode="reverse")
        samples.append(s1)
        # poor_reverse_control
        s2 = common.copy()
        s2.update(mode="reverse", steering_angle=50.0)
        samples.append(s2)
        # distance_sum_exceeded
        s3 = common.copy()
        s3.update(corner_distances=[4.0, 4.0, 4.0, 4.0])
        samples.append(s3)

    return samples

# —— real-time stubs —— #


def get_speed(rpm: float) -> float:
    # dummy conversion
    return speed


_prev_angle = None


def detect_steering_change(curr_angle: float, threshold: float = 5.0) -> bool:
    global _prev_angle
    if _prev_angle is None:
        _prev_angle = curr_angle
        return False
    changed = abs(curr_angle - _prev_angle) > threshold
    _prev_angle = curr_angle
    return changed


def get_front_distance() -> float:
    return float('inf')


if __name__ == "__main__":
    # ensure output folder exists
    os.makedirs("./error_data", exist_ok=True)

    if args.test:
        print(f"*** RUNNING IN TEST MODE ({SCENARIO}) ***")
        for idx, sample in enumerate(get_test_samples(SCENARIO), start=1):
            # mark this run as test
            sample["test_mode"] = True
            print(f"\nTest sample #{idx}: {sample}")
            main_loop(sample)
        print("\nTest mode complete. CSV files written to ./error_data/")
    else:
        print(f"Starting real-time acquisition in '{SCENARIO}' mode.")
        ard = ArduinoReader(port="/dev/ttyACM0", baud=115200)
        try:
            while True:
                # read from Arduino
                throttle = ard.get_acceleration()
                brake = ard.get_deceleration()

                speed = get_speed()
                handbrake = ard.get_handbreak()
                gear = ard.get_gear().upper()
                mode = "reverse" if gear == "R" else "forward"

                angle = ard.get_angle()
                steering_change = detect_steering_change(angle)
                turn_signal = ard.get_turn_signal()
                front_dist = get_front_distance()

                data = {
                    "scenario": SCENARIO,
                    "throttle": throttle,
                    "brake": brake,
                    "steering_angle": angle,
                    "turn_signal": turn_signal,
                    "handbrake": handbrake,
                    "speed": speed,
                    "front_distance": front_dist,
                    "safe_distance_threshold": 10.0,
                    "steering_change": steering_change,
                    "mode": mode,
                    "corner_distances": [],             # fill for parking
                    "distance_sum_threshold": 12.0     # set for parking

                }

                main_loop(data)
                time.sleep(0.5)

        finally:
            ard.close()

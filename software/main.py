# main.py

"""
Scenario-based error-detection engine.

This module provides:
  • check_highway(data)      → list of highway events
  • check_intersection(data) → list of intersection events
  • check_parking(data)      → list of parking events
  • write_error(...)         → appends one event to <scenario>_errors.csv
  • main_loop(data)          → dispatches data to the right checker and logs any events

Import and call main_loop(data) from your data_acquisition script.
"""

import csv
import datetime
from typing import Dict, List
from time import sleep

def check_highway(data: Dict) -> List[str]:
    events = []
    if data.get("speed", 0) > 100:
        events.append("overspeed")
    if data.get("front_distance", float('inf')) < data.get("safe_distance_threshold", 0):
        events.append("unsafe_distance")
    if data.get("steering_change") and not data.get("turn_signal"):
        events.append("lane_change_no_signal")
    return events

def check_intersection(data: Dict) -> List[str]:
    events = []
    if data.get("steering_change") and not data.get("turn_signal"):
        events.append("missing_signal")
    if data.get("speed", 0) > 50:
        events.append("overspeed")
    if data.get("throttle", 0) > 70:
        events.append("harsh_acceleration")
    return events

def prompt_for_event(event: str) -> str:
    """
    Return a detailed, driver‑friendly English prompt for the given event code.
    """
    prompts = {
        "overspeed":
            "You are currently exceeding the speed limit. Please slow down to a safe speed.",
        "unsafe_distance":
            "You are following the vehicle ahead too closely. Ease off the accelerator or brake gently to maintain at least a two‑second gap.",
        "lane_change_no_signal":
            "You changed lanes without signaling. Next time, turn on your indicator well before you move.",
        "missing_signal":
            "You are about to turn at the intersection. Please activate your turn signal to alert other drivers and pedestrians.",
        "harsh_acceleration":
            "Your acceleration was too aggressive, increasing fuel consumption and traction loss risk. Apply the throttle smoothly.",
        "handbrake_not_released":
            "The parking brake is still engaged. Release it completely before driving to avoid brake damage.",
        "poor_reverse_control":
            "Your steering angle is too sharp while reversing. Make gentle adjustments to keep the vehicle under control.",
        "distance_sum_exceeded":
            "The vehicle is not centered in the parking bay—the combined corner distances are too large. Realign and park within the lines."
    }
    return prompts.get(event, "Unknown event.")


def check_parking(data: Dict) -> List[str]:
    events = []

    # 1) Handbrake still engaged
    if data.get("handbrake", False):
        events.append("handbrake_not_released")

    # 2) In reverse gear, too-sharp steering (> 40°)
    if data.get("mode") == "reverse" and abs(data.get("steering_angle", 0)) > 40:
        events.append("poor_reverse_control")

    # 3) Sum of four corner-distance measurements is too large
    corners   = data.get("corner_distances", [])
    threshold = data.get("distance_sum_threshold", 0.0)
    if len(corners) == 4 and sum(corners) > threshold:
        events.append("distance_sum_exceeded")

    return events

def write_error(scenario: str, event: str, data: Dict):
    """
    Append one error record to ./error_data/<scenario>_errors.csv
    or to ./error_data/<scenario>_errors_test.csv if data['test_mode'] is True.
    """
    is_test = data.get("test_mode", False)
    suffix = "_test" if is_test else ""
    filename = f"./error_data/{scenario}_errors{suffix}.csv"

    header = [
        "timestamp", "scenario", "event","prompt",
        "throttle", "brake", "steering_angle",
        "turn_signal", "handbrake",
        "speed", "front_distance", "safe_distance_threshold",
        "steering_change", "mode",
        # parking-only fields:
        "corner_distances", "distance_sum_threshold"
    ]

    # create with header if new
    try:
        with open(filename, mode="x", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(header)
    except FileExistsError:
        pass

    # append the row
    with open(filename, mode="a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow([
            datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            scenario,
            event,
            prompt_for_event(event),
            data.get("throttle"),
            data.get("brake"),
            data.get("steering_angle"),
            data.get("turn_signal"),
            data.get("handbrake"),
            data.get("speed"),
            data.get("front_distance"),
            data.get("safe_distance_threshold"),
            data.get("steering_change"),
            data.get("mode"),
            data.get("corner_distances"),
            data.get("distance_sum_threshold"),
        ])
    print("error detected!", event, "\nsleep for 10 seconds")
    sleep(10)
    print("resuming")

def main_loop(data: Dict):
    """
    Choose the appropriate checker based on data["scenario"],
    collect any events, and log each one.
    """
    scenario = data.get("scenario", "")

    if scenario == "highway":
        events = check_highway(data)
    elif scenario == "intersection":
        events = check_intersection(data)
    elif scenario == "parking":
        events = check_parking(data)
    else:
        events = []

    for ev in events:
        write_error(scenario, ev, data)

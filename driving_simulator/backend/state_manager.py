import os
import csv
import datetime
import platform
import threading  # so TTS/playback doesn’t block
import subprocess
import sys
from API_Test.gemini_to_speech import gemini_to_speech


# ── prompt dictionary (move it outside the method) ──────────────────────
EVENT_PROMPTS = {
    "overspeed":              "請提醒使用者，並給予改正建議：駕駛者目前超速，應減速行駛。",
    "poor_direction_control": "請提醒使用者，並給予改正建議：駕駛者目前方向盤轉動過急，應輕緩調整方向。",
    "unsafe_distance":        "請提醒使用者，並給予改正建議：駕駛者目前與前車距離過近，應保持安全距離。",
    "lane_change_no_signal":  "請提醒使用者，並給予改正建議：駕駛者未打方向燈就變換車道，應在變道前提前打燈。",
    "missing_signal":         "請提醒使用者，並給予改正建議：駕駛者即將轉彎，應打方向燈提醒其他用路人。",
    "harsh_deceleration":     "請提醒使用者，並給予改正建議：駕駛者煞車過猛，應慢慢剎車。",
    "handbrake_not_released": "請提醒使用者，並給予改正建議：駕駛者未放下手煞車，應在行駛前放下手煞車。",
    "poor_reverse_control":   "請提醒使用者，並給予改正建議：駕駛者倒車時方向盤轉動過急，應輕緩調整方向。",
    "distance_sum_exceeded":  "請提醒使用者，並給予改正建議：車輛未停於車位中央，應在白線內停好。",
}

_SPEAK_LOCK = threading.Lock()   # one playback at a time


def _speak_background(prompt_txt: str, mp3_path: str):
    """Generate + play TTS (non‑blocking, one at a time)."""
    if not _SPEAK_LOCK.acquire(blocking=False):
        return                       # skip if another playback active
    try:
        _, out_file = gemini_to_speech(
            prompt_txt,
            instruction="你是駕駛的小幫手，請用繁體中文簡潔提醒使用者如何更正駕駛行為。可以用詼諧的語氣，不要都用老兄大姐開頭，勿超過三十字",
            speaking_rate=1.35,
            output_filename=mp3_path
        )
        if out_file and os.path.exists(out_file):
            player = "afplay" if platform.system() == "Darwin" else "mpg123"
            os.system(f"{player} '{out_file}'")
    finally:
        _SPEAK_LOCK.release()


class StateManager:
    def __init__(self, car_physics):
        self.car_physics = car_physics

    # simple getters -----------------------------------------
    def get_speed(self): return self.car_physics.speed
    def get_direction(self): return self.car_physics.direction
    def get_gear(self): return self.car_physics.gear
    def get_position(self): return self.car_physics.position
    def get_acceleration_rate(self): return self.car_physics.acceleration_rate
    def get_steering_angle(self): return self.car_physics.steering_angle

    # main routine -------------------------------------------
    def get_complete_state(self):
        state = {
            "speed":             self.get_speed(),
            "direction":         self.get_direction(),
            "gear":              self.get_gear(),
            "position":          self.get_position().copy(),
            "acceleration_rate": self.get_acceleration_rate(),
            "steering_angle":    self.get_steering_angle(),
            "deceleration_rate": self.car_physics.deceleration_rate,
            "handbrake":         self.car_physics.handbrake,
            "turn_signal":       self.car_physics.turn_signal,
        }

        # detect violations
        errors = []
        if state["speed"] > 180:
            errors.append("overspeed")
        elif state["deceleration_rate"] > 16:
            errors.append("harsh_deceleration")
        elif abs(state["steering_angle"]) > 29:
            errors.append("poor_direction_control")
        elif state["turn_signal"] == "N" and state["steering_angle"] > 14:
            errors.append("lane_change_no_signal")

        if state["handbrake"]:
            print("entering parking space")
            subprocess.run(
                [sys.executable, "-m", "drive_report", "--last", "50"],
                check=True,
            )

        if errors:
            # ---- CSV log -----------------------------------
            csv_dir = os.path.join(os.getcwd(), "error_data")
            os.makedirs(csv_dir, exist_ok=True)
            csv_path = os.path.join(csv_dir, "state_errors.csv")

            header = ["timestamp", "errors"] + list(state.keys())
            row = [
                datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                ";".join(errors)
            ] + [state[k] for k in state]

            first = not os.path.exists(csv_path)
            with open(csv_path, "a", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                if first:
                    w.writerow(header)
                w.writerow(row)

            # ---- speech prompt -----------------------------
            first_err = errors[0]
            prompt_txt = EVENT_PROMPTS.get(
                first_err,
                "請提醒使用者：發生未知錯誤，請注意駕駛安全。"
            )

            audio_dir = os.path.join(os.getcwd(), "audio_feedback")
            os.makedirs(audio_dir, exist_ok=True)
            ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            mp3_path = os.path.join(audio_dir, f"{first_err}_{ts}.mp3")

            threading.Thread(
                target=_speak_background,
                args=(prompt_txt, mp3_path),
                daemon=True
            ).start()

        return state

# drive_report.py
"""
Generate a concise post‑drive feedback (Chinese) by analysing only the
recent N rows of ./error_data/state_errors.csv – **no numerical score**.

It prints and plays (synchronously) a spoken summary of the most‑frequent
mistakes — no background threads involved.

Example
-------
    from drive_report import generate_post_drive_feedback
    generate_post_drive_feedback(last_n=40, speak=True)

CLI
---
    python -m drive_report                 # last 50 rows, speak aloud
    python -m drive_report --last 30 --mute
"""

from __future__ import annotations
import os
import csv
import platform
import argparse
from collections import Counter, deque
from datetime import datetime

from API_Test.gemini_to_speech import gemini_to_speech


# ─────────────────────────────────────────────
# Chinese labels
# ─────────────────────────────────────────────
LABEL_ZH = {
    "overspeed":             "超速",
    "unsafe_distance":       "車距過近",
    "lane_change_no_signal": "變換車道未打方向燈",
    "missing_signal":        "轉彎前未打方向燈",
    "harsh_deceleration":    "煞車過猛",
    "handbrake_not_released": "未放手煞車",
    "poor_reverse_control":  "倒車控制不當",
    "distance_sum_exceeded": "停車未置中",
}

# ─────────────────────────────────────────────
# Tail CSV while keeping header
# ─────────────────────────────────────────────


def _tail_csv(path: str, last_n: int) -> list[dict]:
    """Return the last `last_n` data‑rows as dicts (preserve header)."""
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)         # first line = header
        if header is None:
            return []
        dq: deque[list[str]] = deque(maxlen=last_n)
        for row in reader:
            dq.append(row)
    return [dict(zip(header, row)) for row in dq]

# ─────────────────────────────────────────────
# Synchronous speech helper
# ─────────────────────────────────────────────


def _speak(text: str, audio_dir: str) -> None:
    """Generate an MP3 via Gemini‑TTS and play it synchronously."""
    os.makedirs(audio_dir, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    mp3 = os.path.join(audio_dir, f"feedback_{ts}.mp3")

    _, out_file = gemini_to_speech(
        text,
        instruction="你是一位駕駛教練，請用繁體中文簡潔說明下列駕駛表現與改進建議，請用一百五十字內完成回答",
        speaking_rate=1.1,
        output_filename=mp3
    )

    if out_file and os.path.exists(out_file):
        player = "afplay" if platform.system() == "Darwin" else "mpg123"
        os.system(f"{player} '{out_file}'")
    else:
        print("[WARN] TTS generation failed.")

# ─────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────


def generate_post_drive_feedback(
    csv_path: str | None = None,
    last_n: int = 50,
    speak: bool = True
) -> dict:
    """
    Analyse the last `last_n` rows, print & (optionally) speak feedback.

    Returns {"rows_considered": int, "summary": str, "counts": Counter}
    """
    if csv_path is None:
        csv_path = os.path.join(os.getcwd(), "error_data", "state_errors.csv")

    if not os.path.exists(csv_path):
        msg = "沒有偵測到任何錯誤，表現優秀！"
        print(msg)
        if speak:
            _speak(msg, os.path.join(os.getcwd(), "audio_feedback"))
        return {"rows_considered": 0, "summary": msg, "counts": Counter()}

    rows = _tail_csv(csv_path, last_n)
    if not rows:
        msg = "檔案存在，但沒有可用紀錄行。"
        print(msg)
        return {"rows_considered": 0, "summary": msg, "counts": Counter()}

    counts = Counter()
    for r in rows:
        for err in r["errors"].split(";"):
            if err:
                counts[err] += 1

    lines = [
        f"最近 {len(rows)} 筆紀錄統計（{datetime.now():%Y-%m-%d %H:%M:%S}）："
    ]
    if not counts:
        lines.append("恭喜！最近行程沒有偵測到任何違規或危險行為。")
    else:
        lines.append("需改進項目：")
        for err, n in counts.most_common():
            lines.append(f"  • {LABEL_ZH.get(err, err)}：{n} 次")
        lines.append("請留意以上高頻違規行為，以提高行車安全。")

    summary = "\n".join(lines)
    print(summary)

    if speak:
        _speak(summary, os.path.join(os.getcwd(), "audio_feedback"))

    return {"rows_considered": len(rows), "summary": summary, "counts": counts}


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────
if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Post‑drive feedback (no score)")
    p.add_argument("--csv", help="Path to state_errors.csv")
    p.add_argument("--last", type=int, default=50,
                   help="Number of recent rows to analyse (default 50)")
    p.add_argument("--mute", action="store_true",
                   help="Do not speak feedback aloud")
    args = p.parse_args()

    generate_post_drive_feedback(csv_path=args.csv,
                                 last_n=args.last,
                                 speak=not args.mute)

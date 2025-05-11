import serial
import struct
import threading
import time


class ArduinoReader:
    """Continuously reads binary packets from an Arduino."""

    _FMT = "<BffiBcc"         # header, float, float, float   ⇒ 1+4+4+1 = 10 bytes
    _SIZE = struct.calcsize(_FMT)
    _HDR = 0xAA
    connected = True

    def __init__(self, baud=115200):
        self._ser = serial.Serial("/dev/tty.usbmodem101", baud, timeout=1)
        time.sleep(2)         # let Arduino reset
        self._lock = threading.Lock()
        self._vals = dict(acc=0.0,
                          dec=0.0,
                          steeringAngle=0,
                          handbreak=False,
                          gear='N',
                          turnSignal='N'
                          )
        self._run = True
        self._t = threading.Thread(target=self._reader, daemon=True)
        self._t.start()

    # ---------- public API ----------
    def get_acceleration(self): return self._vals["acc"]
    def get_deceleration(self): return self._vals["dec"]
    def get_steeringAngle(self): return self._vals["steeringAngle"]
    def get_handbreak(self): return self._vals["handbreak"]
    def get_gear(self): return self._vals["gear"]
    def get_turnSignal(self): return self._vals["turnSignal"]

    def get_data(self):
        with self._lock:
            return self._vals.copy()

    def close(self):
        self._run = False
        self._t.join()
        self._ser.close()

    # ---------- background thread ----------
    def _reader(self):
        while self._run:
            # look for header byte
            if self._ser.read(1) != bytes([self._HDR]):
                continue
            pkt = self._ser.read(self._SIZE - 1)   # rest of frame
            if len(pkt) != self._SIZE - 1:
                continue
            _, _acc, _dec, _steeringAngle, _handbreak, _gear, _turnSignal = struct.unpack(
                self._FMT, bytes([self._HDR]) + pkt)
            with self._lock:
                self._vals.update(
                    acc=_acc,
                    dec=_dec,
                    steeringAngle=_steeringAngle,
                    handbreak=bool(_handbreak),
                    gear=_gear.decode('utf-8'),
                    turnSignal=_turnSignal.decode('utf-8')
                )


# -------------- usage demo --------------
if __name__ == "__main__":
    ard = ArduinoReader()        # mac/Linux
    # ard = ArduinoReader("COM7")              # Windows
    try:
        while True:
            print("accel =", ard.get_acceleration(),
                  "decel =", ard.get_deceleration(),
                  "steering_wheel =", ard.get_steeringAngle(),
                  "handbreak =", ard.get_handbreak(),
                  "gear =", ard.get_gear(),
                  "turnSignal =", ard.get_turnSignal())
            time.sleep(0.1)
    finally:
        ard.close()

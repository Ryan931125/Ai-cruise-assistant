# ai-cruise-assistant

An AI-powered driving assistant that monitors vehicle telemetry in real time, detects unsafe behaviors across highway, intersection, and parking scenarios, logs events, and provides spoken corrective prompts via TTS.

## Features

- Scenario-based error detection  
  • Overspeed, unsafe distance, missing signals, harsh acceleration, etc.  
  • Customizable thresholds and modes (highway, intersection, parking)  
- Persistent logging  
  • CSV output with timestamp, event, raw telemetry, and human-readable prompt  
  • Option for test mode to generate sample data  
- Real-time spoken feedback  
  • Integrates Google Gemini + Cloud Text-to-Speech (TTS)  
  • Non-blocking playback of concise, context-aware prompts  
- Frontend simulator  
  • 2D React-based driving scenes (highway, intersection, parking lot)  
  • Live telemetry via WebSocket from Python backend  
  • Keyboard and touch controls, turn signals, hazards, gear selection  

## Repository Structure

```
MeganNTU/
├── .gitignore
├── README.md               ← this file
├── software/
│   ├── main.py             # core error-detection engine
│   └── data_acquisition.py # CLI & Arduino integration
├── error_data/             # auto-generated CSV logs
├── audio_feedback/         # generated TTS MP3 files
├── driving_simulator/
│   ├── backend/            # Python WebSocket server & state manager
│   └── frontend/           # React app for visualization & controls
└── Arduino/                # Arduino firmware for sensors & controls
```

## Getting Started

### Prerequisites

- Python 3.8+  
- Node.js 14+ & npm  
- Arduino IDE (for firmware)  
- Google Cloud TTS credentials  
- Google Gemini API key  

### Installation

1. Clone the repo  
   ```bash
   git clone https://github.com/your-org/ai-cruise-assistant.git
   cd ai-cruise-assistant
   ```
2. Python deps  
   ```bash
   cd software
   pip install -r requirements.txt
   ```
3. Frontend deps  
   ```bash
   cd ../driving_simulator/frontend
   npm install
   ```
4. Arduino  
   - Open `Arduino/main/main.ino` in Arduino IDE and upload to your board

### Configuration

- Copy your Google credentials  
  ```bash
  export GOOGLE_API_KEY="…”  
  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
  ```
- Adjust thresholds and ports in `software/data_acquisition.py` as needed

## Usage

### Test mode (software only)

```bash
cd software
python data_acquisition.py --scenario highway --test
```
Generates sample events and writes CSVs under `error_data/`.

### Real-time mode

```bash
cd software
python data_acquisition.py --scenario parking
```
Starts reading from Arduino, performs checks, logs events, and plays TTS prompts.

### Frontend Simulator

```bash
cd driving_simulator/frontend
npm start
```
Opens React UI at `http://localhost:3000`, connects to backend on WebSocket `ws://localhost:8765`.

## Contributing

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature/xyz`)  
3. Commit your changes (`git commit -m "Add xyz"`)  
4. Push (`git push origin feature/xyz`) and open a PR

Please follow the code style and add tests where applicable.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
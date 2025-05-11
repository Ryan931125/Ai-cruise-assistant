# Gemini to Speech

This project connects Google Gemini with Google Cloud Text-to-Speech (TTS) to turn a text prompt into spoken Mandarin.

## Files

- `Gemini.py`: Sends a prompt to Gemini 2.0 Flash and returns the result.
- `tts.py`: Converts text into MP3 using Google Cloud TTS.
- `gemini_to_speech.py`: Main script combining both steps.

## Requirements

- Python 3.7+
- Google Cloud TTS
1. Create a service account on Google Cloud Console.
2. Enable the Text-to-Speech API.
3. Download the service account JSON key file.
4. Set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

- Install dependencies:

```bash
pip install google-generativeai google-cloud-texttospeech
```

## Usage

```bash
python gemini_to_speech.py
```

1. Enter your question.
2. Optionally enter a system prompt (default: `請用繁體中文回答，盡量簡潔`).
3. The script prints the Gemini response and saves a speech file as `gemini_response.mp3`.

## Output

- Text response in terminal
- Audio file in MP3 format

## Voice

- Language: Mandarin (Traditional Chinese)
- Voice: `cmn-TW-Wavenet-A` (female)
- Speaking rate: 1.2 (default)


import os
from API_Test.Gemini import ask_gemini
from API_Test.tts import text_to_mp3

# export GOOGLE_API_KEY="AIzaSyCah6t9eq7lKQyftT16vFT5rhu7CKLR23U"
# export GOOGLE_APPLICATION_CREDENTIALS="directed-line-458708-k2-aca3384de1c9.json"


def gemini_to_speech(prompt, instruction="請用繁體中文回答，盡量簡潔", speaking_rate=1.2, output_filename="gemini_response.mp3"):
    """
    Takes a prompt, sends it to Gemini, and converts the response to speech

    Args:
        prompt: The text prompt to send to Gemini
        output_filename: The output MP3 filename
        language_code: The language code for TTS
        voice_name: The voice name to use

    Returns:
        A tuple containing (text_response, output_filename)
    """
    # Get response from Gemini
    text_response = ask_gemini(prompt, instruction)

    # Check if there was an error with Gemini
    if text_response.startswith("Error"):
        print(text_response)
        return text_response, None

    # Convert the response to speech
    try:
        text_to_mp3(text_response, speaking_rate, output_filename)
        return text_response, output_filename
    except Exception as e:
        error_message = f"Error in text-to-speech conversion: {str(e)}"
        print(error_message)
        return text_response, None


if __name__ == "__main__":
    # Get user input
    user_prompt = input("你想問Gemini什麼： ")

    # Get optional system prompt
    system_prompt = input("輸入system prompt (預設為「請用繁體中文回答，盡量簡潔」): ")
    if system_prompt.strip() == "":
        system_prompt = None

    # Process the request
    text_response, audio_file = gemini_to_speech(
        user_prompt,
        instruction=system_prompt,
    )

    # Print the text response
    print("\nGemini 的回覆:")
    print(text_response)

    # Confirm audio creation
    if audio_file:
        print(f"\n語音輸出已存到'{audio_file}'")

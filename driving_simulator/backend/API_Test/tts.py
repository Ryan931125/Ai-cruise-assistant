from google.cloud import texttospeech

def text_to_mp3(text, speaking_rate, output_filename="output.mp3"):
    # Initialize the client
    client = texttospeech.TextToSpeechClient()
    
    # Set the text input to be synthesized
    synthesis_input = texttospeech.SynthesisInput(text=text)
    
    # Build the voice request
    voice = texttospeech.VoiceSelectionParams(
        language_code="cmn-Tw",  # Language code (e.g., "en-US")
        name="cmn-TW-Wavenet-A",  # Voice name (e.g., "en-US-Wavenet-D")
        ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
    )
    
    # Select the audio file type
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=speaking_rate
    )
    
    # Perform the text-to-speech request
    response = client.synthesize_speech(
        input=synthesis_input, 
        voice=voice,
        audio_config=audio_config
    )
    
    # Write the response to an output file
    with open(output_filename, "wb") as out:
        out.write(response.audio_content)
        print(f"語音輸出已存到'{output_filename}'")
        


if __name__ == "__main__":
    # Example usage
    text = input("輸入想轉成語音的文字（中文）: ")
    speaking_rate = 1.2
    text_to_mp3(text, speaking_rate)
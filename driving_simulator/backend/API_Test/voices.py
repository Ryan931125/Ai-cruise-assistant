from google.cloud import texttospeech

def list_voices():
    """Lists the available voices."""
    client = texttospeech.TextToSpeechClient()
    
    # Performs the list voices request
    voices = client.list_voices()
    
    for voice in voices.voices:
        print(f"Name: {voice.name}")
        
        # Display the supported language codes for this voice
        # Example: "en-US"
        # for language_code in voice.language_codes:
        #     print(f"  Supported language: {language_code}")
        
        # Display the SSML Voice Gender
        ssml_gender = texttospeech.SsmlVoiceGender(voice.ssml_gender)
        # print(f"  SSML Voice Gender: {ssml_gender.name}")
        
        # Display the natural sample rate hertz for this voice
        # print(f"  Natural Sample Rate Hertz: {voice.natural_sample_rate_hertz}\n")

def list_chinese_voices():
    """Lists only the available Chinese voices."""
    client = texttospeech.TextToSpeechClient()
    
    # Performs the list voices request
    voices = client.list_voices()
    
    print("Available Chinese Voices:\n")
    chinese_voice_count = 0
    
    for voice in voices.voices:
        # Check if any of the language codes are Chinese
        is_chinese_voice = False
        for language_code in voice.language_codes:
            if language_code.startswith(("cmn-TW")):
                is_chinese_voice = True
                break
        
        # Skip non-Chinese voices
        if not is_chinese_voice:
            continue
            
        chinese_voice_count += 1
        print(f"Name: {voice.name}")
        
        # Display the supported language codes
        for language_code in voice.language_codes:
            print(f"  Supported language: {language_code}")
        
        # Display the SSML Voice Gender
        ssml_gender = texttospeech.SsmlVoiceGender(voice.ssml_gender)
        print(f"  SSML Voice Gender: {ssml_gender.name}")
        
        # Display the natural sample rate hertz
        print(f"  Natural Sample Rate Hertz: {voice.natural_sample_rate_hertz}\n")
    
    print(f"Total Chinese voices found: {chinese_voice_count}")

if __name__ == "__main__":
    list_chinese_voices()
    # list_voices()
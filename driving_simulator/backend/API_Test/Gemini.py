import os
import google.generativeai as genai

def ask_gemini(prompt, instruction=None):
    # Configure the API with your key
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return "Error: API key not found. Set the GOOGLE_API_KEY environment variable."

    # Initialize the API
    genai.configure(api_key=api_key)

    try:
        # Get the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # If instruction is provided, prepend it to the prompt
        if instruction:
            formatted_prompt = f"{instruction}\n\nUser query: {prompt}"
        else:
            formatted_prompt = prompt
            
        # Generate content
        response = model.generate_content(formatted_prompt)

        # Return the response text
        return response.text

    except Exception as e:
        return f"Error occurred: {str(e)}"

# Example usage
if __name__ == "__main__":
    # Get user input
    user_prompt = input("Try asking Gemini (2.0 flash): ")

    # Get and print the response
    response = ask_gemini(user_prompt)
    print("\nGemini says:")
    print(response)
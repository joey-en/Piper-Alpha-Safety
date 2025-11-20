import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini_connection():
    load_dotenv(".env")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not found in environment variables.")

    genai.configure(api_key=api_key)

    try:
        model = genai.GenerativeModel("gemini-2.5-pro")
        response = model.generate_content("Hello Gemini! Please confirm the connection is working.")
        print("✅ Connection successful!")
        print("Model reply:")
        print(response.text.strip())
    except Exception as e:
        print("❌ Womp womp")
        print(e)

if __name__ == "__main__":
    test_gemini_connection()
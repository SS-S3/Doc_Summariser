import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the root of the project (two levels up from this file)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

LLM_MODE = os.getenv("LLM_MODE", "ollama").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

def call_ollama(prompt, model=None):
    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": model or OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(url, json=payload, timeout=60)
        if response.status_code == 200:
            return response.json().get("response", "").strip()
    except Exception as e:
        print(f"Ollama error: {e}")
    return None

def call_openai(prompt, model=None):
    if not OPENAI_API_KEY:
        print("OpenAI API Key not found.")
        return None
    
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model or OPENAI_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"].strip()
        else:
            print(f"OpenAI error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"OpenAI connection error: {e}")
    return None

def generate_text(prompt, model=None):
    """
    Main entry point for generating text. 
    Checks LLM_MODE first, then falls back if the primary choice fails.
    """
    if LLM_MODE == "openai":
        res = call_openai(prompt, model)
        if res: return res
        print("OpenAI failed, trying Ollama...")
        return call_ollama(prompt, model) or "Error: Both OpenAI and Ollama failed."
    
    else: # Default to Ollama
        res = call_ollama(prompt, model)
        if res: return res
        
        # If Ollama fails and we have an API key, try OpenAI as backup
        if OPENAI_API_KEY:
            print("Ollama failed, trying OpenAI fallback...")
            return call_openai(prompt, model) or "Error: Both Ollama and OpenAI failed."
        
        return "Error: Ollama failed and no OpenAI fallback configured."

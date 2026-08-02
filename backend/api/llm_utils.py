import os
import requests
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

LLM_MODE = os.getenv("LLM_MODE", "groq").lower()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

def _chat_completion(api_url, headers, model, prompt):
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
    }
    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=60)
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"].strip()
        print(f"LLM error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"LLM connection error: {e}")
    return None

def call_groq(prompt, model=None):
    if not GROQ_API_KEY:
        print("GROQ_API_KEY not set.")
        return None
    return _chat_completion(
        "https://api.groq.com/openai/v1/chat/completions",
        {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
        model or GROQ_MODEL,
        prompt,
    )

def call_openai(prompt, model=None):
    if not OPENAI_API_KEY:
        print("OPENAI_API_KEY not set.")
        return None
    return _chat_completion(
        "https://api.openai.com/v1/chat/completions",
        {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
        model or OPENAI_MODEL,
        prompt,
    )

def generate_text(prompt, model=None):
    if LLM_MODE == "openai":
        return call_openai(prompt, model) or call_groq(prompt, model) or "Error: All LLM providers failed."
    # Default: groq with openai fallback
    return call_groq(prompt, model) or call_openai(prompt, model) or "Error: All LLM providers failed."

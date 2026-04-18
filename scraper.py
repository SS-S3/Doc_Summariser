import os
import time
import requests
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

# API endpoint for uploading books
UPLOAD_URL = "http://127.0.0.1:8000/api/books/upload/"
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "qwen2.5:3b"
FALLBACK_MODEL_NAME = "gemma2:2b"

# We'll use requests to see if qwen2.5:3b is available, else fallback
try:
    models_resp = requests.get("http://127.0.0.1:11434/api/tags")
    models = [m["name"] for m in models_resp.json().get("models", [])]
    if MODEL_NAME not in models:
        if FALLBACK_MODEL_NAME in models:
            MODEL_NAME = FALLBACK_MODEL_NAME
        else:
            # Maybe it's gemma4:e4b which was pulled earlier or qwen is still downloading
            if "gemma4:e4b" in models:
                MODEL_NAME = "gemma4:e4b"
except:
    pass

print(f"Using model: {MODEL_NAME}")

def call_ollama(prompt):
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(OLLAMA_URL, json=payload)
    if response.status_code == 200:
        return response.json().get("response", "").strip()
    return ""

def generate_insights(description):
    if not description:
        return "No summary available.", "Unknown"
    
    summary_prompt = f"Write a concise, 2-3 sentence summary for the following book description:\n\n{description}"
    summary = call_ollama(summary_prompt)
    
    genre_prompt = f"Based on the following book description, predict a single primary genre (e.g., Fiction, Non-Fiction, Fantasy, Science Fiction, Mystery, Romance, Thriller). Output ONLY the genre name.\n\n{description}"
    genre = call_ollama(genre_prompt)
    
    return summary, genre

def scrape_books(pages=3):
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    
    books_data = []
    
    for page in range(1, pages + 1):
        url = f"https://books.toscrape.com/catalogue/page-{page}.html"
        print(f"Scraping {url}")
        driver.get(url)
        time.sleep(1) # As requested
        
        book_links = []
        articles = driver.find_elements(By.CSS_SELECTOR, "article.product_pod")
        for article in articles:
            link = article.find_element(By.CSS_SELECTOR, "h3 a").get_attribute("href")
            book_links.append(link)
            
        for link in book_links:
            driver.get(link)
            try:
                title = driver.find_element(By.CSS_SELECTOR, "div.product_main h1").text
                try:
                    description = driver.find_element(By.CSS_SELECTOR, "#product_description ~ p").text
                except:
                    description = ""
                
                # Ratings are represented by class names One, Two, Three, Four, Five
                rating_class = driver.find_element(By.CSS_SELECTOR, "p.star-rating").get_attribute("class").split()[-1]
                rating_map = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}
                rating = rating_map.get(rating_class, 0)
                
                print(f"Processing: {title}")
                
                summary, genre = generate_insights(description)
                
                book = {
                    "title": title,
                    "author": "Unknown Author", # books.toscrape.com doesn't explicitly state authors
                    "rating": float(rating),
                    "reviews_count": 0,
                    "description": description,
                    "book_url": link,
                    "summary": summary,
                    "genre": genre
                }
                
                books_data.append(book)
                
                # Post to backend
                try:
                    resp = requests.post(UPLOAD_URL, json=book)
                    if resp.status_code in [200, 201]:
                        print(f" Successfully uploaded: {title}")
                    else:
                        print(f" Failed to upload: {title} ({resp.status_code})")
                except Exception as e:
                    print(f" Error uploading {title}: {e}")
                    
            except Exception as e:
                print(f"Error scraping book at {link}: {e}")
                
    driver.quit()
    return books_data

if __name__ == "__main__":
    scrape_books(3)

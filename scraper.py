import os
import time
import requests
import json
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

# Add backend to path for importing llm_utils
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from api.llm_utils import generate_text

# API endpoint for uploading books
# API endpoint for uploading books
UPLOAD_URL = os.getenv("UPLOAD_URL", "http://127.0.0.1:8000/api/books/upload/")
# Removed local Ollama logic as it is now in llm_utils.py

def generate_insights(description):
    if not description:
        return "No summary available.", "Unknown"
    
    summary_prompt = f"Write a concise, 2-3 sentence summary for the following book description:\n\n{description}"
    summary = generate_text(summary_prompt)
    
    genre_prompt = f"Based on the following book description, predict a single primary genre (e.g., Fiction, Non-Fiction, Fantasy, Science Fiction, Mystery, Romance, Thriller). Output ONLY the genre name.\n\n{description}"
    genre = generate_text(genre_prompt)
    
    sentiment_prompt = f"Analyze the sentiment of the following book description. Output ONLY one word: Positive, Negative, or Neutral.\n\n{description}"
    sentiment = generate_text(sentiment_prompt)
    
    return summary, genre, sentiment

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
                
                summary, genre, sentiment = generate_insights(description)
                
                book = {
                    "title": title,
                    "author": "Unknown Author", # books.toscrape.com doesn't explicitly state authors
                    "rating": float(rating),
                    "reviews_count": 0,
                    "description": description,
                    "book_url": link,
                    "summary": summary,
                    "genre": genre,
                    "sentiment": sentiment
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

import os
import sys
import json
from typing import Tuple

import requests
from bs4 import BeautifulSoup

# Add backend to path for importing llm_utils
sys.path.append(os.path.join(os.getcwd(), "backend"))
from api.llm_utils import generate_text

# API endpoint for uploading books
UPLOAD_URL = os.getenv("UPLOAD_URL", "http://127.0.0.1:8000/api/books/upload/")


def _safe_json_loads(s: str):
    try:
        return json.loads(s)
    except Exception:
        return None


def generate_insights(description: str) -> Tuple[str, str, str]:
    if not description:
        return "No summary available.", "Unknown", "Neutral"

    prompt = f"""You are extracting structured literary metadata from a book description.
Return ONLY valid JSON with exactly these keys:
- summary (string, 2-3 sentences)
- genre (string, choose one primary genre name)
- sentiment (string, one of: Positive, Negative, Neutral)

Description:
{description}
"""

    raw = generate_text(prompt)
    data = _safe_json_loads(raw) if raw else None

    if not data or not all(k in data for k in ("summary", "genre", "sentiment")):
        return (
            raw.strip() if raw else "No summary available.",
            "Unknown",
            "Neutral",
        )

    return (
        str(data["summary"]).strip(),
        str(data["genre"]).strip(),
        str(data["sentiment"]).strip(),
    )


def scrape_books(pages: int = 3):
    books_data = []
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0"})

    for page in range(1, pages + 1):
        url = f"https://books.toscrape.com/catalogue/page-{page}.html"
        print(f"Scraping {url}")

        resp = session.get(url, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for article in soup.select("article.product_pod"):
            a = article.select_one("h3 a")
            if not a or not a.get("href"):
                continue

            link = a["href"]
            # links on this site are relative to /catalogue/
            link = requests.compat.urljoin("https://books.toscrape.com/catalogue/", link)

            book_resp = session.get(link, timeout=30)
            book_resp.raise_for_status()
            book_soup = BeautifulSoup(book_resp.text, "html.parser")

            title_el = book_soup.select_one("div.product_main h1")
            title = title_el.get_text(strip=True) if title_el else ""

            # Description is the paragraph right after #product_description
            desc_label = book_soup.select_one("#product_description")
            description = ""
            if desc_label:
                p = desc_label.find_next("p")
                if p:
                    description = p.get_text(" ", strip=True)

            # Ratings are represented by class names One, Two, Three, Four, Five
            rating_el = book_soup.select_one("p.star-rating")
            rating_class = ""
            if rating_el:
                classes = rating_el.get("class", [])
                rating_class = next((c for c in classes if c != "star-rating"), "")

            rating_map = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}
            rating = rating_map.get(rating_class, 0)

            if not title:
                continue

            print(f"Processing: {title}")
            summary, genre, sentiment = generate_insights(description)

            book = {
                "title": title,
                "author": "Unknown Author",  # books.toscrape.com doesn't explicitly state authors
                "rating": float(rating),
                "reviews_count": 0,
                "description": description,
                "book_url": link,
                "summary": summary,
                "genre": genre,
                "sentiment": sentiment,
            }

            books_data.append(book)

            # Post to backend
            try:
                r = session.post(UPLOAD_URL, json=book, timeout=30)
                if r.status_code in [200, 201]:
                    print(f" Successfully uploaded: {title}")
                else:
                    print(f" Failed to upload: {title} ({r.status_code})")
            except Exception as e:
                print(f" Error uploading {title}: {e}")

    return books_data


if __name__ == "__main__":
    scrape_books(3)


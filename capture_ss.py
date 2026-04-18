import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def capture_screenshots():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=options)
    
    try:
        # Capture Home Page
        print("Capturing Home Page...")
        driver.get("http://localhost:3000")
        time.sleep(3) # Wait for Next.js to load
        driver.save_screenshot("home_page.png")
        print("Saved home_page.png")
        
        # Capture Q&A Page
        print("Capturing Q&A Page...")
        driver.get("http://localhost:3000/qa")
        time.sleep(3)
        driver.save_screenshot("qa_page.png")
        print("Saved qa_page.png")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    capture_screenshots()

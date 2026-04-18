# Document Intelligence Platform 📚🧠

A full-stack, AI-powered web application that automates the collection of book data, generates intelligent insights using local LLMs (Ollama) or OpenAI, and provides a powerful Retrieval-Augmented Generation (RAG) interface for querying your library.

## 📸 Screenshots

### Home Page - Library & Insights
![Home Page](home_page.png)

### RAG Q&A Interface
![Q&A Interface](qa_page.png)

---

## 🌟 Features

- **Automated Data Ingestion**: A robust Selenium web scraper that crawls `books.toscrape.com`, extracting book metadata and descriptions.
- **AI Insight Generation**: For every ingested book, an LLM automatically generates a concise summary, predicts the genre, and performs sentiment analysis.
- **Hybrid LLM Support**: Supports local models via **Ollama** (e.g., `qwen2.5:3b`) and cloud models via **OpenAI** (e.g., `gpt-4o-mini`) as a backup or primary choice.
- **RAG Q&A Pipeline**: Ask natural language questions about your entire book corpus. The system embeds chunks using `sentence-transformers`, searches `ChromaDB`, and constructs intelligent answers with source citations.
- **Premium UI**: A sleek, dark-mode glassmorphism interface built with Next.js and Tailwind CSS.
- **Intelligent Caching**: Django file-based caching for expensive RAG queries, minimizing LLM overhead and ensuring lightning-fast subsequent responses.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django & Django REST Framework
- **Database**: MySQL (`mysqlclient`)
- **Vector Store**: ChromaDB
- **Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2`)
- **AI Generation**: Local Ollama or OpenAI API
- **Automation**: Python + Selenium

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Custom CSS (Glassmorphism & Micro-animations)
- **Language**: TypeScript

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.9+**
- **Node.js 18+** & npm
- **MySQL Server** (running locally on port `3306`)
- **Ollama** (optional, for local LLM mode)
- **Google Chrome** (required for Selenium automation)

---

## 🚀 Installation & Setup

### 1. Database & AI Setup

1. **Start MySQL** and create the required database:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS document_intelligence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. **Configure Environment Variables**:
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to set your MySQL credentials and choose your `LLM_MODE` (`ollama` or `openai`). If using OpenAI, provide your `OPENAI_API_KEY`.*

3. **(Optional) Local AI Setup**:
   If using Ollama, pull the required model:
   ```bash
   ollama pull qwen2.5:3b
   ```

### 2. Backend Setup

1. **Navigate to the project root and create a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install django djangorestframework mysqlclient chromadb sentence-transformers langchain selenium requests django-cors-headers python-dotenv openai
   ```

3. **Run database migrations**:
   ```bash
   cd backend
   python manage.py makemigrations api
   python manage.py migrate
   ```

4. **Start the Django Development Server**:
   ```bash
   python manage.py runserver 8000
   ```

### 3. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   The UI will be available at [http://localhost:3000](http://localhost:3000).

---

## 🕷️ Running the Scraper

To populate the database with books and vector embeddings, run the automated Selenium scraper:

```bash
# From the project root, ensure venv is activated
source venv/bin/activate
PYTHONUNBUFFERED=1 python scraper.py
```

---

## 🔌 API Documentation

### 1. List Books
- **Endpoint**: `GET /api/books/`
- **Response**: List of book objects with `id`, `title`, `author`, `genre`, `sentiment`, `rating`, and `summary`.

### 2. Book Detail
- **Endpoint**: `GET /api/books/<id>/`
- **Response**: Single book object with full metadata.

### 3. Get Recommendations
- **Endpoint**: `GET /api/books/<id>/recommendations/`
- **Description**: Returns 4 related books based on vector similarity in ChromaDB.

### 4. Upload Book (Internal/Scraper)
- **Endpoint**: `POST /api/books/upload/`
- **Body**: 
  ```json
  {
    "title": "String",
    "author": "String",
    "description": "String",
    "summary": "String",
    "genre": "String",
    "rating": 4.5,
    "book_url": "URL"
  }
  ```
- **Side Effect**: Automatically chunks the description, generates embeddings, and saves to ChromaDB.

### 5. RAG Q&A
- **Endpoint**: `POST /api/qa/`
- **Body**: `{"question": "What are some fantasy books?"}`
- **Response**:
  ```json
  {
    "answer": "Based on the context, we have 'Harry Potter'...",
    "citations": [
      {"book_id": 1, "title": "Harry Potter and the Sorcerer's Stone"}
    ]
  }
  ```

---

## 🧠 Architecture Overview

1. **Scraping**: Selenium extracts raw HTML -> AI generates summary/genre/sentiment -> Data POSTed to Backend.
2. **Ingestion**: Backend chunks text (200 words, 50 overlap) -> `sentence-transformers` creates 384-dim vectors -> Vectors stored in **ChromaDB**.
3. **RAG Pipeline**: 
   - User Query -> Embedded -> Vector Search in ChromaDB (Top 5).
   - Context + Question -> LLM Prompt (Ollama/OpenAI).
   - Answer + Citations -> Frontend.
4. **Caching**: Query hashes are stored in Django's file-based cache for 24h to save API costs/compute.

---

## 📁 Project Structure

```text
.
├── backend/            # Django backend
│   ├── api/            # API application logic
│   │   ├── llm_utils.py# Shared LLM Fallback utility
│   │   ├── views.py    # RAG & API endpoints
│   │   └── models.py   # Book database models
│   └── backend/        # Project settings & configuration
├── frontend/           # Next.js frontend
│   └── src/            # Source code
│       ├── app/        # App router components
│       └── components/ # UI components (Glassmorphism)
├── scraper.py          # Selenium automation script
├── .env.example        # Environment template
└── README.md           # Documentation
```

# Document Intelligence Platform 📚🧠

A full-stack, AI-powered web application that automates the collection of book data, generates intelligent insights using local LLMs, and provides a powerful Retrieval-Augmented Generation (RAG) interface for querying your library.

## 📸 Screenshots

### Home Page - Library & Insights
![Home Page](home_page.png)

### RAG Q&A Interface
![Q&A Interface](qa_page.png)

---

## 🌟 Features

- **Automated Data Ingestion**: A robust Selenium web scraper that crawls `books.toscrape.com`, extracting book metadata and descriptions.
- **AI Insight Generation**: For every ingested book, a local LLM (`qwen2.5:3b` via Ollama) automatically generates a concise summary and predicts the genre.
- **RAG Q&A Pipeline**: Ask natural language questions about your entire book corpus. The system embeds chunks using `sentence-transformers`, searches `ChromaDB`, and constructs intelligent answers with source citations using Ollama.
- **Premium UI**: A sleek, dark-mode glassmorphism interface built with Next.js and Tailwind CSS.
- **Intelligent Caching**: File-based Django caching (`/tmp/django_cache`) for expensive RAG queries, minimizing LLM overhead and ensuring lightning-fast subsequent responses (24-hour TTL).

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django & Django REST Framework
- **Database**: MySQL (`mysqlclient`)
- **Vector Store**: ChromaDB
- **Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2`)
- **AI Generation**: Local Ollama (`qwen2.5:3b` / `gemma2:2b` / `gemma4:e4b`)
- **Automation**: Python + Selenium

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Custom CSS (Glassmorphism & Micro-animations)
- **Language**: TypeScript

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Python 3.9+**
- **Node.js 18+** & npm
- **MySQL Server** (running locally on port `3306`)
- **Ollama** (running locally)
- **Google Chrome** (required for Selenium automation)

---

## 🚀 Installation & Setup

### 1. Database & AI Setup

1. **Start MySQL** and create the required database:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS document_intelligence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
   *(Ensure your MySQL credentials in `backend/backend/settings.py` match your local setup. Default is user: `root`, password: `root`)*

2. **Pull the required Ollama model**:
   ```bash
   ollama pull qwen2.5:3b
   ```

### 2. Backend Setup

1. **Navigate to the project root and create a virtual environment**:
   ```bash
   cd document_intelligence
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install django djangorestframework mysqlclient chromadb sentence-transformers langchain selenium requests django-cors-headers
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
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   The UI will be available at [http://localhost:3000](http://localhost:3000).

---

## 🕷️ Running the Scraper

To populate the database with books, summaries, genres, and vector embeddings, run the automated Selenium scraper. Ensure the Django server and Ollama are running before executing this.

```bash
# From the project root, ensure venv is activated
source venv/bin/activate

# Run the scraper
PYTHONUNBUFFERED=1 python scraper.py
```
*The scraper will navigate `books.toscrape.com`, utilize Ollama to generate insights, and POST the payload to the Django backend where chunks are embedded and saved into ChromaDB.*

---

## 🔌 API Endpoints

The Django backend exposes the following REST APIs:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/books/` | List all uploaded books. |
| `GET`  | `/api/books/<id>/` | Retrieve detailed metadata for a specific book. |
| `GET`  | `/api/books/<id>/recommendations/` | Get 4 related books based on vector similarity or genre. |
| `POST` | `/api/books/upload/` | Endpoint for the scraper to upload data. Automatically handles chunking (200 words, 50 overlap) and ChromaDB ingestion. |
| `POST` | `/api/qa/` | The RAG query endpoint. Takes `{"question": "..."}` and returns an AI-generated answer with citations. |

---

## 🧠 Deep Dive: The RAG Architecture

1. **Chunking**: When a book is uploaded, its title, author, genre, and description are concatenated and chunked into rolling windows of **200 words** with a **50-word overlap**.
2. **Embedding**: The chunks are encoded into dense vectors using `all-MiniLM-L6-v2` (`sentence-transformers`).
3. **Storage**: Vectors and metadata (book ID, title, chunk index) are persistently stored in a local **ChromaDB** collection.
4. **Retrieval**: When a user asks a question, the query is embedded and a similarity search fetches the top 5 most relevant context chunks.
5. **Generation**: The context is injected into a prompt for `qwen2.5:3b`, instructing it to act as an AI Librarian and answer strictly based on the provided context.
6. **Citation**: The backend maps the retrieved chunks back to their origin books and returns clickable citations to the frontend.

---

## ❓ Sample Questions and Answers

Here are a few sample questions you can ask the RAG AI after the database is populated:

**Q: What is a good mystery book?**
> **AI:** "The Girl on the Train" by Paula Hawkins is an excellent mystery thriller. It revolves around Rachel, a commuter who becomes entangled in a missing persons investigation that promises to send shockwaves throughout her life. The book features a compelling psychological narrative with unreliable narrators.
> *Source: The Girl on the Train (Chunk 2)*

**Q: Can you recommend a classic sci-fi book?**
> **AI:** "Dune" by Frank Herbert is a classic sci-fi novel that deals with complex themes of politics, religion, and human survival on the harsh desert planet of Arrakis. It is highly recommended if you are interested in deep world-building and space epics.
> *Source: Dune (Chunk 5)*

**Q: Tell me about books written by J.K. Rowling.**
> **AI:** The database currently contains "Harry Potter and the Sorcerer's Stone" by J.K. Rowling. This is a Fantasy novel about a young wizard discovering his magical heritage at Hogwarts School of Witchcraft and Wizardry.
> *Source: Harry Potter and the Sorcerer's Stone (Chunk 1)*

import os
import hashlib
import requests
from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sentence_transformers import SentenceTransformer
import chromadb

from .models import Book
from .serializers import BookSerializer

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="document_intelligence")

# Initialize Embedding Model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

def get_ollama_model():
    try:
        models_resp = requests.get("http://127.0.0.1:11434/api/tags", timeout=2)
        models = [m["name"] for m in models_resp.json().get("models", [])]
        if "qwen2.5:3b" in models: return "qwen2.5:3b"
        if "gemma2:2b" in models: return "gemma2:2b"
        if "gemma4:e4b" in models: return "gemma4:e4b"
    except:
        pass
    return "qwen2.5:3b"

def call_ollama(prompt):
    model_name = get_ollama_model()
    payload = {
        "model": model_name,
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        if response.status_code == 200:
            return response.json().get("response", "").strip()
    except Exception as e:
        print(f"Ollama error: {e}")
    return "Error connecting to LLM."

def chunk_text(text, chunk_size=200, overlap=50):
    if not text: return []
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

@api_view(['POST'])
def upload_book(request):
    data = request.data
    serializer = BookSerializer(data=data)
    
    if serializer.is_valid():
        book = serializer.save()
        
        # Ingest to ChromaDB
        text_to_embed = f"Title: {book.title}\nAuthor: {book.author}\nGenre: {book.genre}\nDescription: {book.description}"
        chunks = chunk_text(text_to_embed, 200, 50)
        
        if chunks:
            embeddings = embedding_model.encode(chunks).tolist()
            
            ids = [f"book_{book.id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [{"book_id": book.id, "title": book.title, "chunk_index": i} for i in range(len(chunks))]
            
            collection.add(
                embeddings=embeddings,
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )
            
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_recommendations(request, pk):
    try:
        book = Book.objects.get(pk=pk)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
        
    # Find similar books based on genre or embeddings
    if book.description:
        query_emb = embedding_model.encode([book.description]).tolist()
        results = collection.query(query_embeddings=query_emb, n_results=5)
        
        related_ids = set()
        if results and results['metadatas']:
            for meta_list in results['metadatas']:
                for meta in meta_list:
                    if meta['book_id'] != book.id:
                        related_ids.add(meta['book_id'])
                        
        related_books = Book.objects.filter(id__in=list(related_ids))[:4]
    else:
        related_books = Book.objects.filter(genre=book.genre).exclude(id=book.id)[:4]
        
    serializer = BookSerializer(related_books, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def qa_rag(request):
    question = request.data.get('question')
    if not question:
        return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    # Check cache
    question_hash = hashlib.md5(question.encode('utf-8')).hexdigest()
    cache_key = f"rag_answer_{question_hash}"
    cached_response = cache.get(cache_key)
    
    if cached_response:
        return Response(cached_response)
        
    # RAG Pipeline
    question_emb = embedding_model.encode([question]).tolist()
    results = collection.query(query_embeddings=question_emb, n_results=5)
    
    context_chunks = []
    citations = []
    seen_books = set()
    
    if results and results['documents'] and results['documents'][0]:
        for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
            context_chunks.append(doc)
            book_id = meta['book_id']
            if book_id not in seen_books:
                citations.append({"book_id": book_id, "title": meta['title']})
                seen_books.add(book_id)
                
    context = "\n\n---\n\n".join(context_chunks)
    
    prompt = f"""You are an intelligent AI Librarian assistant. Answer the user's question based strictly on the following context. If you don't know the answer from the context, say so. Do not invent information.

Context from our library:
{context}

Question: {question}

Answer:"""

    answer = call_ollama(prompt)
    
    response_data = {
        "answer": answer,
        "citations": citations
    }
    
    # Cache for 24h
    cache.set(cache_key, response_data, 60 * 60 * 24)
    
    return Response(response_data)

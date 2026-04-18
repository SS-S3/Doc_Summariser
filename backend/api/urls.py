from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, upload_book, get_recommendations, qa_rag

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')

urlpatterns = [
    path('books/upload/', upload_book, name='upload-book'),
    path('books/<int:pk>/recommendations/', get_recommendations, name='get-recommendations'),
    path('qa/', qa_rag, name='qa-rag'),
    path('', include(router.urls)),
]

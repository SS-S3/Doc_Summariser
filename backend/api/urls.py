from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import BookViewSet, upload_book, get_recommendations, qa_rag, surprise_me, set_archive_status, get_archive, register, login_view

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('books/upload/', upload_book, name='upload-book'),
    path('books/surprise/', surprise_me, name='surprise-me'),
    path('books/archive/', get_archive, name='get-archive'),
    path('books/<int:pk>/recommendations/', get_recommendations, name='get-recommendations'),
    path('books/<int:pk>/archive/', set_archive_status, name='set-archive-status'),
    path('qa/', qa_rag, name='qa-rag'),
    path('', include(router.urls)),
]

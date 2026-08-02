from django.db import models
from django.contrib.auth.models import User

class UserBook(models.Model):
    STATUS_CHOICES = [
        ('bookmarked', 'Bookmarked'),
        ('reading', 'Reading'),
        ('finished', 'Finished'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_books')
    book = models.ForeignKey('Book', on_delete=models.CASCADE, related_name='user_statuses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.user.username} — {self.book.title} — {self.status}"

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    rating = models.FloatField(default=0.0)
    reviews_count = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    book_url = models.URLField(max_length=500, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    sentiment = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.title

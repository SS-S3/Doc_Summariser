from django.db import models

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

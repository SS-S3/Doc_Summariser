from rest_framework import serializers
from .models import Book, UserBook

class UserBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBook
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

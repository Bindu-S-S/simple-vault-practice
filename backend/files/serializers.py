from rest_framework import serializers
from .models import UploadedFile

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['id', 'name', 'file', 'file_size', 'file_type', 'file_hash', 'uploaded_at', 'is_duplicate', 'original_file']
        read_only_fields = ['id', 'uploaded_at', 'file_hash', 'is_duplicate', 'original_file']
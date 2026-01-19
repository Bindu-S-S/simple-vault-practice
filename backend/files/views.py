from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import UploadedFile
from .serializers import FileSerializer
import hashlib

class FileViewSet(viewsets.ModelViewSet):
    queryset = UploadedFile.objects.all()
    serializer_class = FileSerializer
    
    def calculate_hash(self, file):
        """Calculate SHA-256 hash of file content"""
        sha256 = hashlib.sha256()
        for chunk in file.chunks():
            sha256.update(chunk)
        file.seek(0)  # Reset file pointer
        return sha256.hexdigest()
    
    def create(self, request):
        uploaded_file = request.FILES.get('file')
        
        if not uploaded_file:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate file hash
        file_hash = self.calculate_hash(uploaded_file)
        
        # Check for existing file with same hash
        existing_file = UploadedFile.objects.filter(
            file_hash=file_hash, 
            is_duplicate=False
        ).first()
        
        if existing_file:
            # DUPLICATE FOUND - Don't store file again, just create reference
            duplicate = UploadedFile.objects.create(
                name=uploaded_file.name,
                file=existing_file.file,  # Point to existing file
                file_size=uploaded_file.size,
                file_type=uploaded_file.content_type or 'unknown',
                file_hash=file_hash,
                is_duplicate=True,
                original_file=existing_file
            )
            serializer = FileSerializer(duplicate)
            return Response({
                'message': 'Duplicate detected! File already exists.',
                'is_duplicate': True,
                'original_file_id': existing_file.id,
                'file': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        # NEW FILE - Store it
        new_file = UploadedFile.objects.create(
            name=uploaded_file.name,
            file=uploaded_file,
            file_size=uploaded_file.size,
            file_type=uploaded_file.content_type or 'unknown',
            file_hash=file_hash,
            is_duplicate=False
        )
        
        serializer = FileSerializer(new_file)
        return Response({
            'message': 'File uploaded successfully!',
            'is_duplicate': False,
            'file': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def list(self, request):
        files = self.get_queryset()
        serializer = FileSerializer(files, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search files by name, type, or date"""
        queryset = self.get_queryset()
        
        # Filter by name
        name = request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        # Filter by type
        file_type = request.query_params.get('type', None)
        if file_type:
            queryset = queryset.filter(file_type__icontains=file_type)
        
        serializer = FileSerializer(queryset, many=True)
        return Response(serializer.data)
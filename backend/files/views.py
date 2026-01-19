from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import FileResponse, Http404
from .models import UploadedFile
from .serializers import FileSerializer
import hashlib
import os

class FileViewSet(viewsets.ModelViewSet):
    queryset = UploadedFile.objects.all()
    serializer_class = FileSerializer
    
    def calculate_hash(self, file):
        """Calculate SHA-256 hash of file content"""
        sha256 = hashlib.sha256()
        for chunk in file.chunks():
            sha256.update(chunk)
        file.seek(0)
        return sha256.hexdigest()
    
    def create(self, request):
        uploaded_file = request.FILES.get('file')
        
        if not uploaded_file:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_hash = self.calculate_hash(uploaded_file)
        
        existing_file = UploadedFile.objects.filter(
            file_hash=file_hash, 
            is_duplicate=False
        ).first()
        
        if existing_file:
            duplicate = UploadedFile.objects.create(
                name=uploaded_file.name,
                file=existing_file.file,
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
        """List files with optional search and filter"""
        queryset = self.get_queryset()
        
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        file_type = request.query_params.get('type', None)
        if file_type:
            queryset = queryset.filter(file_type__icontains=file_type)
        
        duplicates_only = request.query_params.get('duplicates', None)
        if duplicates_only == 'true':
            queryset = queryset.filter(is_duplicate=True)
        elif duplicates_only == 'false':
            queryset = queryset.filter(is_duplicate=False)
        
        serializer = FileSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a file"""
        try:
            file_obj = UploadedFile.objects.get(pk=pk)
            file_path = file_obj.file.path
            
            if os.path.exists(file_path):
                response = FileResponse(
                    open(file_path, 'rb'),
                    as_attachment=True,
                    filename=file_obj.name
                )
                return response
            else:
                raise Http404("File not found on server")
        except UploadedFile.DoesNotExist:
            raise Http404("File not found")
    
    def destroy(self, request, pk=None):
        """Delete a file"""
        try:
            file = UploadedFile.objects.get(pk=pk)
            file_name = file.name
            file.delete()
            return Response({
                'message': f'File "{file_name}" deleted successfully'
            }, status=status.HTTP_200_OK)
        except UploadedFile.DoesNotExist:
            return Response({
                'error': 'File not found'
            }, status=status.HTTP_404_NOT_FOUND)
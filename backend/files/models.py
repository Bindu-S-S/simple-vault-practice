from django.db import models

class UploadedFile(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=100)
    file_hash = models.CharField(max_length=64, db_index=True)  # SHA-256 hash
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_duplicate = models.BooleanField(default=False)
    original_file = models.ForeignKey(
        'self', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='duplicates'
    )
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-uploaded_at']
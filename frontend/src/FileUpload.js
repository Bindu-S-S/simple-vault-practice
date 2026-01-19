import React, { useState } from 'react';
import axios from 'axios';

function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/files/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.is_duplicate) {
        setMessage('⚠️ Duplicate detected! This file already exists.');
      } else {
        setMessage('✅ File uploaded successfully!');
      }
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      setMessage('❌ Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Upload File</h2>
      <input id="file-input" type="file" onChange={handleFileSelect} style={{ marginBottom: '10px' }} />
      <button onClick={handleUpload} disabled={!selectedFile || uploading}
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
      {selectedFile && <p>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>}
    </div>
  );
}

export default FileUpload;
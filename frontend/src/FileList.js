import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileList({ refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/files/');
      setFiles(response.data);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading files...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Uploaded Files ({files.length})</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Size</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{file.name}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{file.file_type}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{(file.file_size / 1024).toFixed(2)} KB</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {file.is_duplicate ? (
                    <span style={{ color: 'orange' }}>🔄 Duplicate</span>
                  ) : (
                    <span style={{ color: 'green' }}>✓ Original</span>
                  )}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{new Date(file.uploaded_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FileList;
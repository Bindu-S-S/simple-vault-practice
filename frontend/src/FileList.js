import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileList({ refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDuplicates, setFilterDuplicates] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger, searchTerm, filterType, filterDuplicates]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:8000/api/files/?';
      if (searchTerm) url += `search=${searchTerm}&`;
      if (filterType) url += `type=${filterType}&`;
      if (filterDuplicates) url += `duplicates=${filterDuplicates}&`;
      
      const response = await axios.get(url);
      setFiles(response.data);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/files/${id}/`);
        fetchFiles();
      } catch (err) {
        alert('Failed to delete file');
      }
    }
  };

  const handleDownload = (fileId, fileName) => {
    const downloadUrl = `http://localhost:8000/api/files/${fileId}/download/`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Uploaded Files ({files.length})</h2>
      
      {/* Search and Filter Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="image">Images</option>
          <option value="text">Text</option>
          <option value="video">Video</option>
        </select>
        <select
          value={filterDuplicates}
          onChange={(e) => setFilterDuplicates(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">All Files</option>
          <option value="false">Originals Only</option>
          <option value="true">Duplicates Only</option>
        </select>
        <button 
          onClick={() => { setSearchTerm(''); setFilterType(''); setFilterDuplicates(''); }}
          style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }}
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <p>Loading files...</p>
      ) : files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Size</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Uploaded</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
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
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {new Date(file.uploaded_at).toLocaleString()}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleDownload(file.id, file.name)}
                    style={{ marginRight: '8px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ⬇ Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.name)}
                    style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FileList;
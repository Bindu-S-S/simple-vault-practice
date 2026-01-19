import React, { useState } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';

function App() {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div>
      <header style={{ backgroundColor: '#282c34', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1>🗄️ SimpleVault - Practice Project</h1>
        <p>File Upload & Management System</p>
      </header>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        <FileList refreshTrigger={refreshCounter} />
      </main>
    </div>
  );
}

export default App;
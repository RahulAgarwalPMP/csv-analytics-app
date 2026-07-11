import React, { useCallback, useState } from 'react';
import './FileUpload.css';

function FileUpload({ onFileSelect }) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (file && file.name.endsWith('.csv')) {
        onFileSelect(file);
      } else {
        alert('Please upload a valid .csv file.');
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="dropzone-icon">📂</div>
      <p className="dropzone-title">Drag & drop your CSV file here</p>
      <p className="dropzone-sub">or click to browse your files</p>

      <label className="browse-btn">
        Browse File
        <input
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </label>

      <p className="dropzone-hint">Supports any .csv file — staff data, sales, financials, etc.</p>
    </div>
  );
}

export default FileUpload;

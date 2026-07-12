import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload.jsx';
import DataSummary from './components/DataSummary.jsx';
import ChartBuilder from './components/ChartBuilder.jsx';
import DataPreview from './components/DataPreview.jsx';
import './App.css';

// In dev, Vite proxies API calls. In production, uses VITE_API_URL or falls back to backend URL.
const API_BASE = import.meta.env.VITE_API_URL || 'https://csv-analytics-backend.onrender.com';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);   // { summary, preview, filename }
  const [chartData, setChartData] = useState(null); // full dataset from /analyze
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('charts');

  const handleFileUpload = useCallback(async (file) => {
    setError(null);
    setLoading(true);
    setFileMeta(null);
    setChartData(null);
    setUploadedFile(file);

    try {
      // Step 1: Get metadata + preview
      const formData1 = new FormData();
      formData1.append('file', file);
      const metaRes = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData1 });
      if (!metaRes.ok) {
        const err = await metaRes.json();
        throw new Error(err.detail || 'Upload failed');
      }
      const meta = await metaRes.json();
      setFileMeta(meta);

      // Step 2: Get full dataset
      const formData2 = new FormData();
      formData2.append('file', file);
      const dataRes = await fetch(`${API_BASE}/analyze`, { method: 'POST', body: formData2 });
      if (!dataRes.ok) {
        const err = await dataRes.json();
        throw new Error(err.detail || 'Analysis failed');
      }
      const fullData = await dataRes.json();
      setChartData(fullData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = () => {
    setUploadedFile(null);
    setFileMeta(null);
    setChartData(null);
    setError(null);
    setActiveTab('charts');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">CSV Analytics</span>
          </div>
          {fileMeta && (
            <div className="header-right">
              <span className="file-badge">
                <span className="file-icon">📄</span>
                {fileMeta.filename}
              </span>
              <button className="btn-reset" onClick={handleReset}>
                Upload New File
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {/* Upload Screen */}
        {!fileMeta && !loading && (
          <div className="upload-screen">
            <div className="upload-hero">
              <h1>Interactive CSV Graph Generator</h1>
              <p>Upload any CSV file and instantly generate interactive charts — bar, line, area, pie, scatter and more.</p>
            </div>
            <FileUpload onFileSelect={handleFileUpload} />
            {error && (
              <div className="error-banner">
                <span>⚠️</span> {error}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-screen">
            <div className="spinner" />
            <p>Analyzing your CSV file...</p>
          </div>
        )}

        {/* Dashboard */}
        {fileMeta && chartData && !loading && (
          <div className="dashboard">
            {/* Summary strip */}
            <DataSummary summary={fileMeta.summary} filename={fileMeta.filename} />

            {/* Tab nav */}
            <div className="tab-nav">
              <button
                className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
                onClick={() => setActiveTab('charts')}
              >
                📈 Charts
              </button>
              <button
                className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
              >
                🗂 Data Preview
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'charts' && (
              <ChartBuilder
                data={chartData.data}
                summary={chartData.summary}
              />
            )}
            {activeTab === 'data' && (
              <DataPreview
                preview={chartData.data.slice(0, 100)}
                columns={chartData.summary.columns}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

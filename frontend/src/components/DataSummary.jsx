import React from 'react';
import './DataSummary.css';

const TYPE_COLORS = {
  numeric: { bg: '#0c2a4a', border: '#0369a1', text: '#38bdf8', icon: '🔢' },
  categorical: { bg: '#1a1033', border: '#6d28d9', text: '#a78bfa', icon: '🏷️' },
  datetime: { bg: '#0a2a1a', border: '#065f46', text: '#34d399', icon: '📅' },
};

function DataSummary({ summary, filename }) {
  const numericCols = summary.columns.filter((c) => c.type === 'numeric');
  const categoricalCols = summary.columns.filter((c) => c.type === 'categorical');
  const dateCols = summary.columns.filter((c) => c.type === 'datetime');

  return (
    <div className="summary-section">
      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <div>
            <p className="stat-value">{summary.row_count.toLocaleString()}</p>
            <p className="stat-label">Total Rows</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📐</span>
          <div>
            <p className="stat-value">{summary.col_count}</p>
            <p className="stat-label">Columns</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔢</span>
          <div>
            <p className="stat-value">{numericCols.length}</p>
            <p className="stat-label">Numeric</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏷️</span>
          <div>
            <p className="stat-value">{categoricalCols.length}</p>
            <p className="stat-label">Categorical</p>
          </div>
        </div>
        {dateCols.length > 0 && (
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div>
              <p className="stat-value">{dateCols.length}</p>
              <p className="stat-label">Date Cols</p>
            </div>
          </div>
        )}
      </div>

      {/* Column chips */}
      <div className="columns-section card">
        <h3 className="section-title">Detected Columns</h3>
        <div className="col-chips">
          {summary.columns.map((col) => {
            const style = TYPE_COLORS[col.type] || TYPE_COLORS.categorical;
            return (
              <span
                key={col.name}
                className="col-chip"
                style={{
                  background: style.bg,
                  borderColor: style.border,
                  color: style.text,
                }}
                title={`Type: ${col.type} | Unique: ${col.unique} | Nulls: ${col.nulls}`}
              >
                <span>{style.icon}</span> {col.name}
                <span className="chip-type">{col.type}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DataSummary;

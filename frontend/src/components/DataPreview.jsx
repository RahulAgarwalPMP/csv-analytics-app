import React, { useState } from 'react';
import './DataPreview.css';

function DataPreview({ preview, columns }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const filtered = preview.filter((row) =>
    Object.values(row).some((v) =>
      String(v ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const colNames = columns.map((c) => c.name);
  const colTypeMap = Object.fromEntries(columns.map((c) => [c.name, c.type]));

  return (
    <div className="data-preview card">
      <div className="preview-header">
        <h3 className="section-title">Data Preview <span className="row-count">({preview.length} rows)</span></h3>
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {colNames.map((col) => (
                <th key={col}>
                  {col}
                  <span className={`col-type-badge ${colTypeMap[col]}`}>{colTypeMap[col]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i}>
                {colNames.map((col) => (
                  <td key={col} className={colTypeMap[col] === 'numeric' ? 'num-cell' : ''}>
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="null-cell">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ← Prev
          </button>
          <span className="page-info">Page {page + 1} of {totalPages}</span>
          <button
            className="page-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default DataPreview;

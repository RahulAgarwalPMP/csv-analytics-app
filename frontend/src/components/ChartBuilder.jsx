import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import './ChartBuilder.css';

// Color palette
const COLORS = [
  '#38bdf8', '#818cf8', '#34d399', '#fb923c', '#f472b6',
  '#facc15', '#a78bfa', '#4ade80', '#f87171', '#60a5fa',
  '#e879f9', '#2dd4bf',
];

const CHART_TYPES = [
  { id: 'bar',       label: 'Bar',     icon: '📊' },
  { id: 'line',      label: 'Line',    icon: '📈' },
  { id: 'area',      label: 'Area',    icon: '🏔️' },
  { id: 'pie',       label: 'Pie',     icon: '🥧' },
  { id: 'scatter',   label: 'Scatter', icon: '⚡' },
  { id: 'histogram', label: 'Histogram', icon: '📉' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      {label !== undefined && <p className="tooltip-label">{String(label)}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

function buildAggregatedData(data, xCol, yCol, aggFn = 'mean') {
  if (!xCol || !yCol) return [];
  const groups = {};
  data.forEach((row) => {
    const key = row[xCol] !== null && row[xCol] !== undefined ? String(row[xCol]) : '(blank)';
    if (!groups[key]) groups[key] = [];
    const val = parseFloat(row[yCol]);
    if (!isNaN(val)) groups[key].push(val);
  });

  return Object.entries(groups).map(([key, vals]) => {
    let agg;
    if (aggFn === 'sum') agg = vals.reduce((a, b) => a + b, 0);
    else if (aggFn === 'count') agg = vals.length;
    else if (aggFn === 'min') agg = Math.min(...vals);
    else if (aggFn === 'max') agg = Math.max(...vals);
    else agg = vals.reduce((a, b) => a + b, 0) / vals.length; // mean
    return { [xCol]: key, [yCol]: parseFloat(agg.toFixed(2)) };
  });
}

function buildHistogramData(data, col, bins = 10) {
  const vals = data.map((r) => parseFloat(r[col])).filter((v) => !isNaN(v));
  if (!vals.length) return [];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const step = (max - min) / bins;
  const buckets = Array.from({ length: bins }, (_, i) => ({
    range: `${(min + i * step).toFixed(1)}–${(min + (i + 1) * step).toFixed(1)}`,
    count: 0,
  }));
  vals.forEach((v) => {
    const idx = Math.min(Math.floor((v - min) / step), bins - 1);
    buckets[idx].count++;
  });
  return buckets;
}

function buildValueCountData(data, col) {
  const counts = {};
  data.forEach((row) => {
    const k = row[col] !== null && row[col] !== undefined ? String(row[col]) : '(blank)';
    counts[k] = (counts[k] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20);
}

function ChartBuilder({ data, summary }) {
  const numericCols = summary.columns.filter((c) => c.type === 'numeric').map((c) => c.name);
  const categoricalCols = summary.columns.filter((c) => c.type !== 'numeric').map((c) => c.name);
  const allCols = summary.columns.map((c) => c.name);

  const [chartType, setChartType] = useState('bar');
  const [xCol, setXCol] = useState(categoricalCols[0] || allCols[0] || '');
  const [yCol, setYCol] = useState(numericCols[0] || '');
  const [aggFn, setAggFn] = useState('mean');
  const [colorScheme, setColorScheme] = useState(0);

  const chartData = useMemo(() => {
    if (!data.length) return [];
    if (chartType === 'histogram') return buildHistogramData(data, yCol || numericCols[0]);
    if (chartType === 'pie') return buildValueCountData(data, xCol);
    if (chartType === 'scatter') {
      return data.slice(0, 500).map((r) => ({
        x: parseFloat(r[xCol]),
        y: parseFloat(r[yCol]),
      })).filter((p) => !isNaN(p.x) && !isNaN(p.y));
    }
    return buildAggregatedData(data, xCol, yCol, aggFn);
  }, [data, chartType, xCol, yCol, aggFn, numericCols]);

  const activeColor = COLORS[colorScheme % COLORS.length];

  const renderChart = () => {
    if (!chartData.length) {
      return <div className="no-data">No data to display. Check your column selections.</div>;
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 10, bottom: 60 },
    };

    const axisStyle = { fill: '#64748b', fontSize: 12 };
    const gridStyle = { stroke: '#1e3a5f', strokeDasharray: '3 3' };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart {...commonProps}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey={xCol} tick={axisStyle} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: 8 }} />
              <Bar dataKey={yCol} fill={activeColor} radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={420}>
            <LineChart {...commonProps}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey={xCol} tick={axisStyle} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Line type="monotone" dataKey={yCol} stroke={activeColor} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={activeColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey={xCol} tick={axisStyle} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Area type="monotone" dataKey={yCol} stroke={activeColor} strokeWidth={2.5} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie': {
        const RADIAN = Math.PI / 180;
        const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
          if (percent < 0.04) return null;
          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);
          return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
              {`${(percent * 100).toFixed(0)}%`}
            </text>
          );
        };
        return (
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={160}
                labelLine={false}
                label={renderLabel}
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="x" name={xCol} tick={axisStyle} label={{ value: xCol, position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} />
              <YAxis dataKey="y" name={yCol} tick={axisStyle} label={{ value: yCol, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter data={chartData} fill={activeColor} fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 80 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="range" tick={axisStyle} angle={-45} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={activeColor} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="chart-builder card">
      {/* Controls */}
      <div className="chart-controls">
        {/* Chart type selector */}
        <div className="control-group">
          <label className="control-label">Chart Type</label>
          <div className="chart-type-btns">
            {CHART_TYPES.map((ct) => (
              <button
                key={ct.id}
                className={`chart-type-btn ${chartType === ct.id ? 'active' : ''}`}
                onClick={() => setChartType(ct.id)}
                title={ct.label}
              >
                <span>{ct.icon}</span>
                <span>{ct.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Column + aggregation selectors */}
        <div className="selectors-row">
          {chartType !== 'histogram' && (
            <div className="control-group">
              <label className="control-label">
                {chartType === 'pie' ? 'Category Column' : chartType === 'scatter' ? 'X Column (numeric)' : 'X Axis (Category)'}
              </label>
              <select
                className="col-select"
                value={xCol}
                onChange={(e) => setXCol(e.target.value)}
              >
                <option value="">— Select column —</option>
                {(chartType === 'scatter' ? numericCols : allCols).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {chartType !== 'pie' && (
            <div className="control-group">
              <label className="control-label">
                {chartType === 'scatter' ? 'Y Column (numeric)' : chartType === 'histogram' ? 'Numeric Column' : 'Y Axis (Numeric)'}
              </label>
              <select
                className="col-select"
                value={yCol}
                onChange={(e) => setYCol(e.target.value)}
              >
                <option value="">— Select column —</option>
                {numericCols.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {!['pie', 'scatter', 'histogram'].includes(chartType) && (
            <div className="control-group">
              <label className="control-label">Aggregation</label>
              <select
                className="col-select"
                value={aggFn}
                onChange={(e) => setAggFn(e.target.value)}
              >
                <option value="mean">Mean (Avg)</option>
                <option value="sum">Sum</option>
                <option value="count">Count</option>
                <option value="min">Min</option>
                <option value="max">Max</option>
              </select>
            </div>
          )}

          <div className="control-group">
            <label className="control-label">Color</label>
            <div className="color-swatches">
              {COLORS.slice(0, 8).map((c, i) => (
                <button
                  key={i}
                  className={`swatch ${colorScheme === i ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColorScheme(i)}
                  aria-label={`Color ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="chart-area">
        {renderChart()}
      </div>

      {/* Data count indicator */}
      <div className="chart-footer">
        <span>Showing {chartData.length} data points</span>
        {chartType === 'scatter' && <span> (capped at 500 points)</span>}
      </div>
    </div>
  );
}

export default ChartBuilder;

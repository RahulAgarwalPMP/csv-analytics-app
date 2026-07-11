# CSV Analytics App

An interactive full-stack web app that lets you upload any CSV file and instantly explore your data through dynamic charts.

Built with **React** (frontend) + **FastAPI** (backend) + **Recharts** (charts).

---

## Features

- **Drag & drop CSV upload** — or click to browse
- **Auto column detection** — numeric, categorical, and datetime types
- **6 interactive chart types:**
  - Bar Chart
  - Line Chart
  - Area Chart
  - Pie Chart (value counts)
  - Scatter Plot
  - Histogram
- **Aggregation controls** — Mean, Sum, Count, Min, Max
- **Color picker** for chart theming
- **Data Preview table** — searchable, paginated, up to 100 rows
- **Column summary** — row count, column count, type breakdown
- FastAPI auto-docs at `/docs`

---

## Project Structure

```
csv-analytics-app/
├── backend/
│   ├── main.py            # FastAPI app with /upload, /analyze, /chart-data
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Root component + state management
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── components/
│   │       ├── FileUpload.js      # Drag & drop uploader
│   │       ├── DataSummary.js     # Stats strip + column chips
│   │       ├── ChartBuilder.js    # Chart selector + Recharts renderer
│   │       └── DataPreview.js     # Searchable data table
│   └── package.json
├── start-backend.bat      # Start FastAPI server
├── start-frontend.bat     # Start React dev server
└── start-all.bat          # Start both in separate windows
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.9+ |
| Node.js | 16+ |
| npm | 8+ |

---

## Quick Start (Windows)

### Option A — One command (recommended)
Double-click `start-all.bat` — it opens two terminal windows, one for each service.

### Option B — Manually

**Terminal 1 — Backend:**
```cmd
cd csv-analytics-app\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```cmd
cd csv-analytics-app\frontend
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/upload` | Upload CSV → returns metadata + 5-row preview |
| POST | `/analyze` | Upload CSV → returns full dataset + column summary |
| POST | `/chart-data` | Upload CSV + column params → aggregated chart data |

Full interactive docs: **http://localhost:8000/docs**

---

## Usage

1. Open the app at `http://localhost:3000`
2. Drag & drop (or click to browse) your CSV file
3. The app automatically detects column types and loads your data
4. Use the **Chart Type** buttons to switch between Bar, Line, Area, Pie, Scatter, Histogram
5. Select **X Axis** (category) and **Y Axis** (numeric) columns
6. Choose an **Aggregation** function (Mean, Sum, Count, Min, Max)
7. Pick a **Color** from the swatch palette
8. Switch to the **Data Preview** tab to browse raw rows with search

### Example — Using the included staff_data.csv
- **Chart:** Bar | **X:** Department | **Y:** Salary | **Agg:** Mean → average salary per department
- **Chart:** Pie | **X:** Department → headcount distribution
- **Chart:** Bar | **X:** Division | **Y:** Salary | **Agg:** Count → staff count per division
- **Chart:** Histogram | **Y:** Salary → salary distribution curve

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Recharts 2, CSS3 |
| Backend | FastAPI, Uvicorn |
| Data | Pandas, NumPy |
| Styling | Custom dark theme (no UI framework) |

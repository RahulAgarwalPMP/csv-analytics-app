from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import io
import json

app = FastAPI(title="CSV Analytics API", version="1.0.0")

# Allow React dev server
import os

# Allow localhost for dev, and any Railway-deployed frontend via env var
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    ALLOWED_ORIGINS.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def safe_convert(obj):
    """Convert numpy/pandas types to JSON-serializable Python types."""
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj) if not np.isnan(obj) else None
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, pd.Timestamp):
        return str(obj)
    return obj


def dataframe_summary(df: pd.DataFrame) -> dict:
    """Return column metadata including type classification."""
    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if df[col].dtype in [np.int64, np.int32, np.float64, np.float32]:
            col_type = "numeric"
        elif df[col].dtype == object:
            # Check if it looks like a date
            try:
                pd.to_datetime(df[col].dropna().head(5))
                col_type = "datetime"
            except Exception:
                col_type = "categorical"
        else:
            col_type = "categorical"

        unique_count = int(df[col].nunique())
        null_count = int(df[col].isnull().sum())

        columns.append({
            "name": col,
            "dtype": dtype,
            "type": col_type,
            "unique": unique_count,
            "nulls": null_count,
        })
    return {
        "columns": columns,
        "row_count": len(df),
        "col_count": len(df.columns),
    }


@app.get("/")
def root():
    return {"message": "CSV Analytics API is running"}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file and return column metadata."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file is empty.")

    summary = dataframe_summary(df)
    # Return first 5 rows as preview
    preview = df.head(5).replace({np.nan: None}).to_dict(orient="records")

    return JSONResponse({
        "filename": file.filename,
        "summary": summary,
        "preview": preview,
    })


@app.post("/analyze")
async def analyze_csv(
    file: UploadFile = File(...),
):
    """Upload CSV and return full data for charting."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    df = df.replace({np.nan: None})
    records = df.to_dict(orient="records")
    summary = dataframe_summary(df)

    return JSONResponse({
        "summary": summary,
        "data": records,
    })


@app.post("/chart-data")
async def get_chart_data(
    file: UploadFile = File(...),
    x_col: str = None,
    y_col: str = None,
    group_col: str = None,
    chart_type: str = "bar",
):
    """Return aggregated data for a specific chart configuration."""
    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if x_col and x_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{x_col}' not found.")
    if y_col and y_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{y_col}' not found.")

    result = {}

    # Value counts for categorical columns
    if x_col and not y_col:
        counts = df[x_col].value_counts().reset_index()
        counts.columns = [x_col, "count"]
        result["data"] = counts.replace({np.nan: None}).to_dict(orient="records")

    # Aggregation: group x, aggregate y
    elif x_col and y_col:
        if group_col and group_col in df.columns:
            agg = df.groupby([x_col, group_col])[y_col].mean().reset_index()
        else:
            agg = df.groupby(x_col)[y_col].mean().reset_index()
        agg[y_col] = agg[y_col].round(2)
        result["data"] = agg.replace({np.nan: None}).to_dict(orient="records")

    # Descriptive stats for numeric column
    if y_col and df[y_col].dtype in [np.int64, np.float64, np.int32, np.float32]:
        stats = df[y_col].describe()
        result["stats"] = {k: safe_convert(v) for k, v in stats.items()}

    return JSONResponse(result)

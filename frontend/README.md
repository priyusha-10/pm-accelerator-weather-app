# ForecastHub 🌤️

ForecastHub is a modern, responsive weather dashboard built with **React (Vite)** and **FastAPI**. It features real-time weather data, historical tracking, data visualization, and export capabilities.

**Quick Stats:**
- **Frontend**: React, Vite, CSS Modules (Glassmorphism UI)
- **Backend**: Python FastAPI, SQLite, SQLAlchemy
- **Data Source**: Open-Meteo & Photon (Free, No API Key Required)

---

## 🚀 Setup Guide

Follow these steps to run the application locally.

### 1. Prerequisites

Ensure you have the following installed:
- **Node.js** (v16+) & npm
- **Python** (v3.9+) & pip
- **Git**

### 2. Clone the Repository

```bash
git clone <repository_url>
cd pm-accelerator-weather-app
```

### 3. Backend Setup

The backend runs on `http://localhost:8000`.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Start the server:
    ```bash
    uvicorn main:app --reload
    ```
    *You should see: `Uvicorn running on http://127.0.0.1:8000`*

### 4. Frontend Setup

The frontend runs on `http://localhost:5173`.

1.  Open a **new terminal** and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    *Open the URL shown in the terminal (usually `http://localhost:5173`) in your browser.*

---

## 🛠️ Configuration

**API Keys**: 
Good news! This project uses **Open-Meteo** and **Photon Geocoding**, which are free APIs that do **not** require an API key. You can run the app immediately without creating a `.env` file.

**Ports**:
- Frontend: `5173`
- Backend: `8000`

If you need to change ports, update:
- **Frontend**: `frontend/vite.config.js`
- **Backend CORS**: `backend/main.py` (Update `allow_origins`)

---

## 🐞 Troubleshooting

**1. "Failed to fetch" or Network Error**
- Ensure the **Backend** is running (`uvicorn main:app --reload`).
- Check if the backend port is `8000`.

**2. Map not loading**
- The map uses Leaflet/OpenStreetMap tiles which require an internet connection.

**3. "Module not found"**
- Ensure you ran `pip install -r requirements.txt` (backend) or `npm install` (frontend) in the correct directories.

---

## ✨ Features
- **Current Weather**: Instant temperature, humidity, wind, and conditions.
- **5-Day Forecast**: Predictive outlook with daily highs/lows.
- **History Panel**: Tracks search history with editable notes and dates.
- **Interactive Map**: Visual location picker.
- **Data Export**: Download history as CSV, XML, or Markdown.
- **Responsive Design**: Optimized for Desktop, Tablet, and Mobile.

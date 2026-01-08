from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import requests
import database
import models
import datetime

# Create Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class WeatherBase(BaseModel):
    location: str
    temperature: float
    description: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    note: Optional[str] = None

class WeatherCreate(WeatherBase):
    pass

class WeatherUpdate(BaseModel):
    note: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class Weather(WeatherBase):
    id: int
    timestamp: datetime.datetime

    class Config:
        orm_mode = True

# Routes

@app.get("/")
def read_root():
    return {"message": "Weather AI Backend API"}

import re

@app.get("/weather")
def get_current_weather(location: str, unit: str = "celsius", start_date: str = None, end_date: str = None):
    # Check if location is a GPS coordinate string (e.g., "40.71, -74.00")
    coord_match = re.match(r"^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$", location.strip())
    
    if coord_match:
        lat = float(coord_match.group(1))
        lon = float(coord_match.group(2))
        display_name = f"Coordinates: {lat}, {lon}"
    else:
        # Geocoding search (Photon API supports Landmarks, Zip, and Cities)
        geo_url = f"https://photon.komoot.io/api/?q={location}&limit=1"
        try:
            geo_res = requests.get(geo_url, headers={"User-Agent": "WeatherAppAssessment/1.0"}).json()
        except Exception as e:
            print(f"Geocoding Error: {e}")
            raise HTTPException(status_code=503, detail=f"Geocoding service error: {str(e)}")

        if not geo_res.get("features"):
            raise HTTPException(
                status_code=404, 
                detail=f"Location '{location}' not found. Try 'City, Country' or 'Zip Code'."
            )
        
        feature = geo_res["features"][0]
        properties = feature["properties"]
        lon, lat = feature["geometry"]["coordinates"]
        
        # Robust normalization from Photon properties
        name = properties.get("name")
        city = properties.get("city")
        state = properties.get("state")
        country = properties.get("country")
        
        parts = []
        for p in [name, city, state, country]:
            if p and p not in parts:
                parts.append(p)
        display_name = ", ".join(parts)
    
    # Weather fetching with optional date range
    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&temperature_unit={unit}&forecast_days=8"
    
    # Add date range if provided
    if start_date and end_date:
        weather_url += f"&start_date={start_date}&end_date={end_date}"
    
    try:
        weather_res = requests.get(weather_url).json()
    except Exception:
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    
    if "current" not in weather_res and "daily" not in weather_res:
         raise HTTPException(status_code=500, detail="Failed to fetch weather data")

    # Build response
    response = {
        "location": display_name,
        "latitude": lat,
        "longitude": lon,
        "daily": weather_res.get("daily", {}),
        "current_units": weather_res.get("current_units", {})
    }
    
    # Include current weather if available (not available for historical ranges)
    if "current" in weather_res:
        response["current"] = weather_res["current"]
    
    # Include separate dates if specified
    if start_date and end_date:
        response["start_date"] = start_date
        response["end_date"] = end_date
    
    return response

@app.get("/weather/coordinates")
def get_weather_by_coordinates(lat: float, lon: float, unit: str = "celsius"):
    # Weather
    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&temperature_unit={unit}&forecast_days=8"
    
    try:
        weather_res = requests.get(weather_url).json()
    except Exception:
         raise HTTPException(status_code=503, detail="Weather service unavailable")
         
    if "current" not in weather_res:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data for coordinates")

    return {
        "location": "Your Location",
        "latitude": lat,
        "longitude": lon,
        "current": weather_res.get("current", {}),
        "daily": weather_res.get("daily", {}),
        "current_units": weather_res.get("current_units", {})
    }

# CRUD Operations

@app.post("/history", response_model=Weather)
def create_history(item: WeatherCreate, db: Session = Depends(database.get_db)):
    db_item = models.WeatherHistory(
        location=item.location,
        temperature=item.temperature,
        description=item.description,
        start_date=item.start_date,
        end_date=item.end_date,
        note=item.note,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/history", response_model=List[Weather])
def read_history(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    items = db.query(models.WeatherHistory).order_by(models.WeatherHistory.timestamp.desc()).offset(skip).limit(limit).all()
    return items

@app.put("/history/{id}", response_model=Weather)
def update_history(id: int, request: WeatherUpdate, db: Session = Depends(database.get_db)):
    item = db.query(models.WeatherHistory).filter(models.WeatherHistory.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update fields if provided
    if request.note is not None:
        item.note = request.note
    if request.start_date is not None:
        item.start_date = request.start_date
    if request.end_date is not None:
        item.end_date = request.end_date
        
    db.commit()
    db.refresh(item)
    return item

@app.delete("/history/{id}")
def delete_history(id: int, db: Session = Depends(database.get_db)):
    item = db.query(models.WeatherHistory).filter(models.WeatherHistory.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}

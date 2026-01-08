from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class WeatherHistory(Base):
    __tablename__ = "weather_history"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, index=True)
    temperature = Column(Float)
    description = Column(String)
    date_range = Column(String, nullable=True) # Storing as string for simplicity
    note = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

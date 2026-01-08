from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class WeatherHistory(Base):
    __tablename__ = "weather_history"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, index=True)
    temperature = Column(Float)
    description = Column(String)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    note = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

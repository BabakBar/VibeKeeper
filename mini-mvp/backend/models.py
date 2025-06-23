from sqlalchemy import create_engine, Column, Integer, String, Date, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class Occasion(Base):
    __tablename__ = 'occasions'
    
    id = Column(Integer, primary_key=True, index=True)
    person = Column(String, nullable=False)
    occasion_type = Column(String, nullable=False)
    occasion_date = Column(Date, nullable=False)
    raw_input = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Occasion(person='{self.person}', occasion='{self.occasion_type}', date='{self.occasion_date}')>"

DATABASE_URL = "sqlite:///./occasions.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
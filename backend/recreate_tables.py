#!/usr/bin/env python3
"""
Script to recreate database tables with the updated schema.
This will drop the existing recipients table and recreate it with the correct columns.
"""

from app.database import engine
from app.models import Base

def recreate_tables():
    print("Dropping and recreating all tables...")
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("✅ Dropped existing tables")
    
    # Create all tables with updated schema
    Base.metadata.create_all(bind=engine)
    print("✅ Created tables with new schema")
    
    print("\nDatabase schema updated successfully!")
    print("Recipients table now has columns: id, name, blood_type, organ_needed, location, status")

if __name__ == "__main__":
    recreate_tables()
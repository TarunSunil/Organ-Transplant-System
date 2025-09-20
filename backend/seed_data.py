#!/usr/bin/env python3
"""
Script to populate the database with mock donors and recipients for testing.
"""

from app.database import SessionLocal
from app.models import Donor, Recipient, AllocationLog
import random

def create_mock_data():
    db = SessionLocal()
    
    try:
        # Clear existing data (handle foreign key constraints)
        db.query(AllocationLog).delete()  # Delete logs first
        db.query(Donor).delete()
        db.query(Recipient).delete()
        db.commit()
        
        # Mock donors data
        donors_data = [
            {
                "name": "John Smith",
                "blood_type": "O+",
                "age": 34,
                "location": "New York",
                "organ": "kidney",
                "status": "available"
            },
            {
                "name": "Emily Johnson",
                "blood_type": "A+",
                "age": 28,
                "location": "Los Angeles",
                "organ": "liver",
                "status": "available"
            },
            {
                "name": "Michael Brown",
                "blood_type": "B+",
                "age": 42,
                "location": "Chicago",
                "organ": "heart",
                "status": "available"
            },
            {
                "name": "Sarah Davis",
                "blood_type": "AB+",
                "age": 31,
                "location": "Houston",
                "organ": "kidney",
                "status": "available"
            },
            {
                "name": "Robert Wilson",
                "blood_type": "O-",
                "age": 39,
                "location": "Phoenix",
                "organ": "liver",
                "status": "available"
            }
        ]
        
        # Mock recipients data
        recipients_data = [
            {
                "name": "Jennifer Miller",
                "blood_type": "O+",
                "organ_needed": "kidney",
                "location": "Boston",
                "status": "waiting"
            },
            {
                "name": "David Garcia",
                "blood_type": "A+",
                "organ_needed": "liver",
                "location": "Miami",
                "status": "waiting"
            },
            {
                "name": "Lisa Martinez",
                "blood_type": "B+",
                "organ_needed": "heart",
                "location": "Seattle",
                "status": "waiting"
            },
            {
                "name": "James Anderson",
                "blood_type": "AB+",
                "organ_needed": "kidney",
                "location": "Denver",
                "status": "waiting"
            },
            {
                "name": "Mary Thompson",
                "blood_type": "O-",
                "organ_needed": "liver",
                "location": "Atlanta",
                "status": "waiting"
            },
            {
                "name": "Christopher Lee",
                "blood_type": "A-",
                "organ_needed": "kidney",
                "location": "San Diego",
                "status": "waiting"
            },
            {
                "name": "Amanda White",
                "blood_type": "B-",
                "organ_needed": "heart",
                "location": "Portland",
                "status": "waiting"
            },
            {
                "name": "Daniel Harris",
                "blood_type": "AB-",
                "organ_needed": "liver",
                "location": "Nashville",
                "status": "waiting"
            }
        ]
        
        # Create donors
        for donor_data in donors_data:
            donor = Donor(**donor_data)
            db.add(donor)
        
        # Create recipients
        for recipient_data in recipients_data:
            recipient = Recipient(**recipient_data)
            db.add(recipient)
        
        db.commit()
        
        print(f"✅ Successfully created {len(donors_data)} donors and {len(recipients_data)} recipients")
        print("\nDonors created:")
        for donor in donors_data:
            print(f"  - {donor['name']} ({donor['blood_type']}) - {donor['organ']} from {donor['location']}")
        
        print("\nRecipients created:")
        for recipient in recipients_data:
            print(f"  - {recipient['name']} ({recipient['blood_type']}) - needs {recipient['organ_needed']} in {recipient['location']}")
            
    except Exception as e:
        print(f"❌ Error creating mock data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_mock_data()
#!/usr/bin/env python3
"""
Script to list all users in the database.
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from sqlalchemy import text

def list_all_users():
    """List all users in the database."""
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT id, email, first_name, last_name, is_admin, role, status FROM users ORDER BY id"))
        users = result.fetchall()
        
        if not users:
            print("No users found in the database.")
            return
        
        print("=" * 80)
        print("ALL USERS IN DATABASE")
        print("=" * 80)
        print()
        print(f"{'ID':<5} {'Email':<40} {'Name':<30} {'Admin':<8} {'Role':<10} {'Status':<10}")
        print("-" * 80)
        
        for user in users:
            user_id, email, first_name, last_name, is_admin, role, status = user
            name = f"{first_name or ''} {last_name or ''}".strip() or 'N/A'
            admin_status = 'Yes' if is_admin else 'No'
            role_str = str(role) if role else 'N/A'
            status_str = str(status) if status else 'N/A'
            
            print(f"{user_id:<5} {email:<40} {name:<30} {admin_status:<8} {role_str:<10} {status_str:<10}")
        
        print()
        print("=" * 80)
        print("To update a user to admin, run:")
        print("  python3 update_user_to_admin.py <email>")
        print("=" * 80)
        
    except Exception as e:
        print(f"✗ Error listing users: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    list_all_users()


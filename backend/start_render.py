#!/usr/bin/env python3
"""
Render startup script with better error handling
"""

import os
import sys
from config import settings

def main():
    print("🚀 Starting Juridence Backend on Render...")
    
    # Debug configuration
    print(f"\n🔍 Configuration Debug:")
    print(f"  DATABASE_URL_ENV: {'SET' if os.getenv('DATABASE_URL_ENV') else 'NOT SET'}")
    print(f"  Final database_url: {settings.database_url[:50]}..." if len(settings.database_url) > 50 else settings.database_url)
    
    # Test database connection
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(settings.database_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print(f"   Database URL: {settings.database_url}")
        return 1
    
    # Start the application
    try:
        import uvicorn
        port = int(os.getenv('PORT', 8000))
        print(f"🌐 Starting server on port {port}...")
        uvicorn.run("main:app", host="0.0.0.0", port=port)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())

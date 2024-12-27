import duckdb
import os
from pathlib import Path

def initialize_database():
    # Get the path to the database file
    project_root = Path(__file__).parent.parent.parent
    db_path = project_root / 'dashboard' / 'db' / 'analysis_db.duckdb'
    
    # Create the database directory if it doesn't exist
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        # Connect to the database
        con = duckdb.connect(str(db_path))
        
        # Create the necessary schemas
        con.execute("CREATE SCHEMA IF NOT EXISTS main_seeds;")
        con.execute("CREATE SCHEMA IF NOT EXISTS main_analytics;")
        
        # Test the connection
        result = con.execute("SELECT 1 as test").fetchall()
        print(f"Database initialized successfully at {db_path}")
        print(f"Connection test result: {result}")
        
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        raise
    finally:
        if 'con' in locals():
            con.close()

if __name__ == "__main__":
    initialize_database()
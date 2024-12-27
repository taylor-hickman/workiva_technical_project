import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'duckdb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function initializeDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    console.log('Initializing database at:', dbPath);
    const db = new Database.Database(dbPath);
    
    db.all('SELECT 1 as test', (err, result) => {
      if (err) {
        console.error('Database initialization error:', err);
        db.close();
        reject(err);
        return;
      }
      
      console.log('Connection test result:', result);
      resolve(db);
    });
  });
}

function verifyDatabaseConnection(db) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'main'
    `, (err, tables) => {
      if (err) {
        console.error('Database verification failed:', err);
        reject(err);
        return;
      }
      
      console.log('Available tables:', tables);
      resolve(tables.length > 0);
    });
  });
}

async function setupDatabase() {
  let db;
  try {
    const dbPath = join(__dirname, '../db/analysis_db.duckdb');
    db = await initializeDatabase(dbPath);
    const isConnected = await verifyDatabaseConnection(db);
    
    if (isConnected) {
      console.log('Database setup successful');
    } else {
      console.log('Database initialized but no tables found');
    }
  } catch (error) {
    console.error('Setup failed:', error);
    console.error(error.stack);
  } finally {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed successfully');
        }
      });
    }
  }
}

setupDatabase();
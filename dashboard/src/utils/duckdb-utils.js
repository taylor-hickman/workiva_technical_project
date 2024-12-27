// src/utils/duckdb-utils.js
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';

let db;
let connection;

// Initialize WebAssembly exception tag
const initWebAssemblyTag = () => {
  if (!('Tag' in WebAssembly)) {
    console.warn('WebAssembly.Tag is not supported in this environment');
    return;
  }
  
  try {
    globalThis.__cpp_exception = new WebAssembly.Tag({ parameters: ['externref'] });
  } catch (error) {
    console.error('Failed to initialize WebAssembly.Tag:', error);
  }
};

export const initializeDuckDB = async () => {
  try {
    console.log('Initializing DuckDB...');
    
    initWebAssemblyTag();

    // For GitHub Pages, we need to use the repo-relative path
    const repoBase = import.meta.env.BASE_URL || '/';
    
    // Bundle the WASM files with Vite
    const DUCKDB_CONFIG = {
      mainModule: duckdb_wasm,
      mainWorker: duckdb_worker
    };

    // Initialize logger
    const logger = new duckdb.ConsoleLogger();
    
    // Create a new worker
    const worker = new Worker(DUCKDB_CONFIG.mainWorker);
    
    // Initialize the database
    db = new duckdb.AsyncDuckDB(logger, worker);
    
    await db.instantiate({
      mainModule: DUCKDB_CONFIG.mainModule,
      accelerate: false,
      query: {
        castBigIntToDouble: true
      }
    });

    connection = await db.connect();
    
    await initializeDatabase();
    console.log('DuckDB initialized successfully');
    return true;

  } catch (error) {
    console.error('Database initialization error:', error);
    await closeConnection();
    throw error;
  }
};

async function initializeDatabase() {
  if (!connection) {
    throw new Error('No database connection available');
  }

  try {
    await connection.query(`CREATE SCHEMA IF NOT EXISTS main_analytics;`);
    
    const tables = [
      'fact_account_summary',
      'fact_top_revenue_accounts',
      'fact_order_revenue_metrics',
      'fact_opportunity_order_details',
      'fact_emea_monthly_orders',
      'fact_recent_top_accounts',
      'fact_account_order_cohorts'
    ];

    // For GitHub Pages, we need to use the repo-relative path
    const repoBase = import.meta.env.BASE_URL || '/';

    for (const table of tables) {
      try {
        const response = await fetch(`${repoBase}data/${table}.json`);
        if (!response.ok) {
          console.warn(`Failed to fetch ${table}.json: ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          console.warn(`No data found for ${table}`);
          continue;
        }

        await createAndPopulateTable(table, data);
      } catch (error) {
        console.error(`Error loading ${table}:`, error);
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function createAndPopulateTable(tableName, data) {
  const columnDefinitions = Object.entries(data[0])
    .map(([key, value]) => {
      const type = typeof value === 'number' ? 'DOUBLE' : 'VARCHAR';
      return `"${key}" ${type}`;
    })
    .join(', ');

  await connection.query(`
    DROP TABLE IF EXISTS main_analytics.${tableName};
    CREATE TABLE main_analytics.${tableName} (${columnDefinitions});
  `);

  // Use batch insert for better performance
  const batchSize = 1000;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch.map(row => `(${Object.values(row).map(v => 
      typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v).join(', ')})`).join(', ');
    
    await connection.query(`
      INSERT INTO main_analytics.${tableName} VALUES ${values}
    `);
  }
}

export const queryData = async (query) => {
  if (!connection) {
    throw new Error('Database connection not initialized');
  }
  
  try {
    const result = await connection.query(query);
    return result.toArray();
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

export const closeConnection = async () => {
  try {
    if (connection) {
      await connection.close();
      connection = null;
    }
    if (db) {
      await db.terminate();
      db = null;
    }
    console.log('Database connection closed successfully');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};
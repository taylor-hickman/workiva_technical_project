// src/lib/duckdb-utils.js
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

let db = null;
let conn = null;

export async function initializeDuckDB() {
  if (db) return { db, conn };

  try {
    console.log('Initializing DuckDB...');

    const MANUAL_BUNDLES = {
      mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
      },
      eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
      },
    };

    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    console.log('Selected bundle:', bundle.name);

    // Instantiate the async version of DuckDB-wasm
    const worker = new Worker(bundle.mainWorker);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule);

    // Create a connection
    conn = await db.connect();
    console.log('DuckDB initialized successfully');

    return { db, conn };
  } catch (error) {
    console.error('Error initializing DuckDB:', error);
    throw error;
  }
}

export async function queryData(query) {
  if (!conn) {
    throw new Error('Database connection not initialized');
  }
  
  try {
    const result = await conn.query(query);
    return result.toArray();
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

export async function loadData(dataPath) {
  if (!conn) {
    throw new Error('Database connection not initialized');
  }

  try {
    // First, create the fact tables schema
    await conn.query(`
      CREATE TABLE IF NOT EXISTS fact_account_summary (
        account_id BIGINT,
        sign_up_date BIGINT,
        first_order_date BIGINT,
        lifetime_gross_revenue DOUBLE
      )
    `);

    // Load the JSON data
    const response = await fetch(dataPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${dataPath}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Loaded data from ${dataPath}:`, data.slice(0, 2));

    // Insert the data
    for (const row of data) {
      await conn.query({
        sql: `INSERT INTO fact_account_summary VALUES (?, ?, ?, ?)`,
        parameters: [
          row.account_id,
          row.sign_up_date,
          row.first_order_date,
          row.lifetime_gross_revenue
        ]
      });
    }

    console.log(`Successfully loaded ${data.length} rows from ${dataPath}`);
    return data.length;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}
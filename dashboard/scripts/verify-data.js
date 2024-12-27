import Database from 'duckdb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function verifyDataIntegrity() {
  const dbPath = join(__dirname, '../db/analysis_db.duckdb');
  console.log('Verifying data integrity in:', dbPath);
  
  const db = new Database.Database(dbPath);
  
  const requiredTables = [
    'fact_account_summary',
    'fact_top_revenue_accounts',
    'fact_order_revenue_metrics',
    'fact_account_order_cohorts',
    'fact_opportunity_price_analysis'
  ];
  
  console.log('\nVerifying table record counts:');
  
  for (const table of requiredTables) {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM main_analytics.${table}
      `;
      
      const result = await new Promise((resolve, reject) => {
        db.all(query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`  - ${table}: ${result[0].count} records`);
    } catch (error) {
      console.error(`Error checking table ${table}:`, error.message);
    }
  }
  
  // Verify data relationships
  const integrityChecks = [
    {
      name: 'Account presence check',
      query: `
        SELECT COUNT(*) as missing_accounts
        FROM main_analytics.fact_account_summary s
        LEFT JOIN main_seeds.accounts a ON s.account_id = a.account_id
        WHERE a.account_id IS NULL
      `
    },
    {
      name: 'Order-Opportunity linkage check',
      query: `
        SELECT COUNT(*) as unlinked_orders
        FROM main_analytics.fact_order_revenue_metrics o
        LEFT JOIN main_analytics.fact_opportunity_order_details op 
        ON o.order_id = op.order_id
        WHERE op.order_id IS NULL
      `
    }
  ];
  
  console.log('\nRunning data integrity checks:');
  
  for (const check of integrityChecks) {
    try {
      const result = await new Promise((resolve, reject) => {
        db.all(check.query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      console.log(`  - ${check.name}: ${result[0].missing_accounts || result[0].unlinked_orders} issues found`);
    } catch (error) {
      console.error(`Error running check "${check.name}":`, error.message);
    }
  }
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('\nDatabase connection closed successfully');
    }
  });
}

verifyDataIntegrity().catch(console.error);
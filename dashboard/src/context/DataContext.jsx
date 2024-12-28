import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDuckDB, loadData, queryData } from '../lib/duckdb-utils';

const DataContext = createContext(null);

export function useData() {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const [data, setData] = useState({
    accountMetrics: null,
    revenueDistribution: null,
    orderPricing: null,
    opportunityStages: null,
    regionalPerformance: null,
    topAccounts: null,
    cohortAnalysis: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        console.log('Initializing database...');
        const { db, conn } = await initializeDuckDB();
        console.log('Database initialized successfully');

        // Load all fact tables
        const factTables = [
          'fact_account_summary',
          'fact_top_revenue_accounts',
          'fact_order_revenue_metrics',
          'fact_opportunity_order_details',
          'fact_emea_monthly_orders',
          'fact_recent_top_accounts',
          'fact_account_order_cohorts'
        ];

        console.log('Loading data files...');
        for (const table of factTables) {
          const dataPath = `${import.meta.env.BASE_URL}data/${table}.json`;
          console.log(`Loading ${dataPath}...`);
          await loadData(dataPath);
        }

        // Query the data
        console.log('Querying data...');
        const results = await Promise.all([
          queryData('SELECT * FROM fact_account_summary'),
          queryData('SELECT * FROM fact_top_revenue_accounts'),
          queryData('SELECT * FROM fact_order_revenue_metrics'),
          queryData('SELECT * FROM fact_opportunity_order_details'),
          queryData('SELECT * FROM fact_emea_monthly_orders'),
          queryData('SELECT * FROM fact_recent_top_accounts'),
          queryData('SELECT * FROM fact_account_order_cohorts')
        ]);

        setData({
          accountMetrics: results[0],
          revenueDistribution: results[1],
          orderPricing: results[2],
          opportunityStages: results[3],
          regionalPerformance: results[4],
          topAccounts: results[5],
          cohortAnalysis: results[6]
        });
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 rounded-lg bg-white shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}
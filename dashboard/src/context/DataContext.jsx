import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDuckDB, queryData } from '../utils/duckdb-utils';

const DataContext = createContext(null);

function useData() {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

function DataProvider({ children }) {
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
    async function loadData() {
      try {
        await initializeDuckDB();
        
        const results = await Promise.all([
          queryData('SELECT * FROM main_analytics.fact_account_summary'),
          queryData('SELECT * FROM main_analytics.fact_top_revenue_accounts'),
          queryData('SELECT * FROM main_analytics.fact_order_revenue_metrics'),
          queryData('SELECT * FROM main_analytics.fact_opportunity_order_details'),
          queryData('SELECT * FROM main_analytics.fact_emea_monthly_orders'),
          queryData('SELECT * FROM main_analytics.fact_recent_top_accounts'),
          queryData('SELECT * FROM main_analytics.fact_account_order_cohorts')
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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

export { DataProvider, useData };
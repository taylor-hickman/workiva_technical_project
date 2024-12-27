import React from 'react';
import { useData } from '../context/DataContext';
import AccountLifecycle from './charts/AccountLifecycle';
import RevenueDistribution from './charts/RevenueDistribution';
import OrderPriceDistribution from './charts/OrderPriceDistribution';
import OpportunityStage from './charts/OpportunityStage';
import RegionalPerformance from './charts/RegionalPerformance';
import TopAccounts from './charts/TopAccounts';
import CohortAnalysis from './charts/CohortAnalysis';

const Dashboard = () => {
  

  // Add debug output
  console.log('Dashboard data:', data);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Performance Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account Lifecycle</h2>
            <AccountLifecycle />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Distribution</h2>
            <RevenueDistribution />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Price Distribution</h2>
            <OrderPriceDistribution />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Opportunity Stage</h2>
            <OpportunityStage />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Regional Performance</h2>
            <RegionalPerformance />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Accounts</h2>
            <TopAccounts />
          </div>

          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Cohort Analysis</h2>
            <CohortAnalysis />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
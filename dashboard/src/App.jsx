import React from 'react';
import Dashboard from './components/Dashboard';
import { DataProvider } from './context/DataContext';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <DataProvider>
        <Dashboard />
      </DataProvider>
    </ErrorBoundary>
  );
};

export default App;
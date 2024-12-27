import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

const AccountLifecycle = () => {
  const { accountMetrics } = useData();
  
  const getChartOptions = () => ({
    title: {
      text: 'Account Lifecycle Metrics'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} days'
    },
    xAxis: {
      type: 'category',
      data: accountMetrics?.map(d => d.account_id) || []
    },
    yAxis: {
      type: 'value',
      name: 'Days to First Order'
    },
    series: [{
      data: accountMetrics?.map(d => d.signup_to_first_paid_lag_days) || [],
      type: 'line',
      smooth: true,
      areaStyle: {},
    }]
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Account Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts 
          option={getChartOptions()}
          style={{ height: '400px' }}
        />
      </CardContent>
    </Card>
  );
};

export default AccountLifecycle;
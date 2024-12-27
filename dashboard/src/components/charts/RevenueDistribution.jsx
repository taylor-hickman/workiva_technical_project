import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useMetrics } from '../../hooks/useMetrics';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const RevenueDistribution = () => {
  const { revenueDistribution } = useMetrics();

  const getChartOptions = () => ({
    title: { text: 'Revenue Distribution' },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: ${c}K'
    },
    xAxis: {
      type: 'category',
      data: revenueDistribution?.distribution.map(d => d.accountId) || []
    },
    yAxis: {
      type: 'value',
      name: 'Revenue ($K)',
      axisLabel: { formatter: '{value}K' }
    },
    series: [{
      data: revenueDistribution?.distribution.map(d => d.revenue / 1000) || [],
      type: 'bar',
      itemStyle: { color: '#3b82f6' }
    }]
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={getChartOptions()} style={{ height: '400px' }} />
      </CardContent>
    </Card>
  );
};

export default RevenueDistribution; 

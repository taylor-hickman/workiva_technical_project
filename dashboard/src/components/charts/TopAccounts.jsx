const TopAccounts = () => {
    const { topAccounts } = useMetrics();
  
    const getChartOptions = () => ({
      title: { text: 'Top 5 Accounts - Last 365 Days' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: topAccounts?.slice(0, 5).map(d => d.account_id) || []
      },
      yAxis: [
        { type: 'value', name: 'Orders' },
        { type: 'value', name: 'Revenue ($K)' }
      ],
      series: [
        {
          name: 'Orders',
          type: 'bar',
          data: topAccounts?.slice(0, 5).map(d => d.paid_orders_365d) || []
        },
        {
          name: 'Revenue',
          type: 'line',
          yAxisIndex: 1,
          data: topAccounts?.slice(0, 5).map(d => d.revenue_365d/1000) || []
        }
      ]
    });
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Performing Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={getChartOptions()} style={{ height: '400px' }} />
        </CardContent>
      </Card>
    );
  };
  
  export default TopAccounts; 
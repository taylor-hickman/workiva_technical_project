const RegionalPerformance = () => {
    const { regionalPerformance } = useMetrics();
  
    const getChartOptions = () => ({
      title: { text: 'EMEA Monthly Performance' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Orders', 'Revenue'] },
      xAxis: {
        type: 'category',
        data: regionalPerformance?.map(d => d.order_month) || []
      },
      yAxis: [
        { type: 'value', name: 'Orders' },
        { type: 'value', name: 'Revenue ($K)', axisLabel: { formatter: '${value}K' } }
      ],
      series: [
        {
          name: 'Orders',
          type: 'bar',
          data: regionalPerformance?.map(d => d.order_count) || []
        },
        {
          name: 'Revenue',
          type: 'line',
          yAxisIndex: 1,
          data: regionalPerformance?.map(d => d.total_revenue/1000) || []
        }
      ]
    });
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Regional Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={getChartOptions()} style={{ height: '400px' }} />
        </CardContent>
      </Card>
    );
  };
  
  export default RegionalPerformance; 
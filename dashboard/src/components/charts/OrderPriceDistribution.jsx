const OrderPriceDistribution = () => {
    const { orderPricing } = useMetrics();
  
    const getChartOptions = () => ({
      title: { text: 'Order Price Distribution' },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return `${params.name}<br/>
                  Median: $${params.data[4]}K<br/>
                  25th-75th: $${params.data[1]}-${params.data[2]}K`;
        }
      },
      xAxis: { type: 'category', data: orderPricing?.map(d => d.type) || [] },
      yAxis: { type: 'value', name: 'Price ($K)' },
      series: [{
        type: 'boxplot',
        data: orderPricing?.map(d => [
          d.p99/1000, d.p75/1000, d.median/1000, 
          d.p25/1000, d.mean/1000
        ]) || []
      }]
    });
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Price Distribution by Opportunity Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={getChartOptions()} style={{ height: '400px' }} />
        </CardContent>
      </Card>
    );
  };

  export default OrderPriceDistribution; 
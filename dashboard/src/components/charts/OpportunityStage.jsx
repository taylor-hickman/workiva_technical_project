const OpportunityStage = () => {
    const { opportunityStages } = useMetrics();
  
    const getChartOptions = () => ({
      title: { text: 'Opportunity Stage Analysis' },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const data = params.data;
          return `${data[3]}<br/>
                  Count: ${data[1]}<br/>
                  Avg Price: $${Math.round(data[2]/1000)}K`;
        }
      },
      xAxis: { type: 'value', name: 'Average Price ($K)' },
      yAxis: { type: 'value', name: 'Number of Orders' },
      series: [{
        type: 'scatter',
        symbolSize: function (data) {
          return Math.sqrt(data[2]) / 50;
        },
        data: opportunityStages?.map(d => [
          d.avgPrice/1000,
          d.count,
          d.totalRevenue,
          d.type
        ]) || [],
        itemStyle: { opacity: 0.8 }
      }]
    });
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Opportunity Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={getChartOptions()} style={{ height: '400px' }} />
        </CardContent>
      </Card>
    );
  };

  export default OpportunityStage; 
  
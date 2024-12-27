const CohortAnalysis = () => {
    const { cohortAnalysis } = useMetrics();
  
    const getChartOptions = () => ({
      title: { text: 'Cohort Analysis' },
      tooltip: { 
        position: 'top',
        formatter: function(params) {
          return `${params.name}: ${params.value}%`;
        }
      },
      grid: {
        height: '50%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: ['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
        splitArea: { show: true }
      },
      yAxis: {
        type: 'category',
        data: cohortAnalysis?.map(d => d.cohort) || [],
        splitArea: { show: true }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%'
      },
      series: [{
        name: 'Retention Rate',
        type: 'heatmap',
        data: cohortAnalysis?.flatMap((d, i) => 
          ['month0', 'month1', 'month2', 'month3', 'month4', 'month5', 'month6']
            .map((month, j) => [j, i, d[month]])
        ) || [],
        label: { show: true }
      }]
    });
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={getChartOptions()} style={{ height: '400px' }} />
        </CardContent>
      </Card>
    );
  };

  export default CohortAnalysis;
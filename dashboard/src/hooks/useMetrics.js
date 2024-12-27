import { useData } from '../context/DataContext';

export const useMetrics = () => {
  const data = useData();

  const processAccountMetrics = (accountData) => {
    if (!accountData) return null;
    return {
      signupLags: accountData.map(d => ({
        accountId: d.account_id,
        lagDays: d.signup_to_first_paid_lag_days || 0,
        revenue: d.lifetime_gross_revenue || 0
      })),
      totalAccounts: accountData.length,
      averageLagDays: accountData.reduce((acc, curr) => 
        acc + (curr.signup_to_first_paid_lag_days || 0), 0) / accountData.length
    };
  };

  const processRevenueData = (revenueData) => {
    if (!revenueData) return null;
    return {
      distribution: revenueData.map(d => ({
        accountId: d.account_id,
        revenue: d.lifetime_gross_revenue,
        rank: d.revenue_rank
      })).sort((a, b) => b.revenue - a.revenue),
      totalRevenue: revenueData.reduce((acc, curr) => acc + curr.lifetime_gross_revenue, 0)
    };
  };

  const processOrderPricing = (pricingData) => {
    if (!pricingData) return null;
    return pricingData.map(d => ({
      type: d.opportunity_type,
      mean: d.mean_price,
      median: d.median_price,
      p25: d.pct_25,
      p75: d.pct_75,
      p99: d.pct_99
    }));
  };

  const processOpportunityStages = (stageData) => {
    if (!stageData) return null;
    return Object.values(stageData.reduce((acc, curr) => {
      if (!acc[curr.opportunity_type]) {
        acc[curr.opportunity_type] = {
          type: curr.opportunity_type,
          count: 0,
          totalRevenue: 0,
          avgPrice: 0
        };
      }
      acc[curr.opportunity_type].count++;
      acc[curr.opportunity_type].totalRevenue += curr.original_price;
      acc[curr.opportunity_type].avgPrice = 
        acc[curr.opportunity_type].totalRevenue / acc[curr.opportunity_type].count;
      return acc;
    }, {}));
  };

  return {
    accountMetrics: processAccountMetrics(data.accountMetrics),
    revenueDistribution: processRevenueData(data.revenueDistribution),
    orderPricing: processOrderPricing(data.orderPricing),
    opportunityStages: processOpportunityStages(data.opportunityStages),
    regionalPerformance: data.regionalPerformance,
    topAccounts: data.topAccounts,
    cohortAnalysis: data.cohortAnalysis
  };
};
{{ config(
    materialized='table',
    schema='analytics',
    alias='fact_order_revenue_metrics',
    tags=['core']
) }}

/*
This model provides detailed statistical analysis of order prices across different opportunity types.
It calculates key distribution metrics including mean, median, and various percentiles to support
pricing analysis and decision-making. The model focuses on paid orders only to ensure metrics
reflect actual realized revenue.
*/

WITH price_stats AS (
    SELECT
        opportunity_type,
        COUNT(*) as order_count,
        COUNT(DISTINCT account_id) as unique_accounts,
        -- Core price statistics
        ROUND(AVG(original_price), 2) AS mean_price,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY original_price), 2) AS median_price,
        ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY original_price), 2) AS pct_25,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY original_price), 2) AS pct_75,
        ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY original_price), 2) AS pct_99,
        -- Price range metrics
        MIN(original_price) as min_price,
        MAX(original_price) as max_price,
        -- Revenue metrics
        SUM(original_price) as total_revenue
    FROM {{ ref('fact_opportunity_order_details') }}
    WHERE is_paid_flag = 1
    GROUP BY 1
)

SELECT 
    opportunity_type,
    order_count,
    unique_accounts,
    mean_price,
    median_price,
    pct_25,
    pct_75,
    pct_99,
    min_price,
    max_price,
    total_revenue,
    -- Derived metrics
    ROUND(total_revenue / order_count, 2) as revenue_per_order,
    ROUND(total_revenue / unique_accounts, 2) as revenue_per_account,
    ROUND((pct_75 - pct_25) / NULLIF(median_price, 0) * 100, 2) as price_dispersion_pct,
    {{ dbt_utils.generate_surrogate_key(['opportunity_type', 'CURRENT_DATE']) }} as metric_key
FROM price_stats
WHERE opportunity_type IS NOT NULL
ORDER BY total_revenue DESC
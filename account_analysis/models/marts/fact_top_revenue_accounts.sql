{{ config(
    materialized='table',
    schema='analytics',
    alias='fact_top_revenue_accounts',
    tags=['core']
) }}

/*
This model identifies and analyzes the top revenue-generating accounts based on lifetime gross revenue.
It uses the configured percentile threshold from dbt_project.yml to determine top performers
and enriches the data with account attributes for deeper analysis.
*/

WITH account_revenues AS (
    SELECT
        account_sk,
        account_id,
        account_type,
        location_bucket,
        lifetime_gross_revenue,
        lifetime_orders,
        opportunities_since_2h,
        PERCENT_RANK() OVER (ORDER BY lifetime_gross_revenue DESC) as revenue_percentile,
        DENSE_RANK() OVER (ORDER BY lifetime_gross_revenue DESC) as revenue_rank
    FROM {{ ref('fact_account_summary') }}
    WHERE lifetime_gross_revenue > 0
),

top_accounts AS (
    SELECT 
        *,
        ROUND(lifetime_gross_revenue / NULLIF(lifetime_orders, 0), 2) as avg_order_value
    FROM account_revenues
    WHERE revenue_percentile <= {{ var('top_account_percentile') }}
)

SELECT 
    account_sk,
    account_id,
    account_type,
    location_bucket,
    lifetime_gross_revenue,
    lifetime_orders,
    opportunities_since_2h,
    revenue_percentile,
    revenue_rank,
    avg_order_value,
    {{ dbt_utils.generate_surrogate_key(['account_id', 'CURRENT_DATE']) }} as analysis_key
FROM top_accounts
ORDER BY lifetime_gross_revenue DESC
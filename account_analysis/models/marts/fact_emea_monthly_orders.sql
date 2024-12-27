{{ config(
    materialized='table',
    schema='analytics',
    alias='fact_emea_monthly_orders',
    tags=['reporting']
) }}

/*
This model analyzes monthly order quantities specifically for EMEA region,
providing detailed opportunity-level breakdowns to support regional analysis.
*/

WITH monthly_orders AS (
    SELECT
        DATE_TRUNC('month', ord.create_date) AS order_month,
        ot.opportunity_type,
        COUNT(*) as order_count,
        COUNT(DISTINCT ord.account_id) as unique_accounts,
        SUM(ord.original_price) as total_revenue,
        COUNT(CASE WHEN ord.is_paid_flag = 1 THEN 1 END) as paid_orders_count
    FROM {{ ref('fact_opportunity_order_details') }} ord
    LEFT JOIN {{ ref('int_opportunities_enriched') }} ot 
        ON ord.opportunity_id = ot.opportunity_id
    WHERE ord.location = 'EMEA'
    GROUP BY 1, 2
)

SELECT 
    order_month,
    opportunity_type,
    order_count,
    unique_accounts,
    paid_orders_count,
    total_revenue,
    ROUND(paid_orders_count::DECIMAL / NULLIF(order_count, 0) * 100, 2) as paid_order_percentage,
    {{ dbt_utils.generate_surrogate_key(['order_month', 'opportunity_type']) }} as analysis_key
FROM monthly_orders
ORDER BY order_month DESC, total_revenue DESC
{{ config(
    materialized='table',
    schema='analytics',
    alias='fact_opportunity_price_analysis'
) }}

WITH opportunity_types AS (
    SELECT
        opportunity_id,
        CASE 
            WHEN opportunity_name ILIKE 'Renewal:%' THEN 'Renewal'
            WHEN opportunity_name ILIKE 'Renegotiation:%' THEN 'Renegotiation'
            WHEN opportunity_name ILIKE 'Credit Amendment:%' THEN 'Credit Amendment'
            WHEN opportunity_name ILIKE 'Additional Contract:%' THEN 'Additional Contract'
            WHEN opportunity_name ILIKE 'New Customer:%' THEN 'New Customer'
            ELSE 'Other'
        END as opportunity_type
    FROM {{ ref('stg_opportunities') }}
),

order_metrics AS (
    SELECT 
        ord.opportunity_id,
        ot.opportunity_type,
        COUNT(*) as order_count,
        AVG(ord.original_price) as avg_order_price,
        MIN(ord.original_price) as min_order_price,
        MAX(ord.original_price) as max_order_price,
        SUM(ord.original_price) as total_revenue,
        COUNT(CASE WHEN ord.is_paid_flag = 1 THEN 1 END) as paid_orders
    FROM {{ ref('int_orders_enriched') }} ord
    LEFT JOIN opportunity_types ot 
        ON ord.opportunity_id = ot.opportunity_id
    GROUP BY 1, 2
)

SELECT
    opportunity_type,
    COUNT(DISTINCT opportunity_id) as opportunity_count,
    SUM(order_count) as total_orders,
    ROUND(AVG(order_count), 2) as avg_orders_per_opportunity,
    ROUND(AVG(avg_order_price), 2) as avg_order_price,
    MIN(min_order_price) as min_order_price,
    MAX(max_order_price) as max_order_price,
    SUM(total_revenue) as total_revenue,
    SUM(paid_orders) as total_paid_orders,
    ROUND(SUM(paid_orders)::DECIMAL / NULLIF(SUM(order_count), 0) * 100, 2) as paid_order_percentage,
    {{ dbt_utils.generate_surrogate_key(['opportunity_type', 'CURRENT_DATE']) }} as analysis_key
FROM order_metrics
WHERE opportunity_type IS NOT NULL
GROUP BY 1
ORDER BY total_revenue DESC
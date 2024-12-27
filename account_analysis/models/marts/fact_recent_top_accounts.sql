{{ config(
    materialized='table',
    schema='analytics',
    alias='fact_recent_top_accounts',
    tags=['reporting']
) }}

/*
This model identifies the top performing accounts based on paid orders
within the last 365 days, supporting both overall and regional analysis.
The model ensures data completeness by using INNER JOINs for core account
information and proper handling of aggregations.
*/

WITH recent_paid_orders AS (
    SELECT 
        ord.account_id,
        acc.location,
        acc.account_type,
        acc.sign_up_date,
        COUNT(*) as paid_orders_365d,
        SUM(ord.original_price) as revenue_365d
    FROM {{ ref('int_orders_enriched') }} ord
    INNER JOIN {{ ref('stg_accounts') }} acc  -- Changed to INNER JOIN
        ON ord.account_id = acc.account_id
    WHERE 
        ord.create_date >= CURRENT_DATE - INTERVAL '365 days'
        AND ord.is_paid_flag = 1
    GROUP BY 1, 2, 3, 4
),

ranked_accounts AS (
    SELECT 
        rpo.*,
        DENSE_RANK() OVER (
            PARTITION BY rpo.location 
            ORDER BY rpo.paid_orders_365d DESC, rpo.revenue_365d DESC  -- Added secondary sort
        ) as region_rank,
        DENSE_RANK() OVER (
            ORDER BY rpo.paid_orders_365d DESC, rpo.revenue_365d DESC  -- Added secondary sort
        ) as overall_rank
    FROM recent_paid_orders rpo
)

SELECT 
    account_id,
    location,
    account_type,
    sign_up_date,
    paid_orders_365d,
    revenue_365d,
    region_rank,
    overall_rank,
    {{ dbt_utils.generate_surrogate_key(['account_id', 'CURRENT_DATE']) }} as analysis_key
FROM ranked_accounts
WHERE overall_rank <= 5 OR region_rank <= 5
ORDER BY overall_rank, region_rank
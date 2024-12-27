{{ config(
    materialized='table',
    schema='analytics',
    alias='fact_account_summary',
    tags=['core']
) }}

WITH accounts_base AS (
    SELECT
        account_sk,
        account_id,
        account_type,
        sign_up_date,
        location
    FROM {{ ref('stg_accounts') }}
),

valid_orders AS (
    SELECT 
        o.account_id,
        o.create_date,
        o.original_price,
        o.is_paid_flag
    FROM {{ ref('int_orders_enriched') }} o
    INNER JOIN accounts_base a 
        ON o.account_id = a.account_id
    WHERE 
        o.create_date >= a.sign_up_date
        AND o.is_paid_flag = 1
),

first_paid_order AS (
    SELECT
        account_id,
        MIN(create_date) AS first_paid_order_date
    FROM valid_orders
    GROUP BY 1
),

second_half_start AS (
    SELECT DATE_TRUNC('year', CURRENT_DATE) + 
        CASE 
            WHEN EXTRACT('month' FROM CURRENT_DATE) >= 7 
            THEN INTERVAL '6 months' 
            ELSE INTERVAL '0 months' 
        END AS period_start
),

recent_opportunities AS (
    SELECT
        io.account_id,
        COUNT(DISTINCT io.opportunity_id) AS opportunities_since_2h
    FROM {{ ref('int_opportunities_enriched') }} io
    CROSS JOIN second_half_start shs
    WHERE EXISTS (
        SELECT 1 
        FROM {{ ref('int_orders_enriched') }} ord 
        WHERE ord.opportunity_id = io.opportunity_id 
        AND ord.create_date >= shs.period_start
    )
    GROUP BY 1
),

order_summary AS (
    SELECT
        account_id,
        COUNT(*) AS lifetime_orders,
        SUM(original_price) AS lifetime_gross_revenue
    FROM valid_orders
    GROUP BY 1
)

SELECT
    ab.account_sk,
    ab.account_id,
    ab.account_type,
    ab.location,
    CASE 
        WHEN ab.location = 'North America' THEN 'North America'
        ELSE 'All Other'
    END AS location_bucket,
    ab.sign_up_date,
    DATE_DIFF('day', ab.sign_up_date, fpo.first_paid_order_date) AS signup_to_first_paid_lag_days,
    COALESCE(ro.opportunities_since_2h, 0) AS opportunities_since_2h,
    COALESCE(os.lifetime_orders, 0) AS lifetime_orders,
    COALESCE(os.lifetime_gross_revenue, 0) AS lifetime_gross_revenue,
    {{ dbt_utils.generate_surrogate_key(['ab.account_id', 'CURRENT_DATE']) }} as summary_key
FROM accounts_base ab
LEFT JOIN first_paid_order fpo 
    ON ab.account_id = fpo.account_id
LEFT JOIN order_summary os
    ON ab.account_id = os.account_id
LEFT JOIN recent_opportunities ro
    ON ab.account_id = ro.account_id
{{ config(
    materialized='table',
    schema='analytics',
    alias='fact_account_order_cohorts',
    tags=['reporting']
) }}

WITH account_signup_years AS (
    SELECT 
        account_id,
        DATE_PART('year', sign_up_date) as signup_year,
        location
    FROM {{ ref('stg_accounts') }}
),

account_order_stats AS (
    SELECT 
        asy.account_id,
        asy.signup_year,
        asy.location,
        COUNT(DISTINCT CASE WHEN ord.is_paid_flag = 1 THEN ord.order_id END) as paid_orders,
        COUNT(DISTINCT CASE 
            WHEN ord.is_paid_flag = 1 
            AND ord.is_discounted_flag = 1
            THEN ord.order_id 
        END) as discounted_paid_orders
    FROM account_signup_years asy
    LEFT JOIN {{ ref('int_orders_enriched') }} ord
        ON asy.account_id = ord.account_id
    GROUP BY 1, 2, 3
)

SELECT 
    signup_year,
    location,
    COUNT(DISTINCT account_id) as total_accounts,
    COUNT(DISTINCT CASE 
        WHEN paid_orders > 0 AND discounted_paid_orders = 0 
        THEN account_id 
    END) as accounts_with_only_full_price_orders,
    COUNT(DISTINCT CASE 
        WHEN paid_orders > 0 
        THEN account_id 
    END) as accounts_with_any_paid_orders,
    COUNT(DISTINCT CASE 
        WHEN discounted_paid_orders > 0 
        THEN account_id 
    END) as accounts_with_discounted_orders,
    {{ dbt_utils.generate_surrogate_key(['signup_year', 'location', 'CURRENT_DATE']) }} as cohort_key
FROM account_order_stats
GROUP BY 1, 2
ORDER BY signup_year DESC, location
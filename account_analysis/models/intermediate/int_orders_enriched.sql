{{ config(
    materialized='view',
    schema='analytics',
    alias='int_orders_enriched'
) }}

WITH base_orders AS (
    SELECT
        order_sk,
        account_sk,
        opportunity_sk,
        order_id,
        opportunity_id,
        account_id,
        create_date,
        original_price,
        CASE 
            WHEN is_paid = 'Y' THEN 1
            WHEN is_paid = 'N' THEN 0
            ELSE NULL
        END AS is_paid_flag
    FROM {{ ref('stg_orders') }}
),

price_calculations AS (
    SELECT
        *,
        LAG(original_price) OVER (
            PARTITION BY account_id 
            ORDER BY create_date
        ) as previous_order_price,
        CASE
            WHEN original_price < COALESCE(
                LAG(original_price) OVER (
                    PARTITION BY account_id 
                    ORDER BY create_date
                ), 
                original_price
            )
            THEN 1
            ELSE 0
        END as is_discounted_flag
    FROM base_orders
),

enriched_orders AS (
    SELECT
        pc.*,
        acc.location,
        acc.account_type,
        acc.sign_up_date,
        CASE
            WHEN pc.create_date < acc.sign_up_date THEN 1
            ELSE 0
        END as is_anomalous_order,
        CASE
            WHEN pc.is_paid_flag = 1 AND pc.is_discounted_flag = 0 THEN 'Full Price Paid'
            WHEN pc.is_paid_flag = 1 AND pc.is_discounted_flag = 1 THEN 'Discounted Paid'
            WHEN pc.is_paid_flag = 0 THEN 'Unpaid'
            ELSE 'Unknown'
        END as order_status,
        original_price as final_price
    FROM price_calculations pc
    INNER JOIN {{ ref('stg_accounts') }} acc  
        ON pc.account_id = acc.account_id
)

SELECT
    order_sk,
    account_sk,
    opportunity_sk,
    order_id,
    opportunity_id,
    account_id,
    create_date,
    location,
    account_type,
    sign_up_date,
    original_price,
    final_price,
    previous_order_price,
    is_paid_flag,
    is_discounted_flag,
    is_anomalous_order,
    order_status
FROM enriched_orders
WHERE NOT is_anomalous_order
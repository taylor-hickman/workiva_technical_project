{{ config(
    materialized='table',
    schema='analytics',
    alias='fact_opportunity_order_details'
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
        END as opportunity_type,
        opportunity_name
    FROM {{ ref('stg_opportunities') }}
)

SELECT 
    ord.order_sk,
    ord.order_id,
    ord.opportunity_id,
    ot.opportunity_type,
    ot.opportunity_name,
    ord.account_id,
    acc.location,  
    acc.location_bucket, 
    ord.create_date,
    ord.original_price,
    ord.is_paid_flag,
    {{ dbt_utils.generate_surrogate_key(['ord.order_id', 'ord.opportunity_id']) }} as detail_key
FROM {{ ref('int_orders_enriched') }} ord
LEFT JOIN opportunity_types ot 
    ON ord.opportunity_id = ot.opportunity_id
LEFT JOIN {{ ref('fact_account_summary') }} acc
    ON ord.account_id = acc.account_id
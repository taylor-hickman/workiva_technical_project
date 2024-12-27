{{ config(
    materialized='view',
    schema='analytics',
    alias='int_opportunities_enriched',
    tags=['intermediate']
) }}

/*
    This model enriches opportunity data with account information and standardizes
    opportunity types based on the opportunity naming patterns. It serves as a foundation
    for opportunity-based analysis in the mart layer.
*/

WITH opportunity_types AS (
    SELECT 
        opportunity_sk,
        account_sk,
        opportunity_id,
        opportunity_name,
        account_id,
        CASE 
            WHEN opportunity_name ILIKE 'Renewal:%' THEN 'Renewal'
            WHEN opportunity_name ILIKE 'Renegotiation:%' THEN 'Renegotiation'
            WHEN opportunity_name ILIKE 'Credit Amendment:%' THEN 'Credit Amendment'
            WHEN opportunity_name ILIKE 'Additional Contract:%' THEN 'Additional Contract'
            WHEN opportunity_name ILIKE 'New Customer:%' THEN 'New Customer'
            ELSE 'Other'
        END as opportunity_type
    FROM {{ ref('stg_opportunities') }}
)

SELECT
    ot.opportunity_sk,
    ot.account_sk,
    ot.opportunity_id,
    ot.opportunity_name,
    ot.opportunity_type,
    ot.account_id,
    acc.account_type,
    acc.sign_up_date,
    acc.location,
    CASE 
        WHEN acc.location = 'North America' THEN 'North America'
        ELSE 'All Other'
    END AS location_bucket
FROM opportunity_types ot
LEFT JOIN {{ ref('stg_accounts') }} acc
    ON ot.account_sk = acc.account_sk
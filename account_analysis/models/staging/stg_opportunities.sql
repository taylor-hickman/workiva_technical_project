{{ config(
    materialized='view',
    schema='analytics',
    alias='stg_opportunities'
) }}

WITH opportunities AS (
    SELECT
        {{ dbt_utils.generate_surrogate_key(['opportunity_id']) }} AS opportunity_sk,
        {{ dbt_utils.generate_surrogate_key(['account_id']) }} AS account_sk,
        opportunity_id,
        opportunity_name,
        CAST(account_id AS BIGINT) AS account_id
    FROM {{ source('raw','opportunities') }}
)

SELECT * FROM opportunities
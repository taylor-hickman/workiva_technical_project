{{ config(
    materialized='view',
    schema='analytics',
    alias='stg_orders'
) }}

WITH orders AS (
    SELECT 
        {{ dbt_utils.generate_surrogate_key(['order_id']) }} AS order_sk,
        {{ dbt_utils.generate_surrogate_key(['account_id']) }} AS account_sk,
        {{ dbt_utils.generate_surrogate_key(['opportunity_id']) }} AS opportunity_sk,
        order_id,
        opportunity_id,
        CAST(account_id AS BIGINT) AS account_id,
        {{ convert_integer_to_date('create_date') }} AS create_date,
        CAST(original_price AS DOUBLE) AS original_price,
        is_paid
    FROM {{ source('raw','orders') }}
)

SELECT * FROM orders
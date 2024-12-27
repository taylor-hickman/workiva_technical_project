{{ config(
    materialized='view',
    schema='analytics',
    alias='stg_accounts'
) }}

WITH accounts AS (
    SELECT
        {{ dbt_utils.generate_surrogate_key(['account_id']) }} AS account_sk,
        CAST(account_id AS BIGINT) AS account_id,
        account_type,
        {{ convert_integer_to_date('sign_up_date') }} AS sign_up_date,
        location
    FROM {{ source('raw','accounts') }}
    WHERE account_id IS NOT NULL
)

SELECT * FROM accounts
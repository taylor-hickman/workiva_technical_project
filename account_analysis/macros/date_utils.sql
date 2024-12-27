{% macro convert_integer_to_date(column_name) %}
    -- Suppose the integer is "days since 1900-01-01"
    (DATE '1900-01-01' + {{ column_name }} * INTERVAL 1 DAY)
{% endmacro %}

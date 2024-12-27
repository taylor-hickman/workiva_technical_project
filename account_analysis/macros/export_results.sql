{% macro export_results_to_json() %}
    {% set relations_query %}
        SELECT 
            table_name as identifier,
            table_schema as schema,
            table_catalog as database
        FROM information_schema.tables 
        WHERE table_schema = '{{ target.schema }}'
        AND table_catalog = '{{ target.database }}'
        AND table_name LIKE 'fact_%';
    {% endset %}
    
    {% set results = run_query(relations_query) %}
    
    {% for row in results %}
        {% set target_path = var('json_path') ~ '/' ~ row['identifier'] ~ '.json' %}
        {{ log("Exporting " ~ row['identifier'] ~ " to " ~ target_path, info=True) }}
        {% set query %}
            COPY (
                SELECT *
                FROM {{ row['database'] }}.{{ row['schema'] }}.{{ row['identifier'] }}
            ) 
            TO '{{ target_path }}'
            (FORMAT JSON, ARRAY true);
        {% endset %}
        {% do run_query(query) %}
    {% endfor %}
{% endmacro %}
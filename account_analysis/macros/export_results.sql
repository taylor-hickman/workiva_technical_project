{% macro export_results_to_json(target_path=none) %}
    {% if not target_path %}
        {% set target_path = '../dashboard/public/data' %}
    {% endif %}

    {% set relations_query %}
        SELECT 
            table_name as identifier
        FROM information_schema.tables 
        WHERE table_schema = '{{ target.schema }}'
        AND table_name LIKE 'fact_%'
    {% endset %}
    
    {% set results = run_query(relations_query) %}
    
    {% for row in results %}
        {% set query %}
            COPY (
                SELECT *
                FROM {{ target.schema }}.{{ row['identifier'] }}
            )
            TO '{{ target_path }}/{{ row["identifier"] }}.json'
            (FORMAT JSON, ARRAY true);
        {% endset %}
        {% do run_query(query) %}
        {{ log("Exported " ~ row['identifier'] ~ " to JSON", info=True) }}
    {% endfor %}
{% endmacro %}
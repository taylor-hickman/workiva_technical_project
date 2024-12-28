{% macro export_results_to_json(target_path=none) %}
    {% if not target_path %}
        {% set target_path = '../dashboard/public/data' %}
    {% endif %}

    {{ log("Starting JSON export to: " ~ target_path, info=True) }}

    {% set relations_query %}
        SELECT 
            table_name as identifier,
            table_schema as schema,
            table_catalog as database
        FROM information_schema.tables 
        WHERE table_schema = '{{ target.schema }}'
        AND table_name LIKE 'fact_%';
    {% endset %}
    
    {% set results = run_query(relations_query) %}
    
    {% for row in results %}
        {% set target_file = target_path ~ '/' ~ row['identifier'] ~ '.json' %}
        {{ log("Exporting " ~ row['identifier'] ~ " to " ~ target_file, info=True) }}
        
        {% set query %}
            COPY (
                SELECT *
                FROM {{ row['database'] }}.{{ row['schema'] }}.{{ row['identifier'] }}
            ) 
            TO '{{ target_file }}'
            (FORMAT JSON, ARRAY true);
        {% endset %}
        {% do run_query(query) %}
        {{ log("Finished exporting " ~ row['identifier'], info=True) }}
    {% endfor %}

    {{ return('Done exporting JSON files') }}
{% endmacro %}
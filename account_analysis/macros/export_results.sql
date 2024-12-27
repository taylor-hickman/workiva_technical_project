{% macro export_results_to_json() %}
    {% set relations_query %}
        SELECT 
            table_name as identifier,
            table_schema as schema,
            table_catalog as database
        FROM information_schema.tables 
        WHERE table_schema = '{{ target.schema }}'
        AND table_catalog = '{{ target.database }}'
        AND (table_type = 'BASE TABLE' OR table_type = 'VIEW');
    {% endset %}
    
    {% set results = run_query(relations_query) %}
    
    {% for row in results %}
        {% set query %}
            COPY (
                SELECT * 
                FROM {{ row['database'] }}.{{ row['schema'] }}.{{ row['identifier'] }}
            ) 
            TO '{{ var("json_path") }}/{{ row["identifier"] }}.json'
            (FORMAT JSON, ARRAY true);
        {% endset %}
        {% do run_query(query) %}
        {{ log("Exported " ~ row['identifier'] ~ " to JSON", info=True) }}
    {% endfor %}
{% endmacro %}
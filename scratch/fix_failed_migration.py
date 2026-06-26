import psycopg2

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Select from flyway_schema_history
    cur.execute("SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;")
    print("=== Last 5 Migrations ===")
    for row in cur.fetchall():
        print(row)
        
    # Delete failed migration V17 if it exists
    cur.execute("DELETE FROM flyway_schema_history WHERE version = '17' AND success = false;")
    print(f"\nDeleted failed V17 entry, affected rows: {cur.rowcount}")
    
    conn.commit()
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)

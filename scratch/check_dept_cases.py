import psycopg2

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("SELECT id, case_id, department, stage, client_id, consultant_id, lead_id FROM dept_cases;")
    print("=== Dept Cases ===")
    for row in cur.fetchall():
        print(row)
        
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)

import psycopg2

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT id, name, role, department FROM users WHERE department IN ('investment', 'investments');")
    print("=== Investment Department Users ===")
    for row in cur.fetchall():
        print(row)
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)

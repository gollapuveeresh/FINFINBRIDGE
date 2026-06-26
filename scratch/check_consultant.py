import psycopg2

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:6543/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, department FROM users WHERE id = '62471898-6c16-44f4-a7cc-b70b0808c414';")
    print(cur.fetchone())
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)

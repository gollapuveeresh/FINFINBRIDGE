import psycopg2
import sys

db_url = "postgresql://postgres:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    print("Success:", cur.fetchone())
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
    sys.exit(1)

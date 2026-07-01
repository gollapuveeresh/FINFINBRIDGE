import psycopg2
import sys

db_url = "postgresql://finbridge_svc.vtcgcjtroxvtsjjfattt:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("SELECT id, name, email, role, is_active, created_at FROM users LIMIT 20;")
    print("--- CRM / STAFF USERS ---")
    for row in cur.fetchall():
        print(row)
        
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
    sys.exit(1)

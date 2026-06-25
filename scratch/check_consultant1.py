import psycopg2
import sys

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Check for any emails containing consultant1
    cur.execute("""
        SELECT id, name, email, role, is_active, is_email_verified
        FROM users
        WHERE email LIKE '%consultant1%';
    """)
    rows = cur.fetchall()
    print("--- Search results for 'consultant1' in 'users' ---")
    for row in rows:
        print(row)
        
    # Also check if it's referenced in any audit logs or other tables if relevant
    cur.execute("""
        SELECT count(*) FROM users;
    """)
    print("Total users in database:", cur.fetchone()[0])
    
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
    sys.exit(1)

import psycopg2
import sys

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, name, email, role, is_active, is_email_verified
        FROM users;
    """)
    print("--- USERS TABLE ---")
    print(f"{'ID':<40} | {'Name':<20} | {'Email':<30} | {'Role':<15} | {'Active':<7} | {'Verified':<8}")
    print("-" * 130)
    for row in cur.fetchall():
        print(f"{str(row[0]):<40} | {str(row[1]):<20} | {str(row[2]):<30} | {str(row[3]):<15} | {str(row[4]):<7} | {str(row[5]):<8}")
        
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
    sys.exit(1)

import psycopg2
import bcrypt
import sys

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

target_emails = [
    'super.admin@finbridge.com',
    'crm123@gmail.com',
    'loans.admin@finbridge.com',
    'consultant2@finbridge.com',
    'client1@example.com'
]

passwords_to_try = [
    b"Password123",
    b"Admin@123",
    b"admin123",
    b"password",
    b"Pass123",
    b"consultant123",
    b"crm123"
]

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT email, password, role, name
        FROM users
        WHERE email IN (%s, %s, %s, %s, %s);
    """ % tuple(["'" + e + "'" for e in target_emails]))
    
    rows = cur.fetchall()
    print("--- Credentials Audit ---")
    for row in rows:
        email, phash, role, name = row
        matched_pass = "UNKNOWN"
        for p in passwords_to_try:
            if bcrypt.checkpw(p, phash.encode('utf-8')):
                matched_pass = p.decode()
                break
        print(f"Name: {name:<20} | Email: {email:<30} | Role: {role:<15} | Password: {matched_pass}")
        
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
    sys.exit(1)

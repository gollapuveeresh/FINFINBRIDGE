import psycopg2
import bcrypt
import sys

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT email, password, name
        FROM users
        WHERE email = 'consultant1@finbridge.com';
    """)
    row = cur.fetchone()
    if row:
        email, phash, name = row
        print("Email:", email)
        print("Name:", name)
        print("Hash:", phash)
        
        passwords_to_try = [
            b"Password123",
            b"Admin@123",
            b"admin123",
            b"password",
            b"Pass123",
            b"consultant123",
            b"consultant1"
        ]
        
        for p in passwords_to_try:
            if bcrypt.checkpw(p, phash.encode('utf-8')):
                print("MATCH FOUND:", p.decode())
                break
        else:
            print("NO MATCH FOUND")
    else:
        print("User not found")
        
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
    sys.exit(1)

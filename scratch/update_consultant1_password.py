import psycopg2
import bcrypt
import sys

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

# Generate new bcrypt hash for "Password123"
new_password_plain = b"Password123"
hashed_password = bcrypt.hashpw(new_password_plain, bcrypt.gensalt(10)).decode('utf-8')

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("""
        UPDATE users
        SET password = %s
        WHERE email = 'consultant1@finbridge.com';
    """, (hashed_password,))
    
    conn.commit()
    print("Successfully updated password for consultant1@finbridge.com to 'Password123'!")
    
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
    sys.exit(1)

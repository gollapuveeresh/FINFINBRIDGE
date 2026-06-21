import psycopg2
import sys

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

phones = {
    'consultant1@finbridge.com': '+91 99999 11111',
    'consultant2@finbridge.com': '+91 99999 22222',
    'consultant3@finbridge.com': '+91 99999 33333',
    'consultant4@finbridge.com': '+91 99999 44444',
    'consultant5@finbridge.com': '+91 99999 55555',
    'consultant6@finbridge.com': '+91 99999 66666',
}

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    for email, phone in phones.items():
        cur.execute("UPDATE users SET phone = %s WHERE email = %s;", (phone, email))
        print(f"Updated {email} with phone {phone}, affected rows: {cur.rowcount}")
        
    conn.commit()
    cur.close()
    conn.close()
    print("Done!")
except Exception as e:
    print("Error:", e)
    sys.exit(1)

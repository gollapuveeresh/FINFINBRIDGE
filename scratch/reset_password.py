import psycopg2, subprocess, sys
subprocess.check_call([sys.executable, "-m", "pip", "install", "bcrypt", "-q"], stderr=subprocess.DEVNULL)
import bcrypt

# Set a known password for the super admin account
new_password = "Admin@123"
hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

conn = psycopg2.connect(
    host="db.vtcgcjtroxvtsjjfattt.supabase.co",
    port=5432,
    dbname="postgres",
    user="finbridge_svc",
    password="FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo"
)
cur = conn.cursor()
cur.execute("UPDATE users SET password = %s WHERE email = %s", (hashed, "super.admin@finbridge.com"))
conn.commit()
print(f"Password reset successfully!")
print(f"  Email:    super.admin@finbridge.com")
print(f"  Password: {new_password}")
cur.close()
conn.close()

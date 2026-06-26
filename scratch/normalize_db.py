import psycopg2

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Update users department
    cur.execute("UPDATE users SET department = 'investments' WHERE department = 'investment';")
    print(f"Updated users table, affected rows: {cur.rowcount}")
    
    # Update dept_cases department
    cur.execute("UPDATE dept_cases SET department = 'investments' WHERE department = 'investment';")
    print(f"Updated dept_cases table, affected rows: {cur.rowcount}")
    
    conn.commit()
    cur.close()
    conn.close()
    print("Database normalized successfully!")
except Exception as e:
    print("Error:", e)

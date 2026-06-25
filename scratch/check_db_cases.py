import psycopg2

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Check users count and roles
    cur.execute("SELECT role, COUNT(*) FROM users GROUP BY role;")
    print("=== Users ===")
    for role, cnt in cur.fetchall():
        print(f"Role: {role}, Count: {cnt}")
        
    # Check consultants and their departments
    cur.execute("SELECT name, email, role, department FROM users WHERE role IN ('consultant', 'department-admin');")
    print("\n=== Consultants / Admins ===")
    for name, email, role, dept in cur.fetchall():
        print(f"{name} ({email}) - Role: {role}, Dept: {dept}")

    # Check loan cases count
    cur.execute("SELECT COUNT(*) FROM loan_cases;")
    print(f"\nLoan Cases Count: {cur.fetchone()[0]}")
    
    # Check dept cases count and departments
    cur.execute("SELECT department, COUNT(*) FROM dept_cases GROUP BY department;")
    print("\n=== Dept Cases ===")
    for dept, cnt in cur.fetchall():
        print(f"Dept: {dept}, Count: {cnt}")
        
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)

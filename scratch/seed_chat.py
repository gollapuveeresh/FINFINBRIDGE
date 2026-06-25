import psycopg2
import uuid
from datetime import datetime, timedelta

db_url = "postgresql://finbridge_svc:FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo@db.vtcgcjtroxvtsjjfattt.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Clean up existing messages first
    cur.execute("DELETE FROM chat_messages;")
    print("Deleted old chat messages.")
    
    # Fetch all consultants, department-admins, and clients
    cur.execute("SELECT id, name, role, department FROM users WHERE role IN ('consultant', 'department-admin', 'client');")
    users = cur.fetchall()
    
    # Group users by department
    by_dept = {}
    for uid, name, role, dept in users:
        if not dept:
            continue
        if dept not in by_dept:
            by_dept[dept] = {'consultants': [], 'admins': [], 'clients': []}
        if role == 'consultant':
            by_dept[dept]['consultants'].append((uid, name))
        elif role == 'department-admin':
            by_dept[dept]['admins'].append((uid, name))
        elif role == 'client':
            by_dept[dept]['clients'].append((uid, name))
            
    # Seed messages
    base_time = datetime.now() - timedelta(hours=2)
    
    for dept, groups in by_dept.items():
        consultants = groups['consultants']
        admins = groups['admins']
        clients = groups['clients']
        
        if not consultants:
            continue
            
        consultant_id, consultant_name = consultants[0]
        
        # 1. Chat with Admin
        if admins:
            admin_id, admin_name = admins[0]
            # Admin to Consultant
            t1 = base_time - timedelta(minutes=45)
            cur.execute(
                "INSERT INTO chat_messages (id, sender_id, recipient_id, text, created_at) VALUES (%s, %s, %s, %s, %s);",
                (str(uuid.uuid4()), admin_id, consultant_id, f"Please submit the {dept} report by EOD Friday.", t1)
            )
            # Consultant to Admin
            t2 = base_time - timedelta(minutes=30)
            cur.execute(
                "INSERT INTO chat_messages (id, sender_id, recipient_id, text, created_at) VALUES (%s, %s, %s, %s, %s);",
                (str(uuid.uuid4()), consultant_id, admin_id, "Understood, will do. Working on the details now.", t2)
            )
            print(f"Seeded admin-consultant chat for {dept}")
            
        # 2. Chat with Clients
        for i, client in enumerate(clients[:2]):
            client_id, client_name = client
            t1 = base_time - timedelta(minutes=60 - i*10)
            cur.execute(
                "INSERT INTO chat_messages (id, sender_id, recipient_id, text, created_at) VALUES (%s, %s, %s, %s, %s);",
                (str(uuid.uuid4()), client_id, consultant_id, f"Hello {consultant_name.split()[0]}, when can we discuss the {dept} options?", t1)
            )
            t2 = base_time - timedelta(minutes=50 - i*10)
            cur.execute(
                "INSERT INTO chat_messages (id, sender_id, recipient_id, text, created_at) VALUES (%s, %s, %s, %s, %s);",
                (str(uuid.uuid4()), consultant_id, client_id, f"Hi {client_name.split()[0]}, let's schedule a call tomorrow to go over the details.", t2)
            )
            print(f"Seeded client-consultant chat for client {client_name} in {dept}")
            
    conn.commit()
    cur.close()
    conn.close()
    print("Chat seeding completed successfully!")
except Exception as e:
    print("Error:", e)

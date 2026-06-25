import requests
import sys

base_url = "http://localhost:5000/api"

def main():
    print("=== TESTING CHAT ENDPOINTS ===")
    
    # 1. Login as consultant4
    login_payload = {"email": "consultant4@finbridge.com", "password": "Password123"}
    r = requests.post(f"{base_url}/auth/login", json=login_payload)
    if r.status_code != 200:
        print("Login failed:", r.text)
        sys.exit(1)
        
    token = r.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")
    
    # 2. Fetch contacts
    r = requests.get(f"{base_url}/chat/contacts", headers=headers)
    if r.status_code != 200:
        print("Fetch contacts failed:", r.text)
        sys.exit(1)
        
    contacts = r.json()
    print("\n=== Contacts ===")
    for c in contacts:
        print(f"ID: {c.get('id')}, Name: {c.get('name')}, Role: {c.get('role')}")
        
    # 3. Fetch chat history for each contact
    for c in contacts:
        contact_id = c.get('id')
        name = c.get('name')
        r = requests.get(f"{base_url}/chat/messages", params={"contactId": contact_id}, headers=headers)
        if r.status_code != 200:
            print(f"Fetch messages failed for {name}: {r.text}")
            continue
        messages = r.json()
        print(f"\n=== Chat with {name} ===")
        for msg in messages:
            print(f"  [{msg.get('time')}] {msg.get('from')}: {msg.get('text')}")

if __name__ == "__main__":
    main()

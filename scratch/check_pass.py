import bcrypt

db_hash = b"$2b$12$/19OUW7bbKP/Zc91n3i3M.qAp9.ufQmMHMyZH2B.KntzFOdhwOi.i"
candidates = [
    b"Password123", 
    b"admin123", 
    b"admin", 
    b"superadmin", 
    b"super.admin", 
    b"finbridge123", 
    b"finbridge", 
    b"super.admin@finbridge.com", 
    b"password",
    b"Password1234",
    b"Pass123",
    b"Admin@123"
]

for c in candidates:
    try:
        if bcrypt.checkpw(c, db_hash):
            print("MATCH FOUND Plaintext:", c.decode())
            break
    except Exception as e:
        pass
else:
    print("NO MATCH FOUND IN CANDIDATES")

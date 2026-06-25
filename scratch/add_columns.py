import psycopg2

def run():
    log_file = "C:/Users/veere/.gemini/antigravity-ide/brain/233e7f02-c6fb-4fa1-b15c-1b87928dfdaa/.system_generated/logs/transcript.jsonl"
    print("Reading log file...")
    with open(log_file, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if "password" in line.lower() or "db_password" in line.lower() or "db_url" in line.lower():
                if "FwSj3auZDzKx4h_l1lLPjwhuQMwcdSBo" not in line and "uHkL6kNLU269MVzZ" not in line:
                    print(f"Line {i}: {line[:300]}...")
    print("Done successfully!")

if __name__ == "__main__":
    run()

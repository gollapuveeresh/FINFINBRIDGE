import requests
import sys

base_url = "http://localhost:5000/api"

def main():
    print("=== STARTING DEPARTMENT WORKFLOW INTEGRATION TEST ===")
    
    # 1. Login as B2B Organization Admin (Investments Client)
    b2b_login_url = f"{base_url}/b2b/login"
    b2b_payload = {"email": "jerry@gmail.com", "password": "Password123"}
    r = requests.post(b2b_login_url, json=b2b_payload)
    if r.status_code != 200:
        print("B2B Login failed:", r.text)
        sys.exit(1)
    
    b2b_data = r.json()
    b2b_token = b2b_data.get("token")
    org_id = b2b_data.get("organizationId")
    print(f"1. B2B login successful. Org ID: {org_id}")
    
    # 2. Create a new Service Request for Investment
    sr_url = f"{base_url}/b2b/organizations/{org_id}/service-requests"
    b2b_headers = {"Authorization": f"Bearer {b2b_token}"}
    sr_payload = {
        "departmentId": "investment",
        "title": "Investment Portfolio Advisory Request",
        "description": "Advisory for setting up corporate mutual fund portfolio",
        "priority": "high",
        "amountInvolved": 10000000,
        "notes": "Testing integration flow"
    }
    r = requests.post(sr_url, json=sr_payload, headers=b2b_headers)
    if r.status_code not in (200, 201):
        print("Create service request failed:", r.text)
        sys.exit(1)
    
    sr_data = r.json()
    sr_id = sr_data.get("id")
    sr_num = sr_data.get("requestNumber")
    print(f"2. Service Request created. ID: {sr_id}, Number: {sr_num}, Status: {sr_data.get('status')}")
    
    # 3. Login as Investments Department Admin
    admin_login_url = f"{base_url}/auth/login"
    admin_payload = {"email": "investments.admin@finbridge.com", "password": "Password123"}
    r = requests.post(admin_login_url, json=admin_payload)
    if r.status_code != 200:
        print("Admin Login failed:", r.text)
        sys.exit(1)
        
    admin_data = r.json()
    admin_token = admin_data.get("token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("3. Department admin login successful.")
    
    # 4. Get active leads and find the qualified one matching our email
    leads_url = f"{base_url}/leads?department=investment"
    r = requests.get(leads_url, headers=admin_headers)
    if r.status_code != 200:
        print("Get leads failed:", r.text)
        sys.exit(1)
        
    leads = r.json().get("leads", [])
    target_lead = None
    for l in leads:
        if l.get("email") == "jerry@gmail.com" and l.get("status") == "qualified":
            target_lead = l
            break
            
    if not target_lead:
        print("Could not find the newly created qualified lead for jerry@gmail.com")
        sys.exit(1)
        
    lead_id = target_lead.get("id") or target_lead.get("_id")
    print(f"4. Found qualified Lead. ID: {lead_id}, Status: {target_lead.get('status')}")
    
    # 5. Send Consultation Fee Proposal
    send_proposal_url = f"{base_url}/leads/{lead_id}/send-fee-proposal"
    r = requests.post(send_proposal_url, headers=admin_headers)
    if r.status_code != 200:
        print("Send fee proposal endpoint failed:", r.text)
        sys.exit(1)
        
    lead_after_proposal = r.json().get("lead", {})
    print(f"5. Sent fee proposal. Lead status updated to: {lead_after_proposal.get('status')}")
    
    # 6. Fetch proposals from B2B side and approve it
    proposals_url = f"{base_url}/b2b/organizations/{org_id}/proposals"
    r = requests.get(proposals_url, headers=b2b_headers)
    if r.status_code != 200:
        print("Get proposals failed:", r.text)
        sys.exit(1)
        
    proposals = r.json()
    fee_proposal = None
    for p in proposals:
        if "Consultation Fee Request" in p.get("title", "") and p.get("status") == "sent":
            fee_proposal = p
            break
            
    if not fee_proposal:
        print("Could not find the sent fee proposal on B2B side")
        sys.exit(1)
        
    proposal_id = fee_proposal.get("id")
    print(f"6. Found B2B Fee Proposal. ID: {proposal_id}, Amount: INR {fee_proposal.get('feeAmount')}")
    
    decide_url = f"{base_url}/b2b/proposals/{proposal_id}/decision"
    decide_payload = {
        "decision": "approved",
        "feedback": "Approved and mock paid 3000 via Razorpay"
    }
    r = requests.patch(decide_url, json=decide_payload, headers=b2b_headers)
    if r.status_code != 200:
        print("Decide proposal failed:", r.text)
        sys.exit(1)
        
    print("7. Approved fee proposal successfully.")
    
    # 8. Assign consultant as Investments admin
    consultants_url = f"{base_url}/auth/consultants?department=investments"
    r = requests.get(consultants_url, headers=admin_headers)
    if r.status_code != 200:
        print("Get consultants failed:", r.text)
        sys.exit(1)
        
    consultants = r.json().get("consultants", [])
    target_consultant = None
    for c in consultants:
        if c.get("email") == "consultant4@finbridge.com":
            target_consultant = c
            break
            
    if not target_consultant:
        print("Could not find consultant consultant4@finbridge.com")
        sys.exit(1)
        
    consultant_id = target_consultant.get("_id")
    print(f"8. Assigning consultant Meera Iyer (ID: {consultant_id})")
    
    assign_payload = {
        "assignedConsultant": consultant_id,
        "status": "assigned"
    }
    r = requests.patch(f"{base_url}/leads/{lead_id}", json=assign_payload, headers=admin_headers)
    if r.status_code != 200:
        print("Assign consultant patch failed:", r.text)
        sys.exit(1)
        
    print("9. Consultant assigned successfully.")
    
    # 10. Login as assigned consultant (consultant4@finbridge.com)
    print("10. Logging in as assigned consultant...")
    r = requests.post(f"{base_url}/auth/login", json={"email": "consultant4@finbridge.com", "password": "Password123"})
    if r.status_code != 200:
        print("Consultant Login failed:", r.text)
        sys.exit(1)
        
    c_token = r.json().get("token")
    c_headers = {"Authorization": f"Bearer {c_token}"}
    client_user_id = r.json().get("id") # we can get client details
    
    # Let's find client jerry@gmail.com user ID
    r = requests.get(f"{base_url}/auth/consultant/clients", headers=c_headers)
    clients_list = r.json().get("clients", [])
    jerry_client = None
    for cl in clients_list:
        if cl.get("email") == "jerry@gmail.com":
            jerry_client = cl
            break
            
    if not jerry_client:
        print("Could not find client jerry@gmail.com under consultant clients list")
        sys.exit(1)
        
    jerry_client_id = jerry_client.get("_id") or jerry_client.get("id")
    print(f"    Jerry Client User ID: {jerry_client_id}")
    
    # 11. Create a new Dept Case for Investments
    case_create_url = f"{base_url}/dept-cases/investment"
    case_payload = {
        "clientId": jerry_client_id,
        "leadId": lead_id,
        "investmentGoal": "Wealth Creation",
        "investmentAmount": 100000,
        "horizon": "5 years"
    }
    r = requests.post(case_create_url, json=case_payload, headers=c_headers)
    if r.status_code != 200:
        print("Create DeptCase failed:", r.text)
        sys.exit(1)
        
    case_data = r.json().get("case", {})
    case_uuid = case_data.get("id") or case_data.get("_id")
    case_code = case_data.get("caseId")
    print(f"11. DeptCase created. UUID: {case_uuid}, Case ID: {case_code}, Stage: {case_data.get('stage')}")
    
    # 12. Complete Risk Assessment (progresses stage to portfolio_design)
    r = requests.patch(f"{base_url}/dept-cases/investment/{case_uuid}", json={
        "riskAssessment": {
            "riskScore": 7,
            "riskProfile": "Aggressive",
            "monthlyIncome": 150000,
            "existingAssets": 2000000,
            "liabilities": 500000,
            "note": "Client has high risk tolerance"
        },
        "stage": "portfolio_design"
    }, headers=c_headers)
    if r.status_code != 200:
        print("Save risk assessment failed:", r.text)
        sys.exit(1)
        
    case_data2 = r.json().get("case", {})
    print(f"12. Risk Assessment saved. Stage is now: {case_data2.get('stage')}")
    
    # 13. Complete Portfolio Design and transition to client_approval
    # This should automatically create the B2B proposal!
    portfolio = [
        {"assetClass": "Equity", "instrument": "Nifty 50 Index Fund", "allocation": 70, "amount": 70000, "expectedReturn": 12},
        {"assetClass": "Gold", "instrument": "SGB / Gold ETF", "allocation": 30, "amount": 30000, "expectedReturn": 8}
    ]
    r = requests.patch(f"{base_url}/dept-cases/investment/{case_uuid}", json={
        "portfolio": portfolio,
        "stage": "client_approval"
    }, headers=c_headers)
    if r.status_code != 200:
        print("Save portfolio design failed:", r.text)
        sys.exit(1)
        
    case_data3 = r.json().get("case", {})
    proposal_id_str = case_data3.get("proposalId")
    print(f"13. Portfolio Design saved. Stage is now: {case_data3.get('stage')}. Auto-generated proposal ID: {proposal_id_str}")
    if not proposal_id_str:
        print("ERROR: Proposal ID was not populated in case details!")
        sys.exit(1)
        
    # 14. Check proposals from B2B side and verify the recommendations proposal is present
    r = requests.get(f"{base_url}/b2b/organizations/{org_id}/proposals", headers=b2b_headers)
    proposals2 = r.json()
    rec_proposal = None
    for p in proposals2:
        if "INVESTMENT Recommendations Plan" in p.get("title", ""):
            rec_proposal = p
            break
            
    if not rec_proposal:
        print("ERROR: Recommendations proposal not synced to B2B side!")
        sys.exit(1)
        
    rec_proposal_id = rec_proposal.get("id")
    print(f"14. Found Recommendations Proposal on B2B side. ID: {rec_proposal_id}, Status: {rec_proposal.get('status')}")
    
    # 15. B2B client approves the recommendations proposal
    r = requests.patch(f"{base_url}/b2b/proposals/{rec_proposal_id}/decision", json={
        "decision": "approved",
        "feedback": "Portfolio design looks great, proceed!"
    }, headers=b2b_headers)
    if r.status_code != 200:
        print("Decide recommendation proposal failed:", r.text)
        sys.exit(1)
        
    print("15. B2B Client approved recommendation proposal.")
    
    # 16. Verify that case decision is automatically updated to approved
    r = requests.get(f"{base_url}/dept-cases/investment", headers=c_headers)
    cases_list = r.json().get("cases", [])
    updated_case = None
    for cs in cases_list:
        if cs.get("_id") == case_uuid or cs.get("id") == case_uuid:
            updated_case = cs
            break
            
    if not updated_case:
        print("Could not find the case in list")
        sys.exit(1)
        
    client_dec = updated_case.get("clientDecision", {})
    print(f"16. Verified case client decision: {client_dec.get('status')} - Feedback: {client_dec.get('feedback')}")
    if client_dec.get("status") != "Approved":
        print(f"ERROR: Expected case client decision 'Approved' but got {client_dec.get('status')}")
        sys.exit(1)
        
    print("\n=== INTEGRATION TEST PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()

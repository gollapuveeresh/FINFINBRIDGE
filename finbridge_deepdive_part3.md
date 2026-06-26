# FinBridge Deep-Dive — Part 3: Call Chains, Story, Interview Q&A & Presentation

---

## TASK 9: FUNCTION CALL CHAINS FOR ALL FEATURES

---

### 9.1 Login (Admin)

```
AdminLogin.jsx: "Sign In" button clicked
  ↓
handleLogin(e)                              [pages/public/AdminLogin.jsx]
  ↓ e.preventDefault(); setLoading(true)
login(email, password)                      [context/AuthContext.jsx]
  ↓ clearToken() → sessionStorage.removeItem + localStorage.removeItem
api.post('/auth/login', {email, password})  [services/api.js]
  ↓ Axios request interceptor → PUBLIC_ENDPOINT → skip auth header
HTTP POST http://localhost:5000/api/auth/login
  ↓
SecurityFilterChain                          [config/SecurityConfig.java]
  ↓ permitAll for /api/auth/login
JwtAuthFilter.doFilterInternal()            [security/JwtAuthFilter.java]
  ↓ No Authorization header → skip → filterChain.doFilter()
AuthController.login(LoginRequest)          [controller/AuthController.java]
  ↓ return ResponseEntity.ok(authService.login(request))
AuthService.login(LoginRequest)             [service/AuthService.java]
  ↓
userRepository.findByEmailIgnoreCase(email) [repository/UserRepository.java]
  ↓ SELECT * FROM users WHERE LOWER(email) = LOWER(?)
  ↓ → User entity returned
passwordEncoder.matches(raw, hashed)        [BCryptPasswordEncoder]
  ↓ BCrypt comparison → true
user.isActive()                             [entity/User.java]
  ↓ true
jwtService.generateToken(user)              [security/JwtService.java]
  ↓ Jwts.builder().subject(userId).claim(email,role,name).signWith(key).compact()
  ↓ → "eyJhbGciOiJIUzI1NiJ9..."
LoginResponse(token, id, name, email, role, department)
  ↓ HTTP 200 OK
Axios response interceptor                  [services/api.js]
  ↓ normalizeData(response.data) → adds _id alias
AuthContext receives response               [context/AuthContext.jsx]
  ↓ setToken(token) → sessionStorage + localStorage
  ↓ setUser({id, name, email, role, department})
  ↓ setIsAuthenticated(true)
  ↓ checkProfile(user) → role !== 'client' → skip
  ↓ return user
handleLogin receives user                   [pages/public/AdminLogin.jsx]
  ↓ navigate('/admin/dashboard')
React Router matches route                  [routes/AppRoutes.jsx]
  ↓ <AdminRoute> → ProtectedRoute(isAuthenticated=true ✓) → RoleBasedRoute(role='admin' ✓)
AdminLayout renders                         [layouts/AdminLayout.jsx]
  ↓ Sidebar(role="admin") + mobile topbar
AdminDashboard.jsx mounts                   [pages/admin/Dashboard.jsx]
  ↓ useEffect → api.get('/dashboard'), api.get('/leads'), api.get('/leads/stats')
Dashboard renders with live data
```

### 9.2 Registration (Client)

```
LoginRegistration.jsx: "Create Account" tab → fill form → "Register" button
  ↓
handleRegister(e)                           [pages/public/LoginRegistration.jsx]
  ↓ e.preventDefault(); setLoading(true)
register(name, email, password, role, phone, companyName)  [context/AuthContext.jsx]
  ↓
api.post('/auth/register', payload)         [services/api.js]
  ↓
AuthController.register(RegisterRequest)    [controller/AuthController.java]
  ↓
AuthService.register(RegisterRequest)       [service/AuthService.java]
  ↓
userRepository.existsByEmailIgnoreCase(email) → false (new email)
  ↓
passwordEncoder.encode(password)            [BCryptPasswordEncoder]
  ↓ → "$2a$10$..."
DtoMapper.toUser(request)                   [dto/DtoMapper.java]
  ↓ new User(), setName, setEmail, setRole("client"), setPhone, setCompanyName
user.setPassword(hashedPassword)
  ↓
userRepository.save(user)                   [repository/UserRepository.java]
  ↓ INSERT INTO users (id, name, email, password, role, ...) VALUES (...)
jwtService.generateToken(user)              [security/JwtService.java]
  ↓ → JWT token
LoginResponse returned → HTTP 200
  ↓
AuthContext: setToken, setUser, setIsAuthenticated(true)
  ↓
checkProfile(user) → role=client → api.get('/financial-profile')
  ↓ 404 (no profile yet) → setHasFinancialProfile(false)
  ↓
navigate('/client/dashboard')
  ↓
FinancialProfileGuard detects hasFinancialProfile=false → redirect to /client/financial-profile
```

### 9.3 Lead Capture

```
Home.jsx: LeadCaptureForm visible at bottom of page
  ↓
User fills: name, email, phone, requirement, budget → "Submit Inquiry"
  ↓
handleSubmit(e)                             [components/LeadCaptureForm.jsx]
  ↓ e.preventDefault(); client-side validation
api.post('/leads/capture', formData)        [services/api.js]
  ↓ PUBLIC_ENDPOINT → no auth header
  ↓
LeadController.capture(LeadRequest)         [controller/LeadController.java]
  ↓ @Valid → Bean Validation on LeadRequest record
DtoMapper.toLead(request)                   [dto/DtoMapper.java]
  ↓ new Lead(), set fields, source="website_form"
LeadService.create(lead)                    [service/LeadService.java]
  ↓
sequenceGenerator.next(Seq.LEAD)            [service/SequenceGenerator.java]
  ↓ SELECT nextval('lead_seq') → 1
  ↓ → "LEAD-00001"
lead.setLeadId("LEAD-00001")
lead.setStatus("new"), setPriority("warm"), setScore(0)
  ↓
leadRepository.save(lead)                   [repository/LeadRepository.java]
  ↓ INSERT INTO leads (...) VALUES (...)
  ↓ PostgreSQL: row committed, UUID generated
  ↓
DtoMapper.toLeadResponse(lead)              [dto/DtoMapper.java]
  ↓ maps entity → LeadResponse DTO
ResponseEntity.status(201).body(response)
  ↓ HTTP 201 Created
  ↓
normalizeData() in api.js interceptor
  ↓
toast.success("Thank you!"); form reset
```

### 9.4 Lead Qualification → Department Assignment → Conversion

```
CRM Admin on /crm-admin/leads
  ↓
=== STEP 1: Qualify ===
"Qualify" button clicked
  ↓
handleStatusChange(leadId, 'qualified')     [pages/crm-admin/Leads.jsx]
  ↓ api.patch(`/leads/${id}`, { status: 'qualified', score: 75 })
  ↓ LeadController.update() → LeadService.update() → UPDATE leads SET status='qualified'
  ↓ Lead card shows "Qualified" badge

=== STEP 2: Send to Department ===
"Send to Loans" button clicked
  ↓
handleSendToDept(leadId, 'loans')           [pages/crm-admin/Leads.jsx]
  ↓ api.post(`/leads/${id}/send-to-department`, { department: 'loans', notes: '...' })
  ↓ LeadController.sendToDepartment()
  ↓ LeadService.sendToDepartment(id, "loans", notes, actor)
    ↓ lead.setDepartment("loans")
    ↓ lead.setStatus("dept_review")
    ↓ lead.getNotes().add(new LeadNote(...))
    ↓ leadRepository.save(lead)
  ↓ UPDATE leads SET department='loans', status='dept_review'
  ↓ INSERT INTO lead_notes (...)

=== STEP 3: Dept Admin Sends Fee Proposal ===
Dept Admin on /department-admin/lead-queue → "Send Fee Proposal"
  ↓
handleSendProposal(leadId)                  [pages/department-admin/LeadReview.jsx]
  ↓ api.post(`/leads/${id}/send-fee-proposal`)
  ↓ LeadService.sendFeeProposal(id, adminUser)
    ↓ lead.setStatus("proposal_sent")
    ↓ Create Consultation entity
    ↓ Save lead + consultation
  ↓ INSERT INTO consultations (...)

=== STEP 4: Convert to Client ===
"Convert" button clicked
  ↓
handleConvert(leadId)                       [pages/crm-admin/Leads.jsx]
  ↓ api.post(`/leads/${id}/convert`)
  ↓ LeadService.convertToClient(id)
    ↓ userRepository.findByEmailIgnoreCase(lead.getEmail()) → empty
    ↓ Create User(role="client", password=random)
    ↓ userRepository.save(client)
    ↓ lead.setStatus("won"), lead.setConvertedClient(client)
    ↓ leadRepository.save(lead)
  ↓ INSERT INTO users (..., role='client')
  ↓ UPDATE leads SET status='won', converted_client_id=?
  ↓
Response: { isNewClient: true, tempPassword: "xK9mP2qr", client: {...} }
  ↓
UI: Modal shows temp password for admin to share with client
```

### 9.5 Full Loan Workflow (8 Stages)

```
Consultant on /consultant/loan-workflow

=== Stage 1: Document Collection ===
"Create Case" → handleCreate()
  ↓ api.post('/loan-cases', { clientId, leadId, loanType })
  ↓ LoanCaseService.create() → LC-00001, stage=document_collection
  ↓ INSERT INTO loan_cases

"Upload Doc" → handleUploadDoc()
  ↓ api.patch('/loan-cases/LC-ID', { documents: [{name, content, status}] })
  ↓ LoanCaseService.patch() → update documents JSONB

"Verify Doc" → handleVerifyDoc(docId)
  ↓ api.patch('/loan-cases/LC-ID/document/DOC-ID', { status: 'verified' })
  ↓ LoanCaseService.updateDocument()
  ↓ UPDATE loan_case_documents SET status='verified'

=== Stage 2: Eligibility ===
"Save Eligibility" → handleSaveEligibility()
  ↓ api.patch('/loan-cases/LC-ID', { stage: 'eligibility', creditScore: 750, dti: 0.35, ltv: 0.8, eligible: true })
  ↓ LoanCaseService.patch()
  ↓ UPDATE loan_cases SET credit_score=750, dti=0.35, ltv=0.8, eligible=true, stage='eligibility'

=== Stage 3: Recommendation ===
"Send Recommendation" → handleSendRec()
  ↓ api.patch('/loan-cases/LC-ID', { stage: 'recommendation', recommendedBank: 'SBI', recommendedRate: 8.5, recommendedTenure: 240, recommendedEmi: 43391 })
  ↓ UPDATE loan_cases SET recommended_bank='SBI', ...

=== Stage 4: Client Review ===
"Send to Client" → handleSendToClient()
  ↓ api.patch('/loan-cases/LC-ID', { sentToClient: true, stage: 'client_review' })
  ↓ UPDATE loan_cases SET sent_to_client=true, stage='client_review'

"Client Approves" → handleClientDecision('approved')
  ↓ api.patch('/loan-cases/LC-ID', { clientDecision: 'approved', clientFeedback: 'Proceed' })

=== Stage 5: Bank Processing ===
"Submit to Bank" → handleBankSubmit()
  ↓ api.patch('/loan-cases/LC-ID', { stage: 'bank_processing', applicationRef: 'SBI-2026-12345', bankStatus: 'submitted' })

=== Stage 6: Disbursement ===
"Record Disbursement" → handleDisburse()
  ↓ api.post('/loan-cases/LC-ID/disburse', { disbursedAmount: 5000000, interestRate: 8.5, tenureMonths: 240, disbursedDate: '2026-06-23' })
  ↓ LoanCaseService.disburse()
    ↓ Calculate EMI = 5000000 × 0.00708 × (1.00708)^240 / ((1.00708)^240 - 1) = ₹43,391
    ↓ Generate 240 EmiScheduleItems
  ↓ UPDATE loan_cases + INSERT × 240 into emi_schedule_items

=== Stage 7: EMI Tracking ===
"Mark EMI Paid" → handleEmiPaid(emiId)
  ↓ api.patch('/loan-cases/LC-ID/emi/EMI-ID', { status: 'paid', paidDate: '2026-07-23' })
  ↓ UPDATE emi_schedule_items SET status='paid', paid_date=?

=== Stage 8: Close ===
"Close Case" → handleClose()
  ↓ api.patch('/loan-cases/LC-ID', { stage: 'closed' })
  ↓ UPDATE loan_cases SET stage='closed'
```

### 9.6 B2B Registration

```
/b2b/register page

Step 1: Company Info → Step 2: Contact Person → Step 3: Business Details
  ↓
"Complete Registration" button clicked
  ↓
handleSubmit()                              [pages/b2b/Register.jsx]
  ↓ validates all steps
b2bAuth.register(payload)                   [context/B2BAuthContext.jsx]
  ↓
b2bApi.post('/b2b/register', payload)       [services/b2bApi.js]
  ↓ HTTP POST (no auth — registration is public)
  ↓
B2BController.register(OrgRegisterRequest)  [controller/B2BController.java]
  ↓
B2BService.register(req)                    [service/B2BService.java]
  ↓
new Organization()                          [entity/Organization.java]
  ↓ setCompanyName, setIndustry, setGstin, setCin, setPan, setAnnualTurnover, ...
  ↓ setStatus("pending"), setKycVerified(false)
organizationRepository.save(org)
  ↓ INSERT INTO organizations (...)
  ↓
new OrganizationUser()                      [entity/OrganizationUser.java]
  ↓ setOrganization(org), setName, setEmail, setRole("COMPANY_ADMIN")
  ↓ setPasswordHash(BCrypt.encode(password))
organizationUserRepository.save(user)
  ↓ INSERT INTO organization_users (...)
  ↓
jwtService.generateB2BToken(user, org)      [security/JwtService.java]
  ↓ JWT with claims: {sub=userId, organizationId=orgId, type="b2b"}
  ↓
OrgLoginResponse(token, orgId, companyName, userId, role, industry, status, kycVerified, ...)
  ↓ HTTP 200 OK
  ↓
B2BAuthContext receives response
  ↓ sessionStorage.setItem('b2b_token', token)
  ↓ sessionStorage.setItem('b2b_company', JSON.stringify(company))
  ↓ setCompany(companyData)
  ↓
navigate('/b2b/dashboard')
  ↓
B2BProtectedRoute checks: company !== null → ✓
  ↓
B2BLayout renders: sidebar (MENU items) + topbar (company name, KYC badge) + content
  ↓
B2B Dashboard mounts → b2bApi.get(`/b2b/organizations/${orgId}/stats`)
```

### 9.7 B2B Payment

```
B2B Portal: /b2b/payments → pending payment row → "Pay Now"
  ↓
handlePay(paymentId)                        [pages/b2b/Payments.jsx]
  ↓
b2bApi.post(`/b2b/payments/${paymentId}/pay`, { razorpayPaymentId: null })
  ↓ b2bApi attaches b2b_token in Authorization header
  ↓
B2BController.payPayment(paymentId, body, principal)
  ↓
B2BService.payPayment(paymentId, principal, gatewayRef)
  ↓ Load OrganizationPayment
  ↓ Verify principal has access to this payment's org
  ↓ Check app.payments.mock-enabled → true → allow without real gateway
  ↓ payment.setStatus("paid")
  ↓ payment.setPaidAt(Instant.now())
  ↓ organizationPaymentRepository.save(payment)
  ↓ UPDATE organization_payments SET status='paid', paid_at=NOW()
  ↓
Response: OrganizationPayment entity
  ↓
UI: Payment badge changes to "Paid ✓", amount shown with timestamp
```

### 9.8 KYC Document Upload → Review → Verification

```
=== B2B User Uploads Document ===
/b2b/documents → "Upload Document" → select PAN card file
  ↓
handleUpload()                              [pages/b2b/Documents.jsx]
  ↓ FileReader converts to base64 data URI
b2bApi.post(`/b2b/organizations/${orgId}/documents`, { documentType: "PAN_CARD", fileName: "pan.pdf", content: "data:application/pdf;base64,..." })
  ↓
B2BService.uploadDocument(orgId, "PAN_CARD", "pan.pdf", base64Content, principal)
  ↓ INSERT INTO organization_documents (org_id, document_type, file_name, file_url, status)
  ↓ status = "pending_review"

=== Staff Reviews Document ===
Dept Admin on /department-admin/kyc → document queue → "Verify"
  ↓
handleReview(docId, 'verified')             [pages/department-admin/KycReview.jsx]
  ↓ api.patch(`/kyc/documents/${docId}`, { status: 'verified', note: 'Authentic PAN card' })
  ↓
KycController.review(docId, KycReviewRequest, reviewer)
  ↓
KycService.review(docId, "verified", "Authentic PAN card", reviewer)
  ↓ doc.setStatus("verified"), doc.setReviewNote("..."), doc.setReviewedBy(reviewer.getName())
  ↓ organizationDocumentRepository.save(doc)
  ↓ UPDATE organization_documents SET status='verified', review_note=?
  ↓ 
  ↓ Check: all required docs verified?
  ↓ If yes: org.setKycVerified(true) → organizationRepository.save(org)
  ↓ UPDATE organizations SET kyc_verified=true WHERE id=?
  ↓
B2B user refreshes /b2b/dashboard → KYC badge changes from "⏳ Pending" to "✓ KYC Verified"
```

### 9.9 Proposal → Invoice → Payment

```
=== Consultant Creates Proposal ===
/consultant/proposals → "New Proposal"
  ↓
handleCreate()                              [pages/consultant/Proposals.jsx]
  ↓ api.post('/proposals', { department, title, summary, leadId, clientId, details })
  ↓ ProposalService.create() → INSERT INTO proposals
  ↓ Proposal status = "draft"

=== Consultant Sends to Client ===
"Send to Client" button
  ↓ api.patch(`/proposals/${id}`, { status: 'sent' })
  ↓ UPDATE proposals SET status='sent'

=== Client Approves ===
Client on /client/proposals → "Approve"
  ↓ api.patch(`/proposals/${id}/decision`, { status: 'approved', feedback: 'Looks good' })
  ↓ ProposalService.updateStatus() → UPDATE proposals SET status='approved', client_feedback=?

=== Consultant Creates Invoice ===
/consultant/invoices → "Create Invoice"
  ↓ api.post('/invoices', { clientId, proposalId, department, lineItems: [{description, amount}], taxRate: 18 })
  ↓ InvoiceService.create()
    ↓ Generate INV-00001
    ↓ Calculate: subtotal = sum(lineItems), tax = subtotal × 18%, total = subtotal + tax
    ↓ INSERT INTO invoices + INSERT INTO invoice_line_items × N

=== Payment Recorded ===
/consultant/payments → "Record Payment"
  ↓ api.post('/payments', { invoiceId, amount, method: 'bank_transfer', transactionId: 'TXN-123' })
  ↓ PaymentService.create()
    ↓ INSERT INTO payments
    ↓ invoice.setStatus('paid') → UPDATE invoices SET status='paid'
```

### 9.10 Chat

```
Consultant on /consultant/schedule → Chat panel → select contact → type message → "Send"
  ↓
handleSend()
  ↓ api.post('/chat/messages', { recipientId: contactId, text: "Hello, ready for meeting?" })
  ↓
ChatController.sendMessage(currentUser, SendMessageRequest)
  ↓ userRepository.findById(recipientId) → recipient User
  ↓ new ChatMessage(), setSender(currentUser), setRecipient(recipient), setText(...)
  ↓ chatMessageRepository.save(msg)
  ↓ INSERT INTO chat_messages (sender_id, recipient_id, text, created_at)
  ↓
Response: ChatMessageResponse { from: "me", text: "...", time: "10:30 AM" }
  ↓
UI: Message appears in chat window with "me" alignment (right side)
```

---

## TASK 10: PROJECT STORY MODE

---

### Chapter 1: The Visitor

A curious entrepreneur, Priya, searches Google for "business loan advisory India." She clicks on a result and lands on **FinBridge's Home page** at `localhost:5173`.

React's `main.jsx` bootstraps: `StrictMode` → `ErrorBoundary` → `BrowserRouter` → `AuthProvider` (checks for stored token — none found, she's a visitor) → `B2BAuthProvider` → `App.jsx`.

`AppRoutes.jsx` matches the "/" route. Since it's NOT a portal route, it renders: `Navbar` (the sleek dark navigation bar with "Home", "Services", "About", "Contact"), `CustomCursor` (a subtle custom cursor effect), `CookieConsent` (GDPR banner), and `Chatbot` (a floating AI assistant icon).

The `Home.jsx` component renders — all 80KB of it. The `ThreeBackground` creates a mesmerizing WebGL animated canvas. `AnimatedCounter` components count up: "500+ Clients Served", "₹200 Cr+ Managed", "15+ Years Experience." Hero text animates in with Framer Motion.

Priya scrolls through service cards: **Valuation Advisory, Tax Planning, Wealth Management, Corporate Finance**. She's interested.

### Chapter 2: The Inquiry

At the bottom, Priya finds the **LeadCaptureForm**. She fills in:
- Name: "Priya Sharma"
- Email: "priya@techstart.in"  
- Phone: "9876543210"
- Requirement: "Business Loan"
- Budget: "₹50 Lakhs"

She clicks **"Submit Inquiry."**

`handleSubmit()` fires. Client-side validation passes. `api.post('/leads/capture', formData)` sends an HTTP POST to the backend. The Axios interceptor recognizes `/leads/capture` as a PUBLIC_ENDPOINT — no JWT attached.

The request hits Spring Boot on port 5000. `SecurityFilterChain` passes it through (`permitAll`). `JwtAuthFilter` sees no Authorization header and skips. `LeadController.capture()` receives the `@Valid LeadRequest`. `LeadService.create()` calls `sequenceGenerator.next(Seq.LEAD)` — PostgreSQL's `lead_seq` sequence atomically returns 1 — formatted as `"LEAD-00001"`. The lead is saved with `status: "new"`, `priority: "warm"`, `score: 0`.

Back in the browser: `toast.success("Thank you! Our team will contact you shortly.")` The form resets. Priya closes her browser, satisfied.

### Chapter 3: The CRM Admin

The next morning, **Rajesh**, the CRM Admin, opens `localhost:5173/crm-admin/login`. He enters his credentials. `AuthContext.login()` fires — clears any stale tokens, sends `POST /api/auth/login`. `AuthService` finds his user record, BCrypt-verifies his password, generates a 24-hour JWT. The token lands in both `sessionStorage` and `localStorage`. React Router navigates to `/crm-admin/dashboard`.

`CRMAdminLayout` renders — `Sidebar` (with CRM menu items: Dashboard, Leads, Clients, Pipeline) + content area. The dashboard's `useEffect` fires: `GET /api/leads` returns all leads. Priya's lead appears: **LEAD-00001 — Priya Sharma — Business Loan — ₹50L — Status: New**.

Rajesh clicks into the lead detail. He calls Priya, confirms her interest, and clicks **"Qualify"**. `api.patch('/leads/LEAD-00001-id', { status: 'qualified', score: 85 })`. The lead status updates to "Qualified" with an 85 score.

He then clicks **"Send to Department → Loans"**. `api.post('/leads/LEAD-00001-id/send-to-department', { department: 'loans' })`. `LeadService.sendToDepartment()` sets `department: "loans"`, `status: "dept_review"`, and adds a note: "Sent to loans department by Rajesh."

### Chapter 4: The Department Admin

**Sneha**, the Loans Department Admin, logs into `/department-admin/login`. Her JWT is generated with `role: "department-admin"`, `department: "loans"`. React Router navigates to `/department-admin/loans/dashboard`.

`DepartmentAdminLayout` renders. The `Sidebar` filters its menu items to show only loans-relevant entries. Sneha's dashboard shows: Priya's lead is in the **Lead Queue**.

She opens it, reviews the details, and clicks **"Send Fee Proposal"**. `LeadService.sendFeeProposal()` does two things: (1) updates the lead status to `"proposal_sent"`, and (2) creates a `Consultation` entity — a meeting booking linked to Priya's contact info. A notification is created for the CRM admin.

Now Sneha clicks **"Convert to Client"**. `LeadService.convertToClient()` checks: does a user with `priya@techstart.in` exist? No. It creates a new `User` with `role: "client"`, generates a random temporary password `"xK9mP2qr"`, BCrypt-hashes it, and saves. The lead status becomes `"won"`. The UI shows a modal: "Client account created. Temporary password: xK9mP2qr."

### Chapter 5: The B2B Portal

Meanwhile, Priya's company decides to register on the **B2B Portal**. She navigates to `/b2b/register`. The 3-step registration form loads (`Register.jsx` — 16.5KB).

**Step 1** — Company Info: "TechStart India Pvt Ltd", Industry: "Technology", GSTIN: "29AABCT1234Q1ZP".
**Step 2** — Contact Person: "Priya Sharma", "priya@techstart.in", password.
**Step 3** — Business Details: Annual Turnover: ₹5 Cr, 50 employees, Services: ["Loans", "Tax Advisory"].

She clicks **"Complete Registration."** `B2BAuthContext.register()` sends `POST /api/b2b/register`. `B2BService.register()` creates an `Organization` (status: "pending") and an `OrganizationUser` (role: COMPANY_ADMIN). A B2B JWT is generated with `type: "b2b"`. The token goes into `sessionStorage` only (not localStorage — B2B sessions are strictly tab-isolated).

`B2BLayout` renders with its own sidebar: Dashboard, Service Requests, Documents, Proposals, Meetings, Payments, Team, Support, Settings. The topbar shows "TechStart India Pvt Ltd" with a "⏳ Pending Verification" badge.

Priya uploads KYC documents: PAN Card, GST Certificate, Bank Statement — each converted to base64 and sent via `POST /api/b2b/organizations/:orgId/documents`. Stored in `organization_documents` with `status: "pending_review"`.

### Chapter 6: The Consultant

Back in the CRM, Sneha **assigns a consultant**. She goes to `/department-admin/assignments`, selects **Arjun** (a loans consultant), and assigns him to Priya's consultation. `ConsultationService.assign()` links Arjun to the consultation.

**Arjun** logs in at `/department-consultant/loans/dashboard`. His `Sidebar` shows loans-specific items: Loan Dashboard, Loan Workflow, Proposals, My Clients, Client Documents, KYC Review, Meetings Schedule, Invoices, Payments.

He sees Priya in his **Consultation Queue**. He clicks **"Accept"** → `ConsultationService.accept()` sets the consultation to "accepted" with a confirmed date and time. He then clicks **"Schedule"** — sets a meeting link (`https://meet.google.com/xyz`) and confirms the time slot.

The meeting happens. Arjun clicks **"Complete"** → `status: "completed"`.

### Chapter 7: The Loan Workflow

Arjun opens `/consultant/loan-workflow`. He clicks **"Create New Case"** for Priya.

`LoanCaseService.create()` generates **LC-00001**. Stage: `document_collection`. A checklist appears: ID Proof, Address Proof, Income Proof, Bank Statements (12 months).

Priya's documents are already uploaded via B2B. Arjun verifies each one (**"Verify"** button → `PATCH /api/loan-cases/:id/document/:docId`).

**Stage 2: Eligibility** — Arjun enters: Credit Score: 750, DTI: 0.35, LTV: 0.80. The system marks her as **Eligible** ✓.

**Stage 3: Recommendation** — Arjun selects: Bank: SBI, Interest Rate: 8.5%, Tenure: 240 months. The system calculates: **Monthly EMI: ₹43,391**.

**Stage 4: Client Review** — Arjun clicks **"Send to Client"**. `sentToClient: true`.

Priya reviews the recommendation on her client dashboard. She clicks **"Approve"** → `clientDecision: "approved"`.

**Stage 5: Bank Processing** — Arjun submits to SBI. Application Ref: `SBI-2026-12345`. Bank Status: "Under Review" → later → "Approved."

**Stage 6: Disbursement** — Loan approved! Arjun records: Disbursed Amount: ₹50,00,000, Date: June 23, 2026. `LoanCaseService.disburse()` calculates EMI and generates **240 monthly EMI schedule items** — from July 2026 to June 2046.

**Stage 7: EMI Tracking** — Each month, Arjun marks EMIs as paid when Priya makes payments.

**Stage 8: Closed** — After the loan is fully serviced (or any closing condition), the case is marked closed.

### Chapter 8: Billing

Arjun creates a **Proposal**: "Business Loan Advisory — Flat fee ₹75,000 + 18% GST." He sends it to Priya. She approves it.

Arjun generates an **Invoice** (INV-00001): Line items — Advisory Fee: ₹75,000, GST (18%): ₹13,500. **Total: ₹88,500**.

Priya pays through the B2B portal (**"Pay Now"** on `/b2b/payments`). In mock mode, the payment is instantly settled. The invoice status changes to **"Paid"**.

### Chapter 9: The Administrator's View

Meanwhile, the **Super Admin** logs in at `/admin/dashboard` — the 65KB command center. KPI cards light up:
- Total Users: 47
- Total Leads: 23 (5 Hot, 8 Won)
- Total Loans: 12
- Total Invoices: 15
- Revenue: ₹12,50,000

Recharts render beautiful line graphs (leads over time), bar charts (department performance), and pie charts (lead source distribution).

The admin navigates to `/admin/analytics` for deeper analysis. `/admin/revenue` shows monthly recurring revenue. `/admin/users` lets them manage all accounts. `/admin/audit-logs` shows an activity timeline.

### Chapter 10: The Ecosystem

Throughout this entire journey:
- **Notifications** (`NotificationService`) keep everyone informed — "New lead assigned", "Consultation scheduled", "Document verified"
- **Internal Chat** (`ChatController`) enables real-time messaging between Arjun and Priya
- **PDF Reports** (`pdfGenerator.js`) let Arjun generate downloadable reports for Priya
- **Financial Health Score** (`healthScoreCalculator.js`) gives Priya a score based on her financial profile
- **Cross-Sell Engine** (`CrossSellEngine.jsx`) recommends: "Since you have a business loan, consider our Tax Advisory service!"

And the cycle continues — new visitors arrive, new leads are captured, new consultants are assigned, new workflows begin. FinBridge runs the entire financial advisory lifecycle.

---

## TASK 11: 100 TECHNICAL INTERVIEW QUESTIONS WITH ANSWERS

---

### React (20 Questions)

**Q1: Why does FinBridge use React Context API instead of Redux?**
> FinBridge has only two global state concerns: CRM auth (AuthContext) and B2B auth (B2BAuthContext). Context API is sufficient for this scope — Redux would add boilerplate (actions, reducers, store) without benefit. Each page manages its own local state via useState.

**Q2: Explain the dual authentication context architecture.**
> AuthContext handles CRM users (admin, consultant, client) with tokens in sessionStorage+localStorage. B2BAuthContext handles organization users with tokens in sessionStorage only. They're separate because: different token claims, different user tables (users vs organization_users), different session lifecycles, and a B2B user shouldn't interfere with a staff member's session.

**Q3: Why does api.js have a normalizeData() interceptor?**
> The frontend was originally built for Node.js/MongoDB (which returns _id and bare arrays). When migrated to Spring Boot (which returns id and Spring Page objects), normalizeData() bridges the gap: unwraps Page objects to arrays, and adds _id aliases. This avoided rewriting 100+ API call sites.

**Q4: How does ProtectedRoute work?**
> It reads `isAuthenticated` from AuthContext. If false, it examines the current pathname prefix (/admin, /crm-admin, etc.) to redirect to the role-appropriate login page, preserving the intended destination in `location.state.from`.

**Q5: Why use `key={location.pathname}` on the Routes component?**
> Forces React to unmount/remount Routes on every navigation, enabling Framer Motion's AnimatePresence to run exit animations before the new page mounts.

**Q6: How does the Sidebar component serve multiple roles?**
> It accepts a `role` prop and selects from predefined menu arrays (adminItems, consultantItems, departmentAdminItems, clientItems). For dept-admin/consultant, it further filters by the user's department.

**Q7: What happens if you remove ErrorBoundary?**
> Any unhandled render error in any component would crash the entire React tree, showing a blank white page with no error information for the user.

**Q8: How is token persistence handled across tabs?**
> CRM: token stored in both sessionStorage (tab-isolated) and localStorage (cross-tab). New tab copies from localStorage to sessionStorage. B2B: sessionStorage only — fully tab-isolated.

**Q9: What's the purpose of the `data/` directory?**
> Contains static mock/fallback data (departmentDashboards.js, loans.js, etc.) used when the backend doesn't have an endpoint yet or as configuration data for UI rendering.

**Q10: How does FinancialProfileGuard work?**
> Reads `hasFinancialProfile` from AuthContext (set during login by calling GET /api/financial-profile). If false for a client, redirects to /client/financial-profile setup page.

**Q11: Why is Home.jsx 80KB?**
> It's the marketing landing page with extensive inline content: hero sections, animated counters, case studies, service cards, leadership team, proprietary tools showcase, and the LeadCaptureForm — all in one component to avoid unnecessary route splitting for a single-page marketing layout.

**Q12: How does the B2BLayout differ from AdminLayout?**
> B2BLayout has its OWN sidebar (not the shared Sidebar component), its own MENU array, uses B2BAuthContext (not AuthContext), shows company KYC badge, and calls refreshProfile() on route changes.

**Q13: How does useEffect for data fetching work in Dashboard.jsx?**
> useEffect with empty dependency array fires on mount. Inside: multiple api.get() calls run in parallel (Promise.all or sequential awaits). Results stored via setState. Loading/error states managed throughout.

**Q14: How is department-based filtering done on the frontend?**
> `departmentAccess.js` provides `getUserDepartment(user)` which checks `user.department` first, then falls back to an email→department lookup map. `canAccessDepartment(user, dept)` compares the result.

**Q15: What animation library is used and where?**
> Framer Motion — used for page transitions (AnimatePresence in AppRoutes), layout animations (motion.div in layouts), and micro-interactions (hover effects on cards).

**Q16: How does the Chatbot component work without a backend?**
> Pure frontend logic. Maintains a messages array in state. On user input, pattern-matches keywords ("loan", "tax", "contact") and returns predefined responses. No API calls.

**Q17: What's the rendering flow when a consultant opens the loan workflow?**
> Login → AdminRoute → ConsultantRoute (ProtectedRoute + RoleBasedRoute) → ConsultantLayout (Sidebar+Topbar) → LoanWorkflow.jsx mounts → useEffect: GET /api/loan-cases → renders case list + stage-specific UI.

**Q18: How are toast notifications implemented?**
> react-hot-toast library. `<Toaster />` rendered in main.jsx. Components call `toast.success()` or `toast.error()` imperatively. Positioned top-right.

**Q19: How does the PDF generator work?**
> `pdfGenerator.js` uses client-side PDF generation (canvas-based). Takes financial data, formats into a report layout, and creates a downloadable PDF blob.

**Q20: Why does AppRoutes have 400+ lines?**
> 80+ routes covering 5 portals (admin, CRM admin, dept admin, consultant, B2B), each with nested layouts and route guards. Plus public pages, auth pages, workflow steps, and redirect aliases.

---

### Spring Boot (20 Questions)

**Q21: Why use Spring Boot for this project?**
> Auto-configuration, embedded Tomcat, Spring Security integration (JWT+RBAC), Spring Data JPA (reduces 90% of DB boilerplate), Flyway migrations, Actuator health checks, and OpenAPI documentation — all production-ready out of the box.

**Q22: Explain the layered architecture.**
> Controller (HTTP concerns, validation, authorization annotations) → Service (business logic, transaction management, cross-entity orchestration) → Repository (data access, JPA queries). Each layer is independently testable.

**Q23: Why use DTOs instead of returning entities?**
> (1) Security: entities contain password hashes. (2) Hibernate: lazy-loading issues during JSON serialization. (3) Decoupling: API contract independent of DB schema. (4) Circular references: entities have bidirectional relationships that cause infinite loops in Jackson.

**Q24: How does JwtAuthFilter work?**
> Extends OncePerRequestFilter. On every request: (1) Extract Authorization header. (2) If Bearer token present → validate signature+expiry. (3) Check if B2B token (type claim). (4) Load User or OrganizationUser. (5) Set SecurityContext.

**Q25: What is @PreAuthorize and how is SecurityRoles used?**
> @PreAuthorize is Spring Security's method-level authorization. SecurityRoles.java defines SpEL constants like `STAFF = "hasAnyRole('SUPER_ADMIN','ADMIN','CRM_ADMIN','DEPARTMENT_ADMIN','CONSULTANT')"`. Controllers use `@PreAuthorize(SecurityRoles.STAFF)`.

**Q26: Why is CSRF disabled?**
> FinBridge uses stateless JWT in Authorization headers, not cookies. CSRF attacks exploit cookie-based sessions. Since no cookies are used for auth, CSRF protection is unnecessary and would add complexity.

**Q27: How does B2BAccessGuard work?**
> Static method `assertOrgAccess(principal, orgId)` — casts principal to OrganizationUser, checks if user.getOrganization().getId() equals orgId. If not → throws AccessDeniedException.

**Q28: Why use Flyway for migrations?**
> Version-controlled schema changes. Each migration is a numbered SQL file (V1, V2, ...). Flyway tracks which have been applied. `ddl-auto: validate` ensures Hibernate validates against the migrated schema without modifying it.

**Q29: How does SequenceGenerator avoid race conditions?**
> Uses PostgreSQL sequences (SELECT nextval('lead_seq')) which are atomic — even concurrent transactions get unique values. The old approach (count+1) had read-then-write races.

**Q30: Why is open-in-view set to true?**
> Some endpoints build DTOs outside explicit transactions, touching lazy associations during mapping. Disabling it caused LazyInitializationException. The proper fix is @EntityGraph, but open-in-view is the pragmatic choice.

**Q31: How does GlobalExceptionHandler work?**
> @RestControllerAdvice with @ExceptionHandler methods for each exception type. Maps exceptions to consistent JSON responses: `{ status: "error", message: "...", errors: {...} }`. The catch-all handler returns a UUID reference for debugging.

**Q32: How is the DtoMapper designed?**
> @Component with methods like `toLeadResponse(Lead)`, `toUser(RegisterRequest)`. Manual mapping (no MapStruct) — explicit, auditable, no magic. Handles null checks on nullable FK references.

**Q33: Why use records for DTOs?**
> Java records are immutable, auto-generate equals/hashCode/toString, and have compact syntax. Perfect for DTOs which are just data carriers.

**Q34: How does the email service work?**
> Spring Boot Mail with Gmail SMTP. EmailService uses @Async for non-blocking sends. Templates build HTML emails. Credentials from environment variables. Mail health check disabled in Actuator (optional service).

**Q35: Why HikariCP pool max = 5?**
> Supabase's direct connection limit is low. Large pools (especially across restarts) exhaust it. 5 connections with aggressive recycling (max-lifetime: 5min) keeps the footprint small.

**Q36: How does the invoice tax calculation work?**
> InvoiceService.create(): sums line item amounts → subtotal. Applies tax rate (18% GST) → taxAmount. total = subtotal + taxAmount. All stored as BigDecimal for precision.

**Q37: How does loan EMI calculation work?**
> Standard formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1). P = principal, r = monthly interest rate (annual/12/100), n = tenure in months. Implemented in LoanCaseService.disburse().

**Q38: What's the purpose of JacksonConfig?**
> Registers Hibernate6Module to handle lazy-loading proxies during Jackson serialization. Without it, serializing an uninitialized lazy proxy throws an exception.

**Q39: How is the Swagger/OpenAPI documentation configured?**
> SwaggerConfig + springdoc-openapi. Controllers use @Tag and @Operation annotations. Available at /swagger-ui.html and /api-docs.

**Q40: What Actuator endpoints are exposed?**
> Only /actuator/health with show-details: never. No metrics or info exposed publicly. Liveness/readiness probes enabled for orchestrators.

---

### PostgreSQL & Database (15 Questions)

**Q41: Why PostgreSQL over MySQL?**
> JSONB support (used for proposals, dept cases, notifications), PostgreSQL arrays (TEXT[] for tags, services), advanced indexing, and Supabase uses PostgreSQL natively.

**Q42: Why JSONB for dept_cases.data?**
> Polymorphic storage — tax, investment, insurance, wealth cases each store different fields. JSONB avoids separate tables per department and allows adding new departments without schema changes.

**Q43: Why UUID primary keys instead of auto-increment?**
> Globally unique (no collision across services), not guessable (security), no sequence contention in distributed scenarios.

**Q44: Why separate users and organization_users tables?**
> Different auth systems (CRM JWT vs B2B JWT), different roles (admin/consultant/client vs COMPANY_ADMIN/FINANCE_MANAGER), different lifecycles. Merging would create a confusing role model.

**Q45: How does the lead_seq sequence work?**
> `CREATE SEQUENCE lead_seq START 1 INCREMENT 1`. SequenceGenerator calls `SELECT nextval('lead_seq')` → returns atomic, gap-free incrementing numbers.

**Q46: Why TEXT[] for tags column?**
> PostgreSQL native arrays allow multi-value without a join table. Querying: `WHERE 'high-value' = ANY(tags)`. Simpler than a tags junction table for this use case.

**Q47: Why is is_active a soft-delete flag?**
> Hard deleting a user would break FK references (leads, consultations, invoices). Soft delete preserves data integrity and audit trail.

**Q48: How are EMI schedule items generated?**
> LoanCaseService.disburse() creates N rows (one per month): `EmiScheduleItem { loanCase, emiNumber, dueDate (disbursedDate + i months), amount (calculated EMI), status: "pending" }`. Cascade save via `@OneToMany(cascade = ALL)`.

**Q49: Why is converted_client_id nullable?**
> Most leads are NOT converted. Only "won" leads have a converted_client_id pointing to the created User.

**Q50: How does the financial_profiles 1:1 relationship work?**
> `@OneToOne` with `user_id` FK. Repository has `findByUserId(UUID)`. Controller does upsert: find existing → update, or create new with `profile.setId(null)` (prevents overwrite attack).

**Q51: What indexes exist?**
> Unique indexes: users.email, leads.lead_id, loan_cases.case_id, organizations.gstin. FK indexes auto-created by JPA. Status/department columns for filtered queries.

**Q52: How is base64 document storage implemented?**
> organization_documents.file_url stores the complete data URI (`data:application/pdf;base64,...`). This is a scaling concern — should move to S3/GCS for production.

**Q53: Why Flyway baseline-on-migrate?**
> Allows Flyway to work with an existing database that was created before Flyway was added. Sets a baseline version and tracks migrations from there.

**Q54: How does the consultation table support the meeting workflow?**
> Columns: status (pending→accepted→scheduled→completed→cancelled), confirmedDate, confirmedTime, meetingLink, recordingEnabled. Each stage transition is a PATCH update.

**Q55: What's the relationship between proposals and invoices?**
> proposals.id is referenced by invoices.proposal_id (nullable FK). An approved proposal can generate an invoice, but invoices can also exist without proposals.

---

### JWT & Security (15 Questions)

**Q56: How is the JWT signed?**
> HMAC-SHA256 using the `JWT_SECRET` environment variable (minimum 32 characters). The jjwt library (0.12.5) handles signing and verification.

**Q57: What claims are in a CRM JWT?**
> `{ sub: userId, email: "...", role: "admin", name: "Super Admin", iat: timestamp, exp: timestamp+24h }`.

**Q58: What claims are in a B2B JWT?**
> `{ sub: orgUserId, organizationId: "uuid", type: "b2b", email: "...", iat, exp }`. The `type: "b2b"` claim tells JwtAuthFilter which user table to query.

**Q59: How does the filter distinguish CRM vs B2B tokens?**
> `jwtService.isB2BToken(token)` checks for the `type: "b2b"` claim. If present → load from organization_users. If absent → load from users.

**Q60: What is a purpose token?**
> A JWT with an additional `purpose` claim (e.g., "reset-password", "verify-email") and a shorter TTL (1h). Validated by checking the purpose claim matches the expected action.

**Q61: Why store JWT in sessionStorage AND localStorage?**
> sessionStorage: tab-isolated (opening new tab doesn't inherit session). localStorage: persistence across tabs. On new tab open, AuthContext copies from localStorage → sessionStorage.

**Q62: What's the XSS risk?**
> Both sessionStorage and localStorage are accessible via JavaScript. An XSS attack could steal the token. Mitigation: React auto-escapes output, CSP headers set. Better solution: HttpOnly cookies.

**Q63: How is password hashing implemented?**
> BCryptPasswordEncoder (Spring Security). BCrypt includes a random salt, cost factor of 10 (default). Each hash is unique even for the same password.

**Q64: Why no refresh tokens?**
> Simplicity. The 24h expiry means users re-login daily. For production, a refresh token + access token pair would improve UX (short-lived access, long-lived refresh).

**Q65: How does rate limiting work?**
> RateLimitFilter uses a ConcurrentHashMap keyed by IP address. Tracks request count per time window. Exceeding the limit → 429 Too Many Requests.

**Q66: What CORS configuration is used?**
> Allowed origins: localhost:5173-5177 (configurable via CORS_ALLOWED_ORIGINS env). Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS. Allowed headers: all. Credentials: true.

**Q67: What security headers are set?**
> HSTS (31536000s, includeSubDomains), X-Frame-Options: DENY, Content-Security-Policy: "default-src 'none'; frame-ancestors 'none'", Referrer-Policy: STRICT_ORIGIN_WHEN_CROSS_ORIGIN.

**Q68: How does account enumeration prevention work?**
> Login: "Invalid email or password" (same message for wrong email vs wrong password). Forgot password: "If an account exists with that email, we've sent a reset link" (always succeeds).

**Q69: What happens when a JWT expires?**
> JwtAuthFilter catches SignatureException/ExpiredJwtException, leaves SecurityContext empty. Protected endpoints return 401. Frontend api.js interceptor detects 401 → clearToken() → redirect to login.

**Q70: How does OwnershipGuard work?**
> Verifies that the authenticated user owns the resource they're accessing. For example, a client can only view their own proposals.

---

### Architecture & CRM Workflow (15 Questions)

**Q71: Describe the overall system architecture.**
> Three-tier: React SPA (client) → Spring Boot REST API (server) → PostgreSQL (data). Frontend makes HTTP calls to 18 REST controllers. Backend uses layered architecture: Controller → Service → Repository. Authentication via stateless JWT.

**Q72: How does the CRM pipeline work?**
> Lead stages: new → contacted → qualified → dept_review → proposal_sent → won → lost. Each transition is a PATCH to /api/leads/:id. Department assignment at dept_review. Client account creation at won.

**Q73: How are different departments handled?**
> User.department field. Route guards check department access. API filtering by department. DeptCase table with JSONB for department-specific data. Sidebar filters menu items by department.

**Q74: How does the lead-to-client conversion work?**
> LeadService.convertToClient(): check existing user by email → if new: create User(role=client, temp password) → link lead.convertedClient → lead.status = "won". Returns temp password for admin to share.

**Q75: Explain the loan workflow state machine.**
> 8 stages stored in loan_cases.stage: document_collection → eligibility → recommendation → client_review → bank_processing → disbursement → emi_tracking → closed. Each stage has specific data fields. UI renders different forms per stage.

**Q76: How does the B2B portal differ from the CRM?**
> Separate auth system (B2BAuthContext + b2bApi.js), separate user table (organization_users), separate layout (B2BLayout), separate entities (Organization, ServiceRequest, SupportTicket), separate JWT claims (type: "b2b").

**Q77: How does the proposal-to-payment flow work?**
> Consultant creates proposal (draft) → sends to client (sent) → client approves (approved) → consultant creates invoice (with line items + tax) → payment recorded → invoice marked paid.

**Q78: How is the notification system designed?**
> Notification entity with user FK, type, title, message, JSONB metadata (for context like consultationId). NotificationService.create() called from other services. Frontend polls GET /api/notifications.

**Q79: How does the internal chat work?**
> ChatController: GET /chat/contacts (filtered by department), GET /chat/messages?contactId=X (history between two users), POST /chat/messages (send). Messages stored in chat_messages table. No WebSocket — uses polling.

**Q80: How does the KYC verification flow work?**
> B2B user uploads doc (base64) → pending_review. Staff reviews queue (GET /api/kyc/documents). Staff verifies/rejects (PATCH /api/kyc/documents/:id). If all required docs verified → org.kycVerified = true.

**Q81: How does the financial profile guard work?**
> On CRM login: AuthContext calls GET /api/financial-profile. If 404 → hasFinancialProfile=false. FinancialProfileGuard wraps client routes → if !hasFinancialProfile → redirect to profile setup page.

**Q82: How does the cross-sell engine work?**
> CrossSellEngine.jsx: examines client's current services/cases → recommends complementary services. Loan client → suggest Insurance. Tax client → suggest Investment. Rule-based, no ML.

**Q83: How is the EMI schedule generated?**
> On disbursement: calculate monthly EMI → loop i=1 to tenureMonths → create EmiScheduleItem(emiNumber=i, dueDate=disbursedDate+i months, amount=EMI, status=pending). Saved via cascade.

**Q84: How does the dashboard aggregate data?**
> DashboardController directly injects repositories (UserRepository, LeadRepository, LoanRepository, InvoiceRepository) and calls count/aggregate methods. Returns a Map of stats.

**Q85: How would you add a new department (e.g., "real-estate")?**
> 1) Add to departmentLabels in departmentAccess.js. 2) Add sidebar menu items. 3) Add routes in AppRoutes.jsx. 4) Create workflow page (uses /api/dept-cases/real-estate). 5) No backend schema changes needed (JSONB handles new data).

---

### FinBridge-Specific (15 Questions)

**Q86: Why is B2BService.java 36KB?**
> It handles the ENTIRE B2B portal: registration, login, service requests CRUD, proposals, meetings, payments (with mock gateway), documents (KYC upload/download), team management, support tickets, dashboard stats, and invoice generation. It's the monolith within the monolith.

**Q87: Why does api.js add _id aliases?**
> Backward compatibility. The frontend was originally built for MongoDB (which uses _id). Rather than updating every `item._id` reference across 80+ pages, the interceptor adds _id as an alias.

**Q88: How does the mock payment gateway work?**
> application.yml: `app.payments.mock-enabled: true`. B2BService.payPayment() checks this flag. If true → auto-approves payment without Razorpay verification. Must be false in production.

**Q89: Why is there no WebSocket for chat/notifications?**
> Simplicity. Polling (periodic GET requests) works for the current scale. WebSocket would add complexity (SockJS, STOMP, connection management). Planned for future enhancement.

**Q90: How does the health score calculator work?**
> healthScoreCalculator.js: takes financial profile data (income, expenses, savings, debt, credit score) → weighted formula → 0-100 score. Displayed on client dashboard.

**Q91: Why does Home.jsx include ThreeBackground?**
> Premium visual appeal. The WebGL animated canvas (particle effects, gradient meshes) creates a "wow" factor. Despite the name, it doesn't use Three.js — pure Canvas2D API.

**Q92: How does the CookieConsent component persist?**
> Checks localStorage for 'cookieConsent'. If not set → shows banner. On accept → sets localStorage item. On next visit, banner doesn't appear.

**Q93: What happens when Supabase connection pool is exhausted?**
> HikariCP throws ConnectionTimeoutException after 30s. GlobalExceptionHandler catches it → 500 with UUID reference. Frontend shows error toast.

**Q94: How is the tax calculator implemented?**
> taxCalculator.js: implements Indian tax slabs (old/new regime). Input: gross income, deductions. Output: tax liability, effective rate, slab-wise breakdown.

**Q95: Why is there both a /consultant/* and /department-consultant/* route set?**
> /department-consultant/:dept/* → department-specific dashboards (e.g., /department-consultant/loans/dashboard). /consultant/* → cross-cutting features (proposals, invoices, KYC). Both require consultant role.

**Q96: How does the sequence naming work for different entities?**
> SequenceGenerator.Seq enum: LEAD→"LEAD-00001", LOAN_CASE→"LC-00001", INVOICE→"INV-00001", SERVICE_REQUEST→"SR-00001", SUPPORT_TICKET→"TKT-00001", ORG_PAYMENT→"PAY-00001". Dept cases use department-specific prefix (TAX-00001, INV-00001).

**Q97: What's the data flow for the admin analytics page?**
> AdminDashboard → multiple parallel API calls (GET /dashboard, GET /leads/stats, GET /invoices/stats, GET /payments/stats) → setState for each → Recharts components receive data as props → render charts.

**Q98: How does the system handle concurrent lead creation?**
> PostgreSQL sequences guarantee unique lead_ids even under concurrent requests. Two simultaneous POST /api/leads/capture both call nextval('lead_seq') — each gets a different number atomically.

**Q99: What's the full security chain for a protected API call?**
> Browser sends token → Tomcat receives → RateLimitFilter (IP check) → CORS filter → JwtAuthFilter (validate token, load user, set SecurityContext) → Spring Security authorization (@PreAuthorize) → Controller → Service → Repository → DB.

**Q100: How would you deploy FinBridge to production?**
> 1) Docker: build Spring Boot JAR + Vite production build → nginx serves frontend. 2) Environment: set DB_URL, DB_PASSWORD, JWT_SECRET, CORS_ALLOWED_ORIGINS. 3) Disable mock payments. 4) Use PgBouncer for connection pooling. 5) Add HTTPS (Let's Encrypt). 6) CI/CD via GitHub Actions.

---

## TASK 12: 60-MINUTE PRESENTATION SCRIPT

---

### Slide 1: Project Overview (5 minutes)

**Visual**: FinBridge logo, tagline "Enterprise Financial Advisory CRM + B2B Client Portal", tech stack icons.

> **Speaker Notes**: "Good morning everyone. Today I'm presenting FinBridge — an enterprise-grade financial advisory platform that I built from the ground up. FinBridge solves a real problem: financial advisory firms manage leads, consultations, loan workflows, tax planning, insurance, and wealth management across fragmented spreadsheets and email chains. FinBridge unifies everything into one platform.
>
> The platform serves FIVE user types: Super Admins who manage the entire system, CRM Admins who handle the lead pipeline, Department Admins who oversee specific departments like loans or tax, Consultants who directly serve clients, and B2B Organization Clients who access their own dedicated portal.
>
> Tech stack: React 19 with Vite 8 on the frontend, Spring Boot 3.2.5 with Java 21 on the backend, PostgreSQL hosted on Supabase, JWT authentication, and RESTful APIs documented with Swagger."

---

### Slide 2: Architecture (5 minutes)

**Visual**: Three-tier architecture diagram (Browser → Spring Boot → PostgreSQL), request flow arrows.

> **Speaker Notes**: "The architecture follows a clean three-tier pattern. The React SPA communicates with 18 REST controllers via Axios HTTP clients. We have two separate Axios instances — one for CRM operations (api.js) and one for B2B operations (b2bApi.js) — each with their own JWT token management.
>
> On the backend, every request passes through a security filter chain: rate limiting, CORS validation, JWT extraction and validation, and role-based authorization via Spring Security's @PreAuthorize annotations.
>
> The backend uses a strict layered architecture: Controllers handle HTTP concerns, Services contain business logic, and Repositories manage database access through Spring Data JPA. This separation enables independent testing and clean responsibility boundaries.
>
> We use Flyway for database migrations with ddl-auto set to validate — Hibernate validates the schema but never modifies it. This gives us full control over schema changes."

---

### Slide 3: Frontend Architecture (7 minutes)

**Visual**: Component tree diagram showing main.jsx → AuthProvider → AppRoutes → Layouts → Pages.

> **Speaker Notes**: "The frontend has 80+ routes organized into 7 route groups, each wrapped with appropriate guards. ProtectedRoute checks authentication, RoleBasedRoute checks role AND department, and B2BProtectedRoute checks B2B session.
>
> Key architectural decisions: We use React Context API (not Redux) because we only have two global state concerns — CRM auth and B2B auth. All page-level state is managed locally via useState hooks. This keeps the architecture simple and avoids unnecessary boilerplate.
>
> The api.js interceptor does something clever: it normalizes Spring Boot's Page responses into bare arrays and adds _id aliases for backward compatibility with the original MongoDB-based frontend. This saved us from rewriting hundreds of API call sites during the backend migration.
>
> We have 7 different layouts: MainLayout for public pages (Navbar+Footer), AdminLayout, CRMAdminLayout, DepartmentAdminLayout, ConsultantLayout, ClientLayout (all with Sidebar+Topbar), and B2BLayout (its own complete sidebar). The Sidebar component dynamically shows different menu items based on the user's role and department."

---

### Slide 4: Backend Architecture (7 minutes)

**Visual**: Controller→Service→Repository diagram with entity relationship lines.

> **Speaker Notes**: "The backend has 18 controllers, 17 services, 23 repositories, and 35 JPA entities. Let me highlight the key architectural patterns.
>
> Authentication uses JwtAuthFilter — a OncePerRequestFilter that extracts the JWT from the Authorization header, validates it, determines if it's a CRM or B2B token (via a 'type' claim), loads the appropriate user entity, and sets the SecurityContext.
>
> For ID generation, we use PostgreSQL sequences via SequenceGenerator — this replaced a broken count()+1 approach that had race conditions. Each entity type has its own sequence: LEAD-00001, LC-00001, INV-00001.
>
> The DtoMapper centralizes all entity-to-DTO conversions. This prevents password hashes from leaking to the API and avoids Hibernate lazy-loading issues during JSON serialization.
>
> Error handling is centralized in GlobalExceptionHandler — a @RestControllerAdvice that maps every exception type to a consistent JSON response format with a UUID reference for debugging."

---

### Slide 5: Database Design (5 minutes)

**Visual**: ER diagram showing key tables and relationships.

> **Speaker Notes**: "The database has 35 tables. The core entity is `users` — every person in the system (staff AND clients). We use a single-table role discriminator rather than separate tables, which simplifies queries but uses nullable department columns.
>
> The `leads` table is the CRM pipeline — each lead has a human-readable ID (LEAD-00001), a status that progresses through the pipeline (new→qualified→won), and FK references to assigned consultant and converted client.
>
> For the loan workflow, `loan_cases` is a state machine with 8 stages and 30+ columns covering the entire lifecycle from document collection to EMI tracking. Child tables handle documents, EMI schedule items, and notes.
>
> The clever design is `dept_cases` — a single table serving tax, investments, insurance, and wealth workflows via a JSONB `data` column. Adding a new department requires zero schema changes.
>
> The B2B portal has its own entity cluster: organizations, organization_users, organization_documents, service_requests, support_tickets — all independent from the CRM entities."

---

### Slide 6: Authentication System (5 minutes)

**Visual**: Dual auth flow diagram (CRM vs B2B), token storage diagram.

> **Speaker Notes**: "FinBridge runs TWO parallel authentication systems. CRM auth uses AuthContext with tokens stored in both sessionStorage (tab-isolated) and localStorage (cross-tab persistence). B2B auth uses B2BAuthContext with tokens in sessionStorage ONLY.
>
> JWT tokens are HMAC-SHA256 signed with a 24-hour expiry. CRM tokens carry {userId, email, role, name}. B2B tokens carry {orgUserId, organizationId, type:'b2b'}. The JwtAuthFilter uses the 'type' claim to determine which user table to query.
>
> Password security: BCrypt with default cost factor 10. Purpose tokens for password reset and email verification — same JWT mechanism but with a 'purpose' claim and shorter TTL.
>
> Security headers: HSTS, X-Frame-Options: DENY, strict CSP, Referrer-Policy. Rate limiting via RateLimitFilter. Account enumeration prevention on login and forgot-password endpoints."

---

### Slide 7: Role-Based Access Control (5 minutes)

**Visual**: Access matrix table (roles × features).

> **Speaker Notes**: "Five CRM roles: admin (full access), crm-admin (lead pipeline), department-admin (department-scoped), consultant (own cases), client (own data). Four B2B roles: COMPANY_ADMIN, FINANCE_MANAGER, DIRECTOR, EMPLOYEE.
>
> Authorization happens at three layers: Frontend route guards (ProtectedRoute, RoleBasedRoute) prevent navigation. Backend @PreAuthorize annotations enforce at the controller level. Ownership guards (B2BAccessGuard, OwnershipGuard) verify resource-level access.
>
> Department-scoping is critical: a loans consultant can only see loans leads, loans cases, and loans consultations. This is enforced both in the API (controller auto-filters by user.department) and in the frontend (Sidebar filters menu items)."

---

### Slide 8: CRM Workflow (7 minutes)

**Visual**: Lead pipeline flowchart with stage transitions.

> **Speaker Notes**: "The CRM workflow is the heart of FinBridge. It starts with a website visitor submitting an inquiry — POST /api/leads/capture, public endpoint, no auth required.
>
> The CRM admin qualifies the lead (score 0-100, cold/warm/hot priority), then routes it to a department. The department admin reviews and sends a fee proposal — this auto-creates a consultation booking.
>
> The CRM admin converts the lead to a client — creating a User account with a temporary password. The department admin assigns a consultant. The consultant schedules and conducts the meeting.
>
> Then the service-specific workflow begins. For loans: an 8-stage pipeline from document collection through eligibility assessment, recommendation, client approval, bank processing, disbursement, and EMI tracking. For tax, investments, insurance, wealth: DeptCase with JSONB-driven workflows.
>
> Finally: proposal creation, client approval, invoice generation with GST calculation, and payment recording."

---

### Slide 9: Report Generation & Analytics (4 minutes)

**Visual**: Dashboard screenshot, chart examples.

> **Speaker Notes**: "The admin dashboard aggregates data from multiple sources: total users, lead pipeline stats, revenue metrics, department performance. Recharts renders interactive line graphs, bar charts, and pie charts.
>
> Client-side PDF generation via pdfGenerator.js creates downloadable financial reports. The health score calculator provides a 0-100 financial wellness score. The tax calculator implements Indian tax slabs.
>
> The B2B portal provides downloadable invoices for each payment — the backend returns payment details and the frontend renders a printable invoice format."

---

### Slide 10: Future Enhancements (5 minutes)

**Visual**: Roadmap with priority items.

> **Speaker Notes**: "Several improvements are planned:
>
> **High Priority**: Replace base64 document storage with S3/GCS (current approach doesn't scale). Implement real Razorpay integration (currently mock). Migrate JWT storage from localStorage to HttpOnly cookies (XSS mitigation). Add refresh tokens.
>
> **Medium Priority**: WebSocket for real-time notifications and chat (currently polling). Server-side PDF generation. Two-factor authentication. Audit logging backend. Integration tests.
>
> **Architecture**: Docker containerization with docker-compose. CI/CD via GitHub Actions. Redis caching layer for read-heavy endpoints. Consider PgBouncer for connection pooling.
>
> **Scale**: If FinBridge needed to handle 10x traffic, we'd add: API gateway (Spring Cloud Gateway), Redis caching, Elasticsearch for lead/client search, CQRS for dashboard aggregations, and horizontal scaling behind a load balancer.
>
> Thank you. I'm happy to take questions."

---

### Q&A Preparation (5 minutes reserved)

**Common follow-ups**:
- "How would you handle microservices?" → Extract B2B and Notification services first, communicate via events.
- "What about testing?" → Currently manual. Would add JUnit + MockMvc for controllers, Mockito for services, Testcontainers for integration tests.
- "What was the hardest part?" → The dual authentication system and ensuring B2B sessions don't interfere with CRM sessions. Also: the loan workflow's 8-stage state machine with 30+ fields.
- "How long did development take?" → The full-stack application with 80+ pages, 35 entities, and 100+ API endpoints was built iteratively over several weeks.

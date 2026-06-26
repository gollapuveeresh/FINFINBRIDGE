# FinBridge Deep-Dive — Part 2: APIs, Services, Entities & Code Analysis

---

## TASK 5: EVERY BACKEND API EXPLAINED

---

### 5.1 Authentication APIs (`AuthController.java` — `/api/auth`)

---

#### `POST /api/auth/login`

| Attribute | Detail |
|---|---|
| **Why Exists** | Authenticates a CRM/staff/client user and returns a JWT token for subsequent API calls |
| **Who Calls** | `AdminLogin.jsx`, `CRMAdminLogin.jsx`, `DepartmentAdminLogin.jsx`, `ConsultantLogin.jsx`, `LoginRegistration.jsx` — all via `AuthContext.login()` |
| **Request Body** | `{ "email": "admin@finbridge.com", "password": "admin123" }` |
| **Validation** | `@Valid` on `LoginRequest` → `@NotBlank email`, `@NotBlank password` |
| **Security** | `permitAll()` — no JWT required (it's the login endpoint itself) |
| **Controller Logic** | Delegates entirely to `authService.login(request)`, wraps result in `ResponseEntity.ok()` |
| **Service Logic** | 1) `userRepository.findByEmailIgnoreCase(email)` — case-insensitive lookup. 2) If not found → throw `UnauthorizedException("Invalid email or password")` (no account enumeration). 3) `passwordEncoder.matches(rawPassword, hashedPassword)` — BCrypt comparison. 4) If wrong → same generic error. 5) Check `user.isActive()` — if deactivated → throw `UnauthorizedException("Account is deactivated")`. 6) `jwtService.generateToken(user)` — creates HMAC-SHA256 JWT with claims {sub=userId, email, role, name}, expiry 24h. 7) Return `LoginResponse(token, id, name, email, role, department)` |
| **Database Query** | `SELECT * FROM users WHERE LOWER(email) = LOWER(?)` |
| **Response** | `200 OK { "token": "eyJ...", "id": "uuid", "name": "Super Admin", "email": "admin@finbridge.com", "role": "admin", "department": null }` |
| **Error Cases** | 400 (missing fields), 401 (wrong credentials / deactivated), 500 (unexpected) |

---

#### `POST /api/auth/register`

| Attribute | Detail |
|---|---|
| **Why Exists** | Creates a new user account (primarily client self-registration) |
| **Who Calls** | `LoginRegistration.jsx` via `AuthContext.register()` |
| **Request Body** | `{ "name": "John", "email": "john@test.com", "password": "pass123", "role": "client", "phone": "9876543210", "companyName": "Acme Inc", "department": null }` |
| **Validation** | `@NotBlank name, email, password`. Email format validated |
| **Security** | `permitAll()` |
| **Service Logic** | 1) Check `userRepository.existsByEmailIgnoreCase(email)` — if exists → throw `BadRequestException("Email already registered")`. 2) `passwordEncoder.encode(password)` — BCrypt hash. 3) `DtoMapper.toUser(request)` — maps DTO to entity. 4) `user.setPassword(hashedPassword)`. 5) `userRepository.save(user)`. 6) `jwtService.generateToken(user)` → auto-login. 7) Return `LoginResponse` |
| **Database Query** | `SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)` then `INSERT INTO users (...)` |
| **Response** | `200 OK { token, id, name, email, role, department }` |

---

#### `GET /api/auth/me`

| Attribute | Detail |
|---|---|
| **Why Exists** | Validates current JWT and returns user profile — used on page refresh to restore auth state |
| **Who Calls** | `AuthContext.jsx` useEffect on mount (checks if stored token is still valid) |
| **Request Body** | None |
| **Security** | Requires valid JWT (not in permitAll list) |
| **Controller Logic** | `@AuthenticationPrincipal User user` → Spring injects the authenticated user from SecurityContext. Returns `StaffResponse` DTO |
| **Database Query** | `SELECT * FROM users WHERE id = ?` (done by `JwtAuthFilter` before controller is reached) |
| **Response** | `200 OK { id, name, email, phone, role, department, companyName, active, emailVerified, createdAt }` |
| **If Token Invalid** | `JwtAuthFilter` doesn't set SecurityContext → Spring Security returns 401 |

---

#### `POST /api/auth/forgot-password`

| Attribute | Detail |
|---|---|
| **Why Exists** | Initiates password reset by sending an email with a time-limited reset link |
| **Who Calls** | `ForgotPassword.jsx` |
| **Request Body** | `{ "email": "user@example.com" }` |
| **Security** | `permitAll()` |
| **Service Logic** | 1) `userRepository.findByEmailIgnoreCase(email)`. 2) If not found → still return success (prevents account enumeration). 3) If found → `jwtService.generatePurposeToken(user, "reset-password", 1h TTL)`. 4) `emailService.sendResetEmail(user.getEmail(), resetLink)` — async. 5) Reset link = `{frontendUrl}/reset-password?token={purposeToken}` |
| **Response** | `200 OK { "message": "If an account exists with that email, we've sent a reset link" }` |

---

#### `POST /api/auth/reset-password`

| Attribute | Detail |
|---|---|
| **Why Exists** | Completes password reset using the purpose token from the email link |
| **Who Calls** | `ResetPassword.jsx` |
| **Request Body** | `{ "token": "eyJ...purposeToken", "newPassword": "newpass123" }` |
| **Service Logic** | 1) Verify purpose token (signature + expiry + purpose claim = "reset-password"). 2) Extract userId from token. 3) `userRepository.findById(userId)`. 4) `user.setPassword(passwordEncoder.encode(newPassword))`. 5) `userRepository.save(user)` |
| **Database Query** | `UPDATE users SET password = ? WHERE id = ?` |

---

#### `POST /api/auth/verify-email`

| Attribute | Detail |
|---|---|
| **Why Exists** | Verifies a user's email address via a purpose token |
| **Service Logic** | Verify token (purpose="verify-email") → `user.setEmailVerified(true)` → save |
| **Database Query** | `UPDATE users SET is_email_verified = true WHERE id = ?` |

---

#### `GET /api/auth/consultants`

| Attribute | Detail |
|---|---|
| **Why Exists** | Lists all consultants — used by admin and dept-admin for assignment |
| **Who Calls** | `ConsultantManagement.jsx`, `ConsultationQueue.jsx`, `Assignments.jsx` |
| **Security** | `@PreAuthorize(SecurityRoles.STAFF)` |
| **Query Params** | `?department=loans` (optional filter) |
| **Database Query** | `SELECT * FROM users WHERE role = 'consultant'` (+ department filter) |
| **Response** | `200 OK [{ id, name, email, department, active, ... }, ...]` |

---

#### `POST /api/auth/create-consultant`

| Attribute | Detail |
|---|---|
| **Why Exists** | Creates a new consultant user account (admin-only function) |
| **Who Calls** | `ConsultantManagement.jsx` |
| **Security** | `@PreAuthorize(SecurityRoles.ADMIN_OR_DEPT)` — only admin or dept-admin |
| **Service Logic** | Same as register but with `role="consultant"` and `department` set |
| **Database Query** | `INSERT INTO users (name, email, password, role, department, ...) VALUES (?, ?, ?, 'consultant', ?, ...)` |

---

#### `GET /api/auth/users`

| Attribute | Detail |
|---|---|
| **Why Exists** | Lists ALL users in the system — admin-only |
| **Who Calls** | `UserManagement.jsx`, `AdminDashboard.jsx` |
| **Security** | `@PreAuthorize(SecurityRoles.ADMINS)` — super admin only |
| **Database Query** | `SELECT * FROM users ORDER BY created_at DESC` |

---

#### `PATCH /api/auth/users/:id/status`

| Attribute | Detail |
|---|---|
| **Why Exists** | Toggle user active/inactive (soft delete) |
| **Who Calls** | `UserManagement.jsx` toggle button |
| **Security** | `@PreAuthorize(SecurityRoles.ADMINS)` |
| **Service Logic** | `user.setActive(!user.isActive())` → save |
| **Database Query** | `UPDATE users SET is_active = ? WHERE id = ?` |

---

### 5.2 Lead APIs (`LeadController.java` — `/api/leads`)

---

#### `POST /api/leads/capture`

| Attribute | Detail |
|---|---|
| **Why Exists** | Public endpoint for website visitors to submit inquiries — the entry point of the entire CRM pipeline |
| **Who Calls** | `LeadCaptureForm.jsx` (Home page), `Contact.jsx` |
| **Request Body** | `{ "name": "John", "email": "john@test.com", "phone": "9876543210", "requirement": "Business Loan", "budget": 5000000, "income": 1200000 }` |
| **Security** | `@PreAuthorize("permitAll()")` — overrides class-level `@PreAuthorize(STAFF)` |
| **Service Logic** | 1) `sequenceGenerator.next(Seq.LEAD)` → "LEAD-00001". 2) Set defaults: status="new", priority="warm", source="website_form", score=0. 3) `leadRepository.save(lead)` |
| **Database Query** | `SELECT nextval('lead_seq')` then `INSERT INTO leads (...)` |
| **Response** | `201 Created { id, leadId: "LEAD-00001", name, email, status: "new", ... }` |

---

#### `GET /api/leads`

| Attribute | Detail |
|---|---|
| **Why Exists** | Lists leads with optional filtering — the core CRM data view |
| **Who Calls** | `LeadManagement.jsx`, `Leads.jsx`, `LeadQueue.jsx`, `LeadReview.jsx`, `Dashboard.jsx` |
| **Query Params** | `?department=loans&status=qualified` |
| **Security** | `@PreAuthorize(SecurityRoles.STAFF)` |
| **Controller Logic** | For consultants and dept-admins: auto-filters by user's department (even if no param passed). This ensures a loans consultant only sees loans leads |
| **Database Query** | `SELECT l FROM Lead l WHERE (:dept IS NULL OR l.department = :dept) AND (:status IS NULL OR l.status = :status) AND l.active = true ORDER BY l.createdAt DESC` |
| **Response** | `200 OK { "leads": [{ id, leadId, name, email, status, priority, score, department, ... }, ...] }` |

---

#### `POST /api/leads/:id/send-to-department`

| Attribute | Detail |
|---|---|
| **Why Exists** | Routes a qualified lead to a specific department for further processing |
| **Who Calls** | `Leads.jsx` (CRM admin), `LeadManagement.jsx` (admin) |
| **Request Body** | `{ "department": "loans", "notes": "High-value business loan inquiry" }` |
| **Service Logic** | 1) Find lead by id. 2) `lead.setDepartment("loans")`. 3) `lead.setStatus("dept_review")`. 4) Add note: "Sent to loans department by {actor}". 5) Save |
| **Database** | `UPDATE leads SET department='loans', status='dept_review' WHERE id=?` + `INSERT INTO lead_notes` |

---

#### `POST /api/leads/:id/send-fee-proposal`

| Attribute | Detail |
|---|---|
| **Why Exists** | Department admin sends a consultation fee proposal to the lead, creating a consultation booking |
| **Who Calls** | `LeadReview.jsx` (dept admin) |
| **Service Logic** | 1) Find lead. 2) `lead.setStatus("proposal_sent")`. 3) Create `Consultation` entity linked to lead. 4) Optionally create `Notification` for the lead owner. 5) Save all |
| **Database** | `UPDATE leads SET status='proposal_sent'` + `INSERT INTO consultations (...)` |

---

#### `POST /api/leads/:id/convert`

| Attribute | Detail |
|---|---|
| **Why Exists** | Converts a qualified lead into a client user account — the key CRM conversion action |
| **Who Calls** | `Leads.jsx`, `LeadManagement.jsx` |
| **Service Logic** | 1) Check if user with lead's email already exists. 2) If exists: link lead → existing user, return `isNewClient=false`. 3) If new: create User(role="client"), generate temp password, BCrypt hash, save. 4) `lead.setStatus("won")`, `lead.setConvertedClient(client)`, save lead. 5) Return `ConversionResult(isNewClient, tempPassword, client)` |
| **Database** | `SELECT FROM users WHERE email=?` → `INSERT INTO users (role='client')` → `UPDATE leads SET status='won', converted_client_id=?` |
| **Response** | `200 OK { "isNewClient": true, "tempPassword": "xK9mP2qr", "client": {...} }` |

---

### 5.3 Consultation APIs (`ConsultationController.java` — `/api/consultations`)

---

#### `POST /api/consultations`

| Attribute | Detail |
|---|---|
| **Why Exists** | Creates a new consultation/meeting booking |
| **Who Calls** | `ConsultationQueue.jsx`, `Schedule.jsx` |
| **Service Logic** | 1) If caller is staff: client field from request body. 2) If caller is consultant: auto-set as consultant. 3) Set status="pending", department from request. 4) Save |
| **Database** | `INSERT INTO consultations (client_id, consultant_id, department, status, ...)` |

---

#### `PATCH /api/consultations/:id/accept`

| Attribute | Detail |
|---|---|
| **Why Exists** | Consultant or dept-admin accepts a pending consultation |
| **Request Body** | `{ "confirmedDate": "2026-06-25", "confirmedTime": "10:00", "recordingEnabled": true }` |
| **Service Logic** | Set status="accepted", confirmedDate, confirmedTime, recordingEnabled. Create notification for client |

---

#### `PATCH /api/consultations/:id/assign`

| Attribute | Detail |
|---|---|
| **Why Exists** | Dept admin assigns a specific consultant to handle a consultation |
| **Request Body** | `{ "consultantId": "uuid" }` |
| **Service Logic** | `consultation.setConsultant(userRepository.findById(consultantId))` → save |

---

#### `PATCH /api/consultations/:id/schedule`

| Attribute | Detail |
|---|---|
| **Why Exists** | Confirms meeting date/time and optionally sets a meeting link |
| **Request Body** | `{ "confirmedDate": "2026-06-25", "confirmedTime": "10:00", "meetingLink": "https://meet.google.com/abc", "recordingEnabled": false }` |
| **Service Logic** | Updates date/time/link fields, sets status="scheduled" |

---

#### `PATCH /api/consultations/:id/complete`

| Attribute | Detail |
|---|---|
| **Why Exists** | Marks consultation as completed after meeting is done |
| **Service Logic** | `consultation.setStatus("completed")` → save → create notification |

---

### 5.4 Loan Case APIs (`LoanCaseController.java` — `/api/loan-cases`)

---

#### `POST /api/loan-cases`

| Attribute | Detail |
|---|---|
| **Why Exists** | Creates a new loan case workflow instance |
| **Who Calls** | `LoanWorkflow.jsx` |
| **Security** | `@PreAuthorize(SecurityRoles.STAFF)` |
| **Service Logic** | 1) Generate `caseId = sequenceGenerator.next(Seq.LOAN_CASE)` → "LC-00001". 2) Set stage="document_collection". 3) Link client, consultant, lead. 4) Initialize empty document checklist. 5) Save |

---

#### `PATCH /api/loan-cases/:id`

| Attribute | Detail |
|---|---|
| **Why Exists** | Universal update endpoint for all loan case fields — handles stage transitions, document uploads, eligibility data, recommendations, client decisions, bank processing |
| **Who Calls** | `LoanWorkflow.jsx` (every stage) |
| **Request Body** | Varies by stage: `{ "stage": "eligibility", "creditScore": 750, "dti": 0.35, "ltv": 0.8, "eligible": true }` or `{ "stage": "recommendation", "recommendedBank": "SBI", "recommendedRate": 8.5, "recommendedTenure": 240 }` |
| **Service Logic** | Maps all provided fields to the entity using a generic `body.get("key")` pattern. Only updates fields that are present in the request body |

---

#### `POST /api/loan-cases/:id/disburse`

| Attribute | Detail |
|---|---|
| **Why Exists** | Records loan disbursement and auto-generates the EMI schedule |
| **Request Body** | `{ "disbursedAmount": 5000000, "interestRate": 8.5, "tenureMonths": 240, "bankName": "SBI", "disbursedDate": "2026-06-23" }` |
| **Service Logic** | 1) Set disbursement fields on LoanCase. 2) Calculate monthly EMI using the standard formula: `EMI = P × r × (1+r)^n / ((1+r)^n - 1)`. 3) Generate `n` `EmiScheduleItem` entities (one per month). 4) Set stage="emi_tracking". 5) `CascadeType.ALL` saves everything in one transaction |
| **Database** | `UPDATE loan_cases SET ...` + 240× `INSERT INTO emi_schedule_items (...)` |

---

#### `PATCH /api/loan-cases/:id/emi/:emiId`

| Attribute | Detail |
|---|---|
| **Why Exists** | Marks individual EMI payments as paid |
| **Service Logic** | `emiItem.setStatus("paid")`, `emiItem.setPaidDate(paidDate)` → save |

---

### 5.5 Department Case APIs (`DeptCaseController.java` — `/api/dept-cases`)

---

#### `GET /api/dept-cases/:dept`

| Attribute | Detail |
|---|---|
| **Why Exists** | Lists all cases for a specific department (tax, investments, insurance, wealth) |
| **Who Calls** | `TaxWorkflow.jsx`, `InvestmentWorkflow.jsx`, `InsuranceWorkflow.jsx`, `WealthWorkflow.jsx` |
| **Database** | `SELECT * FROM dept_cases WHERE department = ? ORDER BY created_at DESC` |

---

#### `POST /api/dept-cases/:dept`

| Attribute | Detail |
|---|---|
| **Why Exists** | Creates a new department-specific case |
| **Service Logic** | 1) Generate caseId with department prefix (TAX-00001, INV-00001, etc.). 2) Set department, stage, client, consultant. 3) Store department-specific data in JSONB `data` column. 4) Save |
| **Key Design** | The JSONB `data` column makes this truly polymorphic — tax cases store different fields than investment cases, but they all use the same table |

---

### 5.6 B2B APIs (`B2BController.java` — `/api/b2b`)

---

#### `POST /api/b2b/register`

| Attribute | Detail |
|---|---|
| **Why Exists** | Registers a new organization + creates the first admin user for that org |
| **Who Calls** | `b2b/Register.jsx` via `B2BAuthContext.register()` |
| **Request Body** | `{ "companyName": "Acme Corp", "industry": "Manufacturing", "gstin": "22AAAAA0000A1Z5", "contactName": "Jane", "contactEmail": "jane@acme.com", "password": "pass123", "annualTurnover": 50000000, "employeeCount": 200, "services": ["Tax Advisory", "Loans"] }` |
| **Service Logic** | 1) Create `Organization` entity. 2) Create `OrganizationUser` with role="COMPANY_ADMIN" and BCrypt-hashed password. 3) Generate B2B JWT with claims {sub=orgUserId, organizationId, type="b2b"}. 4) Return `OrgLoginResponse` |
| **Database** | `INSERT INTO organizations (...)` + `INSERT INTO organization_users (...)` |
| **Response** | `200 OK { "token": "eyJ...", "organizationId": "uuid", "companyName": "Acme Corp", "userId": "uuid", "role": "COMPANY_ADMIN", ... }` |

---

#### `POST /api/b2b/login`

| Attribute | Detail |
|---|---|
| **Why Exists** | Authenticates an organization user |
| **Service Logic** | 1) `orgUserRepository.findByEmailIgnoreCase(email)`. 2) BCrypt compare. 3) Generate B2B JWT. 4) Update lastLogin timestamp |

---

#### `POST /api/b2b/organizations/:orgId/service-requests`

| Attribute | Detail |
|---|---|
| **Why Exists** | Organization submits a request for FinBridge services |
| **Security** | `B2BAccessGuard.assertOrgAccess(principal, orgId)` — verifies the authenticated org user belongs to this org |
| **Service Logic** | Generate requestId (SR-00001), create ServiceRequest linked to org, save |

---

#### `POST /api/b2b/organizations/:orgId/documents`

| Attribute | Detail |
|---|---|
| **Why Exists** | Uploads KYC documents (PAN, GST cert, bank statement) as base64 data URIs |
| **Request Body** | `{ "documentType": "PAN_CARD", "fileName": "pan.pdf", "content": "data:application/pdf;base64,..." }` |
| **Service Logic** | Create `OrganizationDocument` with base64 content stored in `fileUrl` column. Set status="pending_review" |
| **Performance Note** | Base64 in PostgreSQL is a scaling risk — production should use S3/GCS |

---

#### `POST /api/b2b/payments/:paymentId/pay`

| Attribute | Detail |
|---|---|
| **Why Exists** | Settles a pending B2B payment (mock gateway mode) |
| **Request Body** | `{ "razorpayPaymentId": "pay_xxx" }` (optional — mock mode doesn't require it) |
| **Service Logic** | 1) Check `app.payments.mock-enabled` → if true, allow without real gateway verification. 2) Set status="paid", paidAt=now(), gatewayRef. 3) Save |
| **Config** | `application.yml: app.payments.mock-enabled: true` — MUST be false in production |

---

### 5.7 Other APIs

---

#### `GET /api/dashboard` (DashboardController)

| Attribute | Detail |
|---|---|
| **Why Exists** | Aggregate stats for admin dashboard |
| **Who Calls** | `admin/Dashboard.jsx`, `AnalyticsDashboard.jsx` |
| **Database** | `SELECT COUNT(*) FROM users` + `SELECT COUNT(*) FROM leads WHERE active=true` + `SELECT COUNT(*) FROM leads WHERE status='hot'` + `SELECT COUNT(*) FROM leads WHERE status='won'` + `SELECT COUNT(*) FROM loans` + `SELECT COUNT(*) FROM invoices WHERE active=true` |
| **Response** | `{ totalUsers, totalLeads, hotLeads, wonLeads, totalLoans, totalInvoices, role, department }` |

---

#### `GET /api/notifications` (NotificationController)

| Attribute | Detail |
|---|---|
| **Why Exists** | Lists in-app notifications for the current user |
| **Database** | `SELECT * FROM notifications WHERE user_id = ? AND is_active = true ORDER BY created_at DESC` |

---

#### `GET /api/chat/contacts` (ChatController)

| Attribute | Detail |
|---|---|
| **Why Exists** | Returns chat-eligible contacts (dept admins, consultants in same department, clients) |
| **Service Logic** | Aggregates users by role and department, excludes self |

---

#### `POST /api/chat/messages` (ChatController)

| Attribute | Detail |
|---|---|
| **Why Exists** | Sends an internal chat message |
| **Database** | `INSERT INTO chat_messages (sender_id, recipient_id, text, created_at)` |

---

#### `GET/POST /api/financial-profile` (FinancialProfileController)

| Attribute | Detail |
|---|---|
| **Why Exists** | Client financial data (income, expenses, savings, credit score, risk tolerance) |
| **Special** | Uses `findByUserId()` — 1:1 relationship with User. POST does upsert (create or update). Security: forces `profile.setId(null)` on create to prevent overwriting another user's profile |

---

#### `GET /api/kyc/documents` (KycController)

| Attribute | Detail |
|---|---|
| **Why Exists** | Review queue showing all organization documents pending KYC verification |
| **Security** | `@PreAuthorize(SecurityRoles.STAFF)` |
| **Service Logic** | Returns all `OrganizationDocument` entities with their review status |

---

#### `PATCH /api/kyc/documents/:docId` (KycController)

| Attribute | Detail |
|---|---|
| **Why Exists** | Verify or reject a KYC document. Auto-recomputes org's overall KYC status |
| **Request Body** | `{ "status": "verified", "note": "All clear" }` |
| **Service Logic** | 1) Update doc status. 2) Count all docs for this org. 3) If all required docs verified → `org.setKycVerified(true)` → save org |

---

## TASK 6: EVERY SERVICE METHOD EXPLAINED

---

### 6.1 `AuthService.java`

#### `login(LoginRequest request)`

| Attribute | Detail |
|---|---|
| **Why Written** | Core authentication — validates credentials and issues JWT |
| **When Called** | Every login attempt from any login page |
| **Input** | `LoginRequest { email, password }` |
| **Processing** | 1) Case-insensitive email lookup. 2) BCrypt password comparison. 3) Active check. 4) JWT generation |
| **Output** | `LoginResponse { token, id, name, email, role, department }` |
| **Next Method** | `JwtService.generateToken(user)` |
| **DB** | SELECT on users table |
| **Business Logic** | Generic error messages prevent account enumeration. Deactivated users cannot log in even with correct password |

#### `register(RegisterRequest request)`

| Attribute | Detail |
|---|---|
| **Why Written** | New account creation with duplicate email prevention |
| **When Called** | Self-registration from website, admin creating accounts |
| **Processing** | 1) Duplicate email check. 2) BCrypt hash password. 3) Map DTO→Entity. 4) Save. 5) Auto-login (generate token) |
| **Business Logic** | Defaults role to "client" if not specified. Does NOT verify email on registration (optional feature) |

#### `forgotPassword(String email)`

| Attribute | Detail |
|---|---|
| **Why Written** | Secure password reset initiation |
| **Processing** | 1) Lookup user. 2) Generate purpose-scoped JWT (1h TTL, purpose="reset-password"). 3) Send email async. 4) Always return success (prevent enumeration) |
| **Business Logic** | Purpose token is separate from auth token — has different expiry and contains a `purpose` claim that is validated on use |

---

### 6.2 `LeadService.java`

#### `create(Lead lead)`

| Attribute | Detail |
|---|---|
| **Why Written** | Creates a lead with auto-incrementing human-readable ID |
| **When Called** | Website form submission, manual lead creation by CRM |
| **Processing** | 1) `sequenceGenerator.next(LEAD)` → SELECT nextval('lead_seq') → "LEAD-00001". 2) Set defaults. 3) Save |
| **Business Logic** | Uses Postgres sequences (not count+1) to avoid race conditions under concurrent inserts |

#### `update(UUID id, LeadUpdateRequest request)`

| Attribute | Detail |
|---|---|
| **Why Written** | Partial update — only changes fields present in the request |
| **Processing** | Load lead → conditionally update status/priority/score/department/serviceType/followUpDate → save |
| **Business Logic** | Does not require all fields — true PATCH semantics |

#### `sendToDepartment(UUID id, String department, String notes, String actor)`

| Attribute | Detail |
|---|---|
| **Why Written** | Routes qualified lead to a department for specialist review |
| **Processing** | 1) Set department. 2) Set status="dept_review". 3) Add LeadNote. 4) Save |
| **Business Logic** | This is the handoff from CRM team to department team — key pipeline transition |

#### `sendFeeProposal(UUID id, User admin)`

| Attribute | Detail |
|---|---|
| **Why Written** | Dept admin sends a fee proposal, auto-creating a consultation |
| **Processing** | 1) `lead.setStatus("proposal_sent")`. 2) Create Consultation linked to lead's email. 3) Optionally send notification. 4) Save lead + consultation |
| **Business Logic** | Bridges CRM pipeline to consultation scheduling — the lead is now being actively engaged |

#### `convertToClient(UUID id)`

| Attribute | Detail |
|---|---|
| **Why Written** | The pivotal CRM action — turns a lead into a paying client |
| **Processing** | 1) Check if user already exists by email. 2) If not: create User(role="client"), generate temp password. 3) Link lead→client. 4) `lead.setStatus("won")`. 5) Return ConversionResult |
| **Business Logic** | Handles the edge case where a lead's email already belongs to an existing client (re-engagement). Temp password is shown to admin for manual sharing |
| **Output** | `ConversionResult { isNewClient, tempPassword, client }` |

#### `getFiltered(String department, String status)`

| Attribute | Detail |
|---|---|
| **Why Written** | Multi-criteria lead filtering for different role views |
| **Processing** | Builds dynamic query based on non-null parameters |

---

### 6.3 `LoanCaseService.java`

#### `create(Map body, User user)`

| Attribute | Detail |
|---|---|
| **Why Written** | Initializes a new loan workflow |
| **Processing** | Generate LC-00001, set stage=document_collection, link client/consultant/lead, initialize document checklist with required items (ID Proof, Address Proof, Income Proof, Bank Statements), save |

#### `patch(UUID id, Map body, User user)`

| Attribute | Detail |
|---|---|
| **Why Written** | Generic update covering all loan case stages |
| **Processing** | Reads each possible field from the map, updates if present. Handles: stage changes, document lists (JSONB), eligibility data (creditScore, dti, ltv, eligible), recommendation data, client decision, bank processing data |
| **Business Logic** | Single method handles 8 different stage transitions — keeps API surface small |

#### `disburse(UUID id, Map body, User user)`

| Attribute | Detail |
|---|---|
| **Why Written** | Records loan disbursement and generates EMI schedule |
| **Processing** | 1) Set disbursed amount/date/bank. 2) Calculate monthly EMI. 3) Generate N EmiScheduleItem entities with due dates. 4) Set stage=emi_tracking. 5) Cascade save |
| **Business Logic** | EMI formula: `P × r × (1+r)^n / ((1+r)^n - 1)` where P=principal, r=monthly rate, n=tenure months |

#### `updateDocument(UUID caseId, UUID docId, String status, String note, User user)`

| Attribute | Detail |
|---|---|
| **Why Written** | Verify or reject individual documents in the loan checklist |
| **Processing** | Find doc within case's document list, update status/note, save case |

---

### 6.4 `B2BService.java` (36KB — largest service)

#### `register(OrgRegisterRequest req)`

| Attribute | Detail |
|---|---|
| **Why Written** | Creates Organization + first admin OrganizationUser in one transaction |
| **Processing** | 1) Build Organization entity from request. 2) Save org. 3) Create OrganizationUser (role=COMPANY_ADMIN, BCrypt password). 4) Save user. 5) Generate B2B JWT. 6) Return OrgLoginResponse |

#### `createServiceRequest(UUID orgId, ServiceRequestRequest req)`

| Attribute | Detail |
|---|---|
| **Why Written** | Organization submits a financial service request |
| **Processing** | Generate SR-00001, link to org, set status=pending, copy service details, save |

#### `payPayment(UUID paymentId, Object principal, String gatewayRef)`

| Attribute | Detail |
|---|---|
| **Why Written** | Settles a B2B payment (mock or real) |
| **Processing** | 1) Load payment. 2) Verify principal has access. 3) If mock-enabled → auto-approve. 4) Set status=paid, paidAt=now(), gatewayRef. 5) Save |
| **Business Logic** | In production: should verify Razorpay signature before marking paid |

#### `uploadDocument(UUID orgId, String docType, String fileName, String content, Object principal)`

| Attribute | Detail |
|---|---|
| **Why Written** | KYC document upload (base64 data URI) |
| **Processing** | 1) Check if doc of same type already exists for this org → replace. 2) Create/update OrganizationDocument. 3) Set status=pending_review. 4) Save |

---

### 6.5 `ConsultationService.java`

#### `accept(UUID id, String date, String time, Boolean recording, User user)`

| Why Written | Consultant accepts a consultation request, confirming date/time |
| **Processing** | Set status=accepted, confirmedDate, confirmedTime, recordingEnabled. Create notification for client |

#### `assign(UUID id, UUID consultantId, User admin)`

| Why Written | Dept admin assigns consultant to handle the consultation |
| **Processing** | `consultation.setConsultant(user)` → save → notify consultant |

---

### 6.6 `SequenceGenerator.java`

#### `next(Seq seq)`

| Attribute | Detail |
|---|---|
| **Why Written** | Thread-safe human-readable ID generation using Postgres sequences |
| **Processing** | `em.createNativeQuery("SELECT nextval('lead_seq')").getSingleResult()` → format as "LEAD-00001" |
| **Business Logic** | Replaces the broken `repository.count() + 1` approach which had race conditions under concurrent requests (two requests reading the same count simultaneously → duplicate IDs) |

---

## TASK 7: EVERY ENTITY/TABLE EXPLAINED

---

### 7.1 `users` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | Central identity table — every person who interacts with FinBridge (staff AND clients) |
| **Why `id` (UUID)** | Globally unique, not guessable (security), no sequence contention |
| **Why `email` (UNIQUE)** | Login identifier — must be unique across the system |
| **Why `password` (BCrypt)** | Secure credential storage — BCrypt includes salt automatically |
| **Why `role`** | Determines authorization scope — admin/crm-admin/department-admin/consultant/client |
| **Why `department`** | Links staff to their functional area (loans/insurance/investments/tax/wealth). NULL for admins and clients |
| **Why `is_active`** | Soft delete — deactivated users can't login but their data is preserved for audit trail |
| **Why `is_email_verified`** | Trust level indicator — not currently enforced but prepared for future email verification gates |
| **Which APIs** | ALL auth endpoints, dashboard, consultations, loan cases, proposals, invoices, payments, chat |
| **Which Pages** | UserManagement, ConsultantManagement, all login pages, all dashboards |
| **Relationships** | 1:N to leads (assigned_consultant, crm_owner), consultations (client/consultant), loan_cases, proposals, invoices, payments, notifications, chat_messages, financial_profile (1:1) |
| **CRUD** | C: register, create-consultant, create-admin, convert lead. R: login, /me, list. U: update status, update profile. D: soft delete (is_active=false) |

---

### 7.2 `leads` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | CRM pipeline — tracks every potential customer from first contact to conversion |
| **Why `lead_id` (LEAD-00001)** | Human-readable reference for phone calls, emails — UUIDs are hard to communicate verbally |
| **Why `status`** | Pipeline stage: new→contacted→qualified→dept_review→proposal_sent→won→lost. Drives the CRM workflow and reporting |
| **Why `priority`** | Urgency indicator: cold/warm/hot — helps CRM team prioritize |
| **Why `score` (0-100)** | Lead quality metric — higher score = more likely to convert |
| **Why `department`** | Which department should handle this lead (set during "send to department") |
| **Why `assigned_consultant` FK** | Which consultant is handling this lead after department assignment |
| **Why `converted_client_id` FK** | Links to the User created when lead was converted — enables tracing a client back to their lead |
| **Why `source`** | Attribution — "website_form", "referral", "cold_call" — tracks which channel brings leads |
| **Why `tags` (TEXT[])** | Flexible categorization using PostgreSQL arrays — "high-value", "sme", "repeat" |
| **Which APIs** | `/api/leads/*` — capture, list, update, send-to-dept, send-fee-proposal, convert |
| **Which Pages** | LeadManagement, CRM Pipeline, LeadQueue, LeadReview, Dashboard |
| **Relationships** | N:1 to users (assigned_consultant, assigned_admin, crm_owner, converted_client). 1:N to lead_notes |

---

### 7.3 `organizations` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | B2B company entity — the customer in the B2B portal |
| **Why `gstin/cin/pan`** | Indian regulatory identifiers required for KYC compliance |
| **Why `kyc_verified`** | Boolean flag — set to true when all required KYC documents are verified. Gates certain B2B features |
| **Why `status`** | pending→active→suspended — lifecycle state. New orgs start as "pending" until KYC verified |
| **Why `services` (TEXT[])** | PostgreSQL array of subscribed services — allows org to select multiple services during registration |
| **Which APIs** | `/api/b2b/*` |
| **Which Pages** | All B2B portal pages |
| **Relationships** | 1:N to organization_users, organization_documents, organization_proposals, organization_meetings, organization_payments, service_requests, support_tickets |

---

### 7.4 `organization_users` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | Separate from `users` table — B2B portal has its own user system |
| **Why separate** | B2B users authenticate via B2BAuthContext with separate JWTs. They never overlap with CRM staff/clients. Different roles (COMPANY_ADMIN, FINANCE_MANAGER, DIRECTOR, EMPLOYEE) vs CRM roles |
| **Why `organization_id` FK** | Every org user belongs to exactly one organization — enforced by `B2BAccessGuard` |
| **Relationships** | N:1 to organizations |

---

### 7.5 `loan_cases` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | State machine for the 8-stage loan workflow — the most complex business entity |
| **Why `case_id` (LC-00001)** | Human-readable case reference |
| **Why `stage`** | Workflow state: document_collection→eligibility→recommendation→client_review→bank_processing→disbursement→emi_tracking→closed |
| **Why `credit_score/dti/ltv/eligible`** | Eligibility assessment data — filled during stage 2 |
| **Why `recommended_bank/rate/tenure/emi`** | Consultant's recommendation — filled during stage 3 |
| **Why `sent_to_client/client_decision/client_feedback`** | Client review data — filled during stage 4 |
| **Why `application_ref/bank_status/bank_remarks`** | Bank processing tracking — filled during stage 5 |
| **Why `disbursed_amount/disbursed_date`** | Disbursement record — filled during stage 6 |
| **Why `proposal_id/invoice_id`** | Links to billing entities — created when service is billable |
| **Relationships** | N:1 to users (client, consultant), leads. 1:N to loan_case_documents, emi_schedule_items, loan_case_notes |

---

### 7.6 `dept_cases` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | Generic case table for non-loan departments (tax, investments, insurance, wealth) |
| **Why `data` (JSONB)** | Polymorphic storage — each department stores different data. Tax cases have ITR fields, investment cases have portfolio data, insurance has policy data. JSONB avoids separate tables per department |
| **Why `department`** | Discriminator — determines which JSONB schema applies |
| **Why single table** | Adding a new department doesn't require schema changes — just new JSONB keys |

---

### 7.7 `consultations` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | Tracks consultation/meeting bookings between consultants and clients |
| **Key Columns** | status (pending/accepted/scheduled/completed/cancelled), confirmedDate, confirmedTime, meetingLink, recordingEnabled |
| **Relationships** | N:1 to users (client, consultant) |

---

### 7.8 `proposals` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | Service proposals from consultants to clients |
| **Why `details` (JSONB)** | Flexible proposal content — line items, terms, scope |
| **Why `client_feedback`** | Client's response when approving/rejecting |
| **Relationships** | N:1 to users (client, consultant), leads |

---

### 7.9 `invoices` Table + `invoice_line_items`

| Attribute | Detail |
|---|---|
| **Why Exists** | Billing — tracks what's owed and what's been paid |
| **Why line items** | An invoice can have multiple services — advisory fee + GST + document processing fee |
| **Key Columns** | invoiceNumber, totalAmount, taxAmount, status (draft/sent/paid/overdue), dueDate |
| **Relationships** | N:1 to users (client, consultant), proposals. 1:N to invoice_line_items, payments |

---

### 7.10 `payments` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | Records actual money received against invoices |
| **Key Columns** | amount, paymentMethod, transactionId, status |
| **Relationships** | N:1 to users (client), invoices |

---

### 7.11 `notifications` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | In-app notification system |
| **Why `metadata` (JSONB)** | Flexible context — consultation ID, lead ID, action URL, etc. |
| **Why `is_read`** | Tracks read/unread state per user |

---

### 7.12 `chat_messages` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | Internal messaging between consultants, dept admins, and clients |
| **Relationships** | N:1 to users (sender, recipient) |

---

### 7.13 `financial_profiles` Table

| Attribute | Detail |
|---|---|
| **Why Exists** | Client financial data — income, expenses, savings, credit score, risk tolerance, business details |
| **Why 1:1 with users** | Each client has exactly one financial profile — used for loan eligibility, investment recommendations |
| **Child Table** | `existing_loans` (1:N) — client's current loans at other institutions |

---

## TASK 8: IMPORTANT CODE LINES EXPLAINED

---

### 8.1 Frontend: AuthContext.jsx

#### `const [user, setUser] = useState(null)`

| Aspect | Explanation |
|---|---|
| **Why useState** | React needs to track the current user across re-renders. `useState` creates a reactive variable — when `setUser()` is called, every component consuming `useAuth()` re-renders |
| **Why `null` default** | Before login, there is no user. `null` is a clear "no user" signal. Components check `if (user)` |
| **What React stores** | In the fiber tree's memoizedState linked list, a state node holds `{ memoizedState: null, queue: updateQueue, next: nextHook }` |
| **Re-render trigger** | `setUser(newUser)` enqueues an update → React schedules a re-render → all components calling `useAuth()` receive the new user value |
| **If removed** | No way to track authenticated user → all auth-dependent rendering breaks → protected routes always redirect to login |

#### `const isAuthenticated = !!user`

| Aspect | Explanation |
|---|---|
| **Why `!!`** | Double-negation converts any value to boolean. `!!null = false`, `!!{name:"admin"} = true` |
| **Why derived, not state** | Computing from existing state avoids keeping two sources of truth in sync. If user is set, we're authenticated. Period |
| **If removed** | Need separate `isAuthenticated` state, risk of user being set but isAuthenticated being false (bug) |

#### `sessionStorage.setItem('finbridge_token', token)`

| Aspect | Explanation |
|---|---|
| **Why sessionStorage** | Tab-isolated. Opening a new tab doesn't inherit the session → prevents accidental cross-tab session bleed |
| **Why ALSO localStorage** | Cross-tab persistence. A new tab reads from localStorage → copies to sessionStorage. This enables "remember me" without a toggle |
| **Security tradeoff** | Both are accessible via JavaScript → XSS vulnerability. HttpOnly cookies would be safer but require backend changes |
| **If removed** | Token lost on page refresh → user must re-login on every F5 |

#### `api.get('/auth/me').then(res => {...}).catch(() => clearToken())`

| Aspect | Explanation |
|---|---|
| **Why on mount** | On page load/refresh, the stored token might be expired or invalid. `/me` validates it server-side |
| **Why catch clears token** | If `/me` returns 401, the stored token is no good → clear it, don't pretend we're logged in |
| **If removed** | Stale tokens would persist → user sees dashboard briefly then gets 401s on every API call |

---

### 8.2 Frontend: api.js

#### `const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register', '/leads/capture', ...]`

| Aspect | Explanation |
|---|---|
| **Why exists** | The request interceptor checks this list to decide whether to attach the JWT. Public endpoints must NOT send a token (it might be stale, causing unnecessary 401s) |
| **If removed** | Stale tokens sent on login requests → backend might reject or confuse them |

#### `function normalizeData(data) { ... if (data.content && data.totalElements !== undefined) return normalizeData(data.content) ... }`

| Aspect | Explanation |
|---|---|
| **Why exists** | The frontend was originally built for Node.js/MongoDB which returns bare arrays and `_id`. Spring Boot returns `{ content: [...], totalElements, pageable, ... }` (Page objects) and `id` (not `_id`). This interceptor bridges the gap |
| **What it does** | 1) Detects Spring Page objects → extracts `content` array. 2) Recursively adds `_id = id` on every object. 3) Converts nested objects too |
| **If removed** | Every paginated response would show as empty (frontend reads array, gets object). Every `item._id` access returns undefined |

---

### 8.3 Backend: JwtAuthFilter.java

#### `String header = request.getHeader("Authorization")`

| Aspect | Explanation |
|---|---|
| **Why** | JWT is transmitted via the standard `Authorization: Bearer <token>` HTTP header |
| **If null** | No token → skip validation → SecurityContext stays empty → Spring Security decides based on endpoint config (permitAll vs authenticated) |

#### `if (header != null && header.startsWith("Bearer ")) { token = header.substring(7); }`

| Aspect | Explanation |
|---|---|
| **Why substring(7)** | "Bearer " is 7 characters. We need just the JWT string, not the "Bearer " prefix |
| **Why check startsWith** | Protects against malformed headers (e.g., "Basic ..." for basic auth) |

#### `boolean isB2B = jwtService.isB2BToken(token); if (isB2B) { ... load from org_users ... } else { ... load from users ... }`

| Aspect | Explanation |
|---|---|
| **Why** | Dual authentication system. CRM tokens resolve to `User` entities, B2B tokens resolve to `OrganizationUser` entities. The filter checks a claim in the JWT (`type: "b2b"`) to determine which path |
| **If removed** | B2B users couldn't authenticate — their tokens would try to load from the `users` table and fail |

---

### 8.4 Backend: SecurityConfig.java

#### `.csrf(csrf -> csrf.disable())`

| Aspect | Explanation |
|---|---|
| **Why disabled** | CSRF protection is for cookie-based sessions. FinBridge uses stateless JWT in Authorization headers — CSRF attacks can't forge this header (same-origin policy blocks reading another site's request headers) |
| **If enabled** | Every mutating request (POST/PATCH/DELETE) would need a CSRF token → frontend would need to fetch and include it → unnecessary complexity for JWT-based auth |

#### `.sessionManagement(session -> session.sessionCreationPolicy(STATELESS))`

| Aspect | Explanation |
|---|---|
| **Why STATELESS** | Tells Spring Security to never create or use HttpSession. Each request is authenticated independently via JWT. No server-side session storage needed |
| **If removed** | Spring might create sessions → memory leak under load, breaks horizontal scaling (sessions aren't shared across instances) |

---

### 8.5 Backend: SequenceGenerator.java

#### `em.createNativeQuery("SELECT nextval('" + seq.sequenceName + "')").getSingleResult()`

| Aspect | Explanation |
|---|---|
| **Why native query** | PostgreSQL sequences are not part of JPA standard — must use native SQL |
| **Why sequences** | Atomic operation — even under concurrent requests, each call gets a unique number. The old approach `count() + 1` had a race: two requests both read count=5, both try to create LEAD-006 → unique constraint violation |
| **Why hard-coded enum** | The sequence name comes from `Seq.LEAD.sequenceName` (a compile-time constant), NOT from user input. This prevents SQL injection through the sequence name |

---

### 8.6 Backend: DtoMapper.java

#### `l.getAssignedConsultant() != null ? l.getAssignedConsultant().getId() : null`

| Aspect | Explanation |
|---|---|
| **Why null check** | `assignedConsultant` is a nullable FK — new leads don't have a consultant. Without the check → NullPointerException |
| **Why extract just ID** | The response should contain the consultant's ID, not the entire User entity (which would include password hash, other leads, etc.) |

---

### 8.7 Frontend: AppRoutes.jsx

#### `const isPortalRoute = ['/admin', '/crm-admin', '/department-admin', ...].some(prefix => location.pathname.startsWith(prefix))`

| Aspect | Explanation |
|---|---|
| **Why exists** | Portal pages (dashboards) use their own layouts with Sidebar+Topbar. Public pages use Navbar+Footer. This flag determines which chrome to render |
| **If removed** | Navbar and Footer would appear on dashboard pages, or Sidebar would appear on public pages — broken UX |

#### `<Routes location={location} key={location.pathname}>`

| Aspect | Explanation |
|---|---|
| **Why `key={location.pathname}`** | Forces React to UNMOUNT and REMOUNT the Routes component on every navigation. This is required for Framer Motion's `AnimatePresence` exit animations. Without it, route transitions don't animate |
| **If removed** | Page transitions would be instant (no animation) — functional but less polished |

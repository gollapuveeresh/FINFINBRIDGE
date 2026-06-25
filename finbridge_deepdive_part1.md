# FinBridge Deep-Dive — Part 1: Execution Flow, Pages, Buttons & Components

---

## TASK 1: COMPLETE EXECUTION FLOW

### 1.1 From URL Entry to First Pixel

```
Step 1: User types http://localhost:5173 in browser
    └── Browser sends HTTP GET to Vite dev server (port 5173)

Step 2: Vite returns index.html
    └── Contains <div id="root"></div> and <script type="module" src="/src/main.jsx">

Step 3: Browser loads main.jsx
    └── import { StrictMode } from 'react'
    └── import { createRoot } from 'react-dom/client'
    └── import { BrowserRouter } from 'react-router-dom'
    └── import App from './App.jsx'
    └── import { AuthProvider } from './context/AuthContext'
    └── import { B2BAuthProvider } from './context/B2BAuthContext'
    └── import ErrorBoundary from './components/ErrorBoundary'
    └── import { Toaster } from 'react-hot-toast'

Step 4: createRoot(document.getElementById('root')).render(...)
    └── React creates a fiber tree from the JSX:
        <StrictMode>
          <ErrorBoundary>          ← catches render errors
            <BrowserRouter>       ← creates history context
              <AuthProvider>      ← CRM auth state
                <B2BAuthProvider> ← B2B auth state
                  <App />
                  <Toaster />     ← toast notifications
                </B2BAuthProvider>
              </AuthProvider>
            </BrowserRouter>
          </ErrorBoundary>
        </StrictMode>

Step 5: AuthProvider initializes (AuthContext.jsx)
    └── useState: user=null, isAuthenticated=false, loading=true
    └── useEffect fires (mount):
        ├── Checks: is pathname /b2b? → skip CRM auth check
        ├── getToken() → sessionStorage.getItem('finbridge_token') || localStorage.getItem('finbridge_token')
        ├── If no token → setLoading(false), done
        ├── If token exists:
        │   ├── api.get('/auth/me') → GET http://localhost:5000/api/auth/me
        │   ├── Backend: JwtAuthFilter validates token → UserRepository.findById → returns User
        │   ├── Response: { id, name, email, role, department }
        │   ├── If role === 'client' → clearToken() (CRM context doesn't handle clients)
        │   ├── Else → setUser(userData), setIsAuthenticated(true)
        │   └── checkProfile(userData) → GET /api/financial-profile
        └── Finally: setLoading(false)
    └── While loading=true: renders a spinner ("Securing connection...")

Step 6: B2BAuthProvider initializes (B2BAuthContext.jsx)
    └── Reads sessionStorage.getItem('b2b_company')
    └── If exists → JSON.parse → set company state
    └── If not → company = null

Step 7: App.jsx renders
    └── const location = useLocation() — gets current URL
    └── useEffect: window.scrollTo(0, 0) on every pathname change
    └── Returns: <AppRoutes key={location.pathname} />
    └── The key prop forces a full remount on route change (for AnimatePresence)

Step 8: AppRoutes.jsx evaluates
    └── const location = useLocation()
    └── useEffect: if location.hash → scrollIntoView (anchor links)
    └── const isPortalRoute = checks if path starts with /admin, /consultant, /b2b, etc.
    └── Renders:
        ├── <CustomCursor /> (always)
        ├── {!isPortalRoute && <Navbar />} — only on public pages
        ├── <CookieConsent /> (always)
        ├── {!isPortalRoute && <Chatbot />} — only on public pages
        ├── <AnimatePresence mode="wait">
        │   └── <Routes location={location} key={location.pathname}>
        │       └── Matches "/" → <MainLayout><Home /></MainLayout>
        └── {!isPortalRoute && <Footer />}

Step 9: Home page renders (Home.jsx — 80KB, largest component)
    └── Hero section with animated text
    └── Services overview with cards
    └── AnimatedCounter showing metrics
    └── CaseStudyCards with client success stories
    └── LeadCaptureForm at the bottom
    └── ProprietaryTools section
    └── ThreeBackground (WebGL animated background)
```

### 1.2 Lead Submission: Frontend → Backend → Database → Response → UI Update

```
Step 1: USER ACTION — fills form in LeadCaptureForm.jsx and clicks Submit
    └── onClick triggers onSubmit={handleSubmit}

Step 2: handleSubmit(e) executes
    └── e.preventDefault() — stops page reload
    └── Client-side validation:
        ├── name required
        ├── email required + format check
        ├── phone required
        └── requirement required
    └── If invalid → toast.error("Please fill required fields") → STOP

Step 3: API CALL
    └── api.post('/leads/capture', { name, email, phone, income, requirement, budget })
    └── api.js creates Axios request:
        ├── baseURL: 'http://localhost:5000/api' (from getBaseURL())
        ├── Request interceptor fires:
        │   └── URL matches PUBLIC_ENDPOINTS ('/leads/capture') → NO auth header added
        ├── HTTP POST sent:
        │   Method: POST
        │   URL: http://localhost:5000/api/leads/capture
        │   Headers: { Content-Type: application/json }
        │   Body: { name: "John", email: "john@test.com", phone: "9876543210", ... }

Step 4: SPRING SECURITY FILTER CHAIN
    └── Request hits Tomcat embedded server (port 5000)
    └── RateLimitFilter (optional) — checks IP rate limit
    └── CORS filter — validates Origin header against allowed origins
    └── JwtAuthFilter.doFilterInternal():
        ├── header = request.getHeader("Authorization") → null (no auth header)
        ├── header == null → filterChain.doFilter() → pass through
        └── SecurityContext remains EMPTY (anonymous)
    └── Authorization check: "/api/leads/capture" → .permitAll() → ALLOWED

Step 5: CONTROLLER
    └── LeadController.capture(@Valid @RequestBody LeadRequest request)
    └── @Valid triggers Bean Validation:
        ├── LeadRequest is a record with validation annotations
        ├── @NotBlank on name, email
        └── If validation fails → MethodArgumentNotValidException → GlobalExceptionHandler → 400
    └── log.info("Lead captured from website: {}", request.email())
    └── Lead lead = leadService.create(mapper.toLead(request))

Step 6: DTO MAPPER
    └── DtoMapper.toLead(LeadRequest r):
        ├── new Lead()
        ├── l.setName(r.name())     → "John"
        ├── l.setEmail(r.email())   → "john@test.com"
        ├── l.setPhone(r.phone())   → "9876543210"
        ├── l.setIncome(r.income()) → 1200000
        ├── l.setRequirement(r.requirement()) → "Business Loan"
        ├── l.setBudget(r.budget()) → 5000000
        ├── l.setSource("website_form") — default
        └── Returns Lead entity (id=null, no DB yet)

Step 7: SERVICE
    └── LeadService.create(Lead lead):
        ├── String leadId = sequenceGenerator.next(Seq.LEAD)
        │   └── EntityManager: SELECT nextval('lead_seq') → returns 1
        │   └── Returns "LEAD-00001"
        ├── lead.setLeadId("LEAD-00001")
        ├── lead.setStatus("new")    — default
        ├── lead.setPriority("warm") — default
        ├── lead.setScore(0)         — default
        └── return leadRepository.save(lead)

Step 8: REPOSITORY
    └── LeadRepository.save(lead)
    └── Spring Data JPA delegates to EntityManager.persist()

Step 9: HIBERNATE ORM
    └── Detects entity is NEW (id is null)
    └── Generates UUID for id
    └── Creates SQL:
        INSERT INTO leads (id, lead_id, name, email, phone, income, requirement,
                          budget, source, status, priority, score, department,
                          is_active, created_at, updated_at)
        VALUES ('a1b2c3d4...', 'LEAD-00001', 'John', 'john@test.com', '9876543210',
                1200000, 'Business Loan', 5000000, 'website_form', 'new', 'warm', 0,
                null, true, NOW(), NOW())

Step 10: POSTGRESQL
    └── Executes INSERT
    └── Writes to WAL (Write-Ahead Log)
    └── Commits transaction
    └── Returns saved row with generated id and timestamps

Step 11: RESPONSE CHAIN (reverse path)
    └── Hibernate: fills Lead entity with DB-generated values (id, createdAt, updatedAt)
    └── LeadService: returns Lead entity
    └── LeadController: mapper.toLeadResponse(lead) → creates LeadResponse DTO
        ├── Extracts: id, leadId, name, email, phone, status, priority, score, etc.
        ├── Resolves lazy references: assignedConsultant → null, convertedClient → null
        ├── Maps notes: lead.getNotes() → empty list
        └── Returns LeadResponse record
    └── ResponseEntity.status(HttpStatus.CREATED).body(leadResponse) → HTTP 201

Step 12: HTTP RESPONSE
    └── Status: 201 Created
    └── Body: { "id": "a1b2c3d4...", "leadId": "LEAD-00001", "name": "John",
               "email": "john@test.com", "status": "new", "priority": "warm",
               "score": 0, "createdAt": "2026-06-23T05:00:00Z", ... }

Step 13: AXIOS RESPONSE INTERCEPTOR (api.js)
    └── normalizeData(response.data):
        ├── It's an object (not array, not Page) → recurse through keys
        ├── Adds _id alias: if _id == null && id != null → out._id = out.id
        └── Returns normalized data

Step 14: FRONTEND STATE UPDATE
    └── handleSubmit() receives response:
        ├── setSubmitted(true) or setLoading(false)
        ├── toast.success("Thank you! Our team will contact you shortly.")
        └── Reset form fields

Step 15: UI RE-RENDER
    └── React detects state change → re-renders LeadCaptureForm
    └── Shows success message/animation
    └── Form fields cleared
    └── User sees: "✓ Thank you! Our team will contact you shortly."
```

### 1.3 Login: Complete Round-Trip

```
Step 1: USER → types email + password on AdminLogin.jsx

Step 2: onClick → handleLogin()
    └── e.preventDefault()
    └── setLoading(true)
    └── try { const user = await login(email, password) }

Step 3: AuthContext.login(email, password)
    └── sessionStorage.removeItem('finbridge_token')  ← clear stale
    └── localStorage.removeItem('finbridge_token')    ← clear stale
    └── const res = await api.post('/auth/login', { email, password })

Step 4: Axios request interceptor
    └── URL '/auth/login' matches PUBLIC_ENDPOINTS → skip auth header

Step 5: HTTP POST to http://localhost:5000/api/auth/login
    └── Body: { "email": "admin@finbridge.com", "password": "admin123" }

Step 6: Spring Security → permitAll for /api/auth/login → proceeds

Step 7: AuthController.login(@Valid @RequestBody LoginRequest request)
    └── return ResponseEntity.ok(authService.login(request))

Step 8: AuthService.login(LoginRequest request)
    └── User user = userRepository.findByEmailIgnoreCase("admin@finbridge.com")
    │   └── SQL: SELECT * FROM users WHERE LOWER(email) = LOWER('admin@finbridge.com')
    │   └── Returns: User { id=abc..., name="Super Admin", role="admin", ... }
    └── passwordEncoder.matches("admin123", "$2a$10$...hashed...")
    │   └── BCrypt compares raw password with stored hash → true
    └── user.isActive() → true
    └── JwtService.generateToken(user):
        ├── Jwts.builder()
        ├── .subject(user.getId().toString())  → "abc..."
        ├── .claim("email", "admin@finbridge.com")
        ├── .claim("role", "admin")
        ├── .claim("name", "Super Admin")
        ├── .issuedAt(new Date())
        ├── .expiration(new Date(now + 86400000))  → 24h from now
        ├── .signWith(key())  → HMAC-SHA256 with JWT_SECRET
        └── .compact() → "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIi..."

Step 9: LoginResponse returned
    └── { token: "eyJ...", id: "abc...", name: "Super Admin",
          email: "admin@finbridge.com", role: "admin", department: null }

Step 10: HTTP 200 OK → Axios response interceptor → normalizeData()

Step 11: AuthContext receives response
    └── const user = { id, name, email, role, department }
    └── setToken(token):
        ├── sessionStorage.setItem('finbridge_token', 'eyJ...')
        └── localStorage.setItem('finbridge_token', 'eyJ...')
    └── setUser({ id, name, email, role: "admin", department: null })
    └── setIsAuthenticated(true)
    └── checkProfile(user) → role !== 'client' → setHasFinancialProfile(true)
    └── return user

Step 12: handleLogin() receives user
    └── Navigate based on user.role:
        ├── "admin" → navigate('/admin/dashboard')
        ├── "consultant" → navigate(getDepartmentDashboardPath('consultant', dept))
        ├── "department-admin" → navigate('/department-admin/dashboard')
        └── "crm-admin" → navigate('/crm-admin/dashboard')

Step 13: React Router renders /admin/dashboard
    └── Route: <AdminRoute><AdminDashboard /></AdminRoute>
    └── AdminRoute checks: ProtectedRoute → isAuthenticated=true ✓
    └── RoleBasedRoute → allowedRoles=['admin'], user.role='admin' ✓
    └── AdminLayout renders: Sidebar(role="admin") + Topbar + content area
    └── AdminDashboard.jsx loads: makes API calls to fetch stats
```

---

## TASK 2: EVERY PAGE EXPLAINED

### 2.1 Public Website Pages

#### Home Page (`pages/website/Home/Home.jsx` — 80KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Landing page — first impression. Showcases services, builds trust, captures leads |
| **First Component** | ThreeBackground.jsx (WebGL canvas renders behind everything) |
| **Child Components** | Hero, AnimatedCounter, Services, CaseStudyCard, ProprietaryTools, SectorIntelligence, LeadCaptureForm, Leadership |
| **APIs Called** | None on load. `POST /api/leads/capture` only when form submitted |
| **Data Loaded** | All static — no API calls on mount. Data comes from inline JSX and `data/` imports |
| **User Actions** | Scroll, click nav links, fill lead capture form, click "Submit Inquiry", interact with chatbot |

#### About Page (`pages/website/About/About.jsx`)

| Attribute | Detail |
|---|---|
| **Why Created** | Company information — mission, vision, leadership team, company metrics |
| **First Component** | Page header with breadcrumb |
| **Child Components** | AboutMetrics (animated counters), Leadership (team profiles) |
| **APIs Called** | None |
| **Data Loaded** | Static content |
| **User Actions** | Scroll, navigate to other pages |

#### Contact Page (`pages/website/Contact/Contact.jsx`)

| Attribute | Detail |
|---|---|
| **Why Created** | Contact form for general inquiries (separate from lead capture) |
| **First Component** | Contact form with fields |
| **APIs Called** | `POST /api/leads/capture` (reuses lead capture endpoint) |
| **User Actions** | Fill form, submit inquiry |

#### Service Pages (10 pages: ValuationAdvisory, TransactionServices, RiskCompliance, FinancialTransformation, WealthManagement, CorporateFinance, DigitalFinance, TaxAdvisory, ServicesWeOffer, ThreeWays)

| Attribute | Detail |
|---|---|
| **Why Created** | Each details a specific FinBridge service offering |
| **APIs Called** | None — all static marketing content |
| **User Actions** | Read content, navigate, click CTAs to contact form |

#### Legal Pages (PrivacyPolicy, TermsOfService, RegulatoryDisclosures)

| Attribute | Detail |
|---|---|
| **Why Created** | Legal compliance — GDPR, Indian regulations |
| **APIs Called** | None |

---

### 2.2 Auth Pages

#### AdminLogin (`pages/public/AdminLogin.jsx` — 7.7KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Secure login for Super Admins with role-specific branding |
| **First Component** | Login form with email/password inputs |
| **State** | `email, password, loading, error` (all useState) |
| **APIs Called** | `POST /api/auth/login` via AuthContext.login() |
| **User Actions** | Enter credentials, click "Sign In", click "Forgot Password?" |
| **On Success** | Navigate to `/admin/dashboard` |
| **On Error** | Display error message from backend |

#### CRMAdminLogin (`pages/public/CRMAdminLogin.jsx` — 5.7KB)

| Attribute | Detail |
|---|---|
| **Why Created** | CRM admin login — separate from admin login for distinct branding |
| **APIs Called** | Same `POST /api/auth/login` — backend differentiates by role in response |
| **On Success** | Navigate to `/crm-admin/dashboard` |

#### DepartmentAdminLogin (`pages/public/DepartmentAdminLogin.jsx` — 7.7KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Department admin login |
| **On Success** | Navigate to `/department-admin/dashboard` → then redirect to department-specific dashboard |

#### ConsultantLogin (`pages/public/ConsultantLogin.jsx` — 8.2KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Consultant login portal |
| **On Success** | Navigate to department-specific consultant dashboard |

#### B2B Login (`pages/b2b/Login.jsx` — 3.8KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Organization portal login (separate auth system) |
| **APIs Called** | `POST /api/b2b/login` via B2BAuthContext.login() |
| **On Success** | Store b2b_token + company data in sessionStorage, navigate to `/b2b/dashboard` |

#### B2B Register (`pages/b2b/Register.jsx` — 16.5KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Multi-step organization registration |
| **First Component** | Step indicator (3 steps) |
| **State** | `step, formData (company+contact+business details), loading, errors` |
| **APIs Called** | `POST /api/b2b/register` |
| **User Actions** | Fill 3-step form, navigate steps, submit |

#### ForgotPassword (`pages/public/ForgotPassword.jsx` — 5.8KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Password reset request form |
| **APIs Called** | `POST /api/auth/forgot-password` |
| **Result** | Shows success message (email sent with reset link) |

#### ResetPassword (`pages/public/ResetPassword.jsx` — 8.4KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Password reset form (reached via email link with token) |
| **APIs Called** | `POST /api/auth/reset-password` with token from URL query param |

#### VerifyEmail (`pages/public/VerifyEmail.jsx` — 5.1KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Email verification handler (reached via email link) |
| **APIs Called** | `POST /api/auth/verify-email` with token from URL |

---

### 2.3 Super Admin Pages (13 pages)

#### Admin Dashboard (`pages/admin/Dashboard.jsx` — 65KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Central command center for platform administrators |
| **First Component** | AdminLayout wraps → KPI cards grid at top |
| **Child Components** | KPICard, StatusBadge, DataTable, Recharts (BarChart, PieChart, LineChart) |
| **APIs Called** | `GET /api/dashboard` (stats), `GET /api/leads` (recent leads), `GET /api/leads/stats` (pipeline), `GET /api/auth/users` (user count), `GET /api/invoices/stats` (revenue) |
| **Data Loaded** | Total users, total leads, hot leads, won leads, total loans, total invoices, revenue stats |
| **User Actions** | View KPIs, click into lead details, view charts, navigate to sub-pages |

#### UserManagement (`pages/admin/UserManagement.jsx` — 20KB)

| Attribute | Detail |
|---|---|
| **Why Created** | CRUD for all user accounts |
| **APIs Called** | `GET /api/auth/users` (list), `PATCH /api/auth/users/:id/status` (toggle active) |
| **User Actions** | View users table, filter by role, toggle active/inactive, search |

#### ConsultantManagement (`pages/admin/ConsultantManagement.jsx` — 11KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Create and manage consultant accounts |
| **APIs Called** | `GET /api/auth/consultants`, `POST /api/auth/create-consultant`, `PATCH /api/auth/consultants/:id`, `DELETE /api/auth/consultants/:id` |
| **User Actions** | Add consultant (form), edit details, deactivate, filter by department |

#### DepartmentManagement (`pages/admin/DepartmentManagement.jsx` — 18.5KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Manage department admins and department configuration |
| **APIs Called** | `GET /api/auth/admins`, `POST /api/auth/create-admin`, `PATCH /api/auth/admins/:id` |

#### LeadManagement (`pages/admin/LeadManagement.jsx` — 18.5KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Complete lead pipeline management for admins |
| **APIs Called** | `GET /api/leads`, `PATCH /api/leads/:id`, `POST /api/leads/:id/convert`, `POST /api/leads/:id/send-to-department` |
| **User Actions** | View all leads, filter, qualify, assign, convert, add notes |

#### ContactMessages (`pages/admin/ContactMessages.jsx` — 21.5KB)

| Attribute | Detail |
|---|---|
| **Why Created** | View website contact form submissions (leads) |
| **APIs Called** | `GET /api/leads?source=website_form` |

#### AnalyticsDashboard (`pages/admin/AnalyticsDashboard.jsx` — 12KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Visual analytics with charts |
| **APIs Called** | `GET /api/dashboard`, `GET /api/leads/stats`, `GET /api/invoices/stats` |
| **Child Components** | Recharts (PieChart, BarChart, AreaChart) |

#### RevenueAnalytics (`pages/admin/RevenueAnalytics.jsx` — 9KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Revenue tracking and financial metrics |
| **APIs Called** | `GET /api/invoices/stats`, `GET /api/payments/stats` |

#### SystemSettings (`pages/admin/SystemSettings.jsx` — 19.7KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Platform configuration (company info, branding, notification settings) |
| **APIs Called** | Mostly client-side state (no settings API yet — reads/writes localStorage) |

#### AuditLogs (`pages/admin/AuditLogs.jsx` — 13KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Compliance audit trail |
| **Data Source** | `data/auditLogs.js` (static mock data — no backend endpoint yet) |

#### ProductManagement, CRMPipeline, CRMManagement

| Similar pattern | Admin views for products, CRM pipeline visualization, and CRM admin management |

---

### 2.4 CRM Admin Pages (4 pages)

#### CRM Dashboard (`pages/crm-admin/Dashboard.jsx` — 8.3KB)

| Attribute | Detail |
|---|---|
| **Why Created** | CRM-specific dashboard showing lead metrics |
| **APIs Called** | `GET /api/leads/stats`, `GET /api/leads` |
| **Layout** | CRMAdminLayout (Sidebar with CRM menu items) |

#### CRM Leads (`pages/crm-admin/Leads.jsx` — 15.5KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Primary CRM lead management — the core CRM function |
| **APIs Called** | `GET /api/leads`, `PATCH /api/leads/:id`, `POST /api/leads/:id/note`, `POST /api/leads/:id/send-to-department`, `POST /api/leads/:id/convert` |
| **User Actions** | View leads table, change status, qualify, add notes, send to department, convert to client |

---

### 2.5 Department Admin Pages (11 pages)

#### Dept Admin Dashboard (`pages/department-admin/Dashboard.jsx` — 53.5KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Department-specific dashboard (loans/insurance/investments/tax/wealth) |
| **Props** | `department` (string) — determines which data to show |
| **APIs Called** | `GET /api/leads?department=loans`, `GET /api/consultations`, `GET /api/auth/consultants?department=loans` |
| **Child Components** | KPICard, StatusBadge, DataTable, Recharts charts |

#### LeadQueue, LeadReview, AssignedClients, Assignments, ConsultationQueue, KycReview, CompletedMeetings, Payments, ClientDocuments

| Each follows the pattern | Fetch data for the department → display table/cards → action buttons |

---

### 2.6 Consultant Pages (15 pages)

#### Consultant Dashboard (`pages/consultant/Dashboard.jsx` — 49.5KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Consultant's home base showing assigned clients, upcoming meetings, case stats |
| **Props** | `department` (string) |
| **APIs Called** | `GET /api/auth/consultant/clients`, `GET /api/consultations`, `GET /api/loan-cases`, `GET /api/dept-cases/:dept`, `GET /api/leads`, `GET /api/invoices` |
| **User Actions** | View client list, check upcoming consultations, open workflows |

#### LoanWorkflow (`pages/consultant/LoanWorkflow.jsx` — 56.6KB, largest workflow)

| Attribute | Detail |
|---|---|
| **Why Created** | Full 8-stage loan case management |
| **State** | `cases, selectedCase, stage, documents, eligibility, recommendation, clientDecision, bankProcessing, emiSchedule, notes` |
| **APIs Called** | `GET /api/loan-cases`, `POST /api/loan-cases`, `PATCH /api/loan-cases/:id`, `PATCH /api/loan-cases/:id/document/:docId`, `POST /api/loan-cases/:id/disburse`, `PATCH /api/loan-cases/:id/emi/:emiId`, `POST /api/loan-cases/:id/note` |
| **User Actions** | Create case, upload/verify documents, run eligibility, set recommendation, send to client, submit to bank, record disbursement, track EMI |

#### TaxWorkflow, InvestmentWorkflow, InsuranceWorkflow, WealthWorkflow

| Similar pattern | Each uses `GET/POST/PATCH /api/dept-cases/:department` with department-specific JSONB data |

#### ClientDetail (`pages/consultant/ClientDetail.jsx` — 33.4KB)

| Attribute | Detail |
|---|---|
| **Why Created** | 360° client view — financial profile, loan cases, proposals, documents |
| **APIs Called** | `GET /api/auth/consultant/clients`, `GET /api/loan-cases`, `GET /api/consultations`, `GET /api/proposals`, `GET /api/invoices` |

#### Proposals, Invoices, Payments, Schedule, Reports, Notifications, ClientList

| Standard CRUD pages | Each fetches from its respective API and provides table + action buttons |

---

### 2.7 B2B Portal Pages (11 pages)

#### B2B Dashboard (`pages/b2b/Dashboard.jsx` — 9.3KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Organization overview — service requests, documents, proposals, payments |
| **Layout** | B2BLayout (its own sidebar, topbar, company badge) |
| **APIs Called** | `GET /api/b2b/organizations/:orgId/stats` |
| **Data Loaded** | Total service requests, pending proposals, active services, total paid |

#### ServiceRequests, Documents, Proposals, Meetings, Payments, Team, Support, Settings

| Each B2B page | Uses `b2bApi` (separate Axios instance with b2b_token), calls `/api/b2b/organizations/:orgId/...` |

---

### 2.8 Workflow Pages (7 pages)

#### WorkflowOverview (`pages/workflow/WorkflowOverview.jsx` — 21.5KB)

| Attribute | Detail |
|---|---|
| **Why Created** | Visual 6-step workflow demonstration page |
| **Steps** | Step1_LeadCapture → Step2_CRMQualify → Step3_DeptAssign → Step4_ConsultantAction → Step5_ClientApprove → Step6_Onboarding |
| **User Actions** | Navigate between steps, view workflow visualization |

---

## TASK 3: EVERY BUTTON — CLICK TO DATABASE

### 3.1 Login Button (Admin Portal)

```
Button: "Sign In"
  ↓
File: pages/public/AdminLogin.jsx
  ↓
onClick: handleLogin(e)
  ↓
Function: async handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(email, password);  // from AuthContext
      if (user.role === 'admin') navigate('/admin/dashboard');
    } catch(err) { setError(err.message); }
    setLoading(false);
  }
  ↓
AuthContext.login(email, password):
    sessionStorage.removeItem('finbridge_token');
    localStorage.removeItem('finbridge_token');
    const res = await api.post('/auth/login', { email, password });
  ↓
Axios: POST http://localhost:5000/api/auth/login
    Body: { "email": "admin@finbridge.com", "password": "admin123" }
  ↓
Controller: AuthController.login(@Valid @RequestBody LoginRequest request)
    return ResponseEntity.ok(authService.login(request));
  ↓
Service: AuthService.login(LoginRequest request)
    User user = userRepository.findByEmailIgnoreCase(request.email());
    passwordEncoder.matches(request.password(), user.getPassword());
    JwtService.generateToken(user);
  ↓
Repository: UserRepository.findByEmailIgnoreCase("admin@finbridge.com")
  ↓
Database: SELECT * FROM users WHERE LOWER(email) = LOWER('admin@finbridge.com')
  ↓
Response: { token: "eyJ...", id: "abc", name: "Super Admin", 
            email: "admin@finbridge.com", role: "admin", department: null }
  ↓
Frontend: setToken(token), setUser(user), setIsAuthenticated(true)
  ↓
UI: navigate('/admin/dashboard') → AdminDashboard renders
```

### 3.2 Submit Inquiry (Lead Capture)

```
Button: "Submit Inquiry"
  ↓
File: components/LeadCaptureForm.jsx
  ↓
onClick: handleSubmit(e)
  ↓
Function: validates form → api.post('/leads/capture', formData)
  ↓
Controller: LeadController.capture(@Valid @RequestBody LeadRequest)
  ↓
Service: LeadService.create(lead)
    sequenceGenerator.next(Seq.LEAD) → "LEAD-00001"
    leadRepository.save(lead)
  ↓
Database: INSERT INTO leads (...) VALUES (...)
  ↓
Response: 201 Created { id, leadId: "LEAD-00001", status: "new", ... }
  ↓
UI: toast.success("Thank you!"), form resets
```

### 3.3 Qualify Lead

```
Button: "Qualify" (in CRM lead table)
  ↓
File: pages/crm-admin/Leads.jsx
  ↓
onClick: handleStatusChange(leadId, 'qualified')
  ↓
API: PATCH /api/leads/:id { status: "qualified", score: 75 }
  ↓
Controller: LeadController.update(id, LeadUpdateRequest)
  ↓
Service: LeadService.update(id, request)
    Lead lead = leadRepository.findById(id);
    lead.setStatus("qualified");
    lead.setScore(75);
    leadRepository.save(lead);
  ↓
Database: UPDATE leads SET status='qualified', score=75, updated_at=NOW() WHERE id=?
  ↓
UI: Lead card updates with "Qualified" badge, score shows 75
```

### 3.4 Send to Department

```
Button: "Send to Department"
  ↓
File: pages/crm-admin/Leads.jsx
  ↓
onClick: handleSendToDept(leadId, 'loans', 'High-value loan inquiry')
  ↓
API: POST /api/leads/:id/send-to-department { department: "loans", notes: "..." }
  ↓
Service: LeadService.sendToDepartment(id, "loans", "...", actor)
    lead.setDepartment("loans");
    lead.setStatus("dept_review");
    lead.getNotes().add(new LeadNote("Sent to loans department", actor));
    leadRepository.save(lead);
  ↓
Database: UPDATE leads SET department='loans', status='dept_review' WHERE id=?
          INSERT INTO lead_notes (lead_id, text, added_by) VALUES (?, ?, ?)
  ↓
UI: Lead moves to "Dept Review" column in pipeline
```

### 3.5 Convert to Client

```
Button: "Convert to Client"
  ↓
File: pages/crm-admin/Leads.jsx or admin/LeadManagement.jsx
  ↓
onClick: handleConvert(leadId)
  ↓
API: POST /api/leads/:id/convert
  ↓
Service: LeadService.convertToClient(id)
    Lead lead = leadRepository.findById(id);
    // Check if user with this email already exists
    Optional<User> existing = userRepository.findByEmailIgnoreCase(lead.getEmail());
    if (existing.isPresent()) {
      lead.setConvertedClient(existing.get());
      return ConversionResult(false, null, existing.get());
    }
    // Create new user
    User client = new User();
    client.setName(lead.getName());
    client.setEmail(lead.getEmail());
    client.setRole("client");
    String tempPassword = generate random 8-char password;
    client.setPassword(passwordEncoder.encode(tempPassword));
    userRepository.save(client);
    lead.setStatus("won");
    lead.setConvertedClient(client);
    leadRepository.save(lead);
    return ConversionResult(true, tempPassword, client);
  ↓
Database: INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'client')
          UPDATE leads SET status='won', converted_client_id=? WHERE id=?
  ↓
Response: { isNewClient: true, tempPassword: "xK9mP2qr", client: {...} }
  ↓
UI: Modal shows temporary password for the new client
```

### 3.6 Create Loan Case

```
Button: "Create New Case"
  ↓
File: pages/consultant/LoanWorkflow.jsx
  ↓
onClick: handleCreateCase()
  ↓
API: POST /api/loan-cases { clientId: "...", leadId: "...", loanType: "Business Loan" }
  ↓
Service: LoanCaseService.create(body, user)
    LoanCase lc = new LoanCase();
    lc.setCaseId(sequenceGenerator.next(Seq.LOAN_CASE)); → "LC-00001"
    lc.setClient(userRepository.findById(clientId));
    lc.setConsultant(user);  // authenticated consultant
    lc.setStage("document_collection");
    loanCaseRepository.save(lc);
  ↓
Database: INSERT INTO loan_cases (id, case_id, client_id, consultant_id, stage, ...)
  ↓
UI: New case card appears with stage "Document Collection"
```

### 3.7 Verify KYC Document

```
Button: "Verify" (in KYC review queue)
  ↓
File: pages/department-admin/KycReview.jsx
  ↓
onClick: handleReview(docId, 'verified')
  ↓
API: PATCH /api/kyc/documents/:docId { status: "verified", note: "All clear" }
  ↓
Service: KycService.review(docId, "verified", "All clear", reviewer)
    doc = organizationDocumentRepository.findById(docId);
    doc.setStatus("verified");
    doc.setReviewNote("All clear");
    doc.setReviewedBy(reviewer.getName());
    organizationDocumentRepository.save(doc);
    // Check if all required docs verified → set org.kycVerified = true
  ↓
Database: UPDATE organization_documents SET status='verified', review_note='All clear' WHERE id=?
          UPDATE organizations SET kyc_verified=true WHERE id=?
  ↓
UI: Document badge changes to "✓ Verified", org status updates
```

### 3.8 B2B Submit Service Request

```
Button: "Submit Request"
  ↓
File: pages/b2b/ServiceRequests.jsx
  ↓
onClick: handleSubmit()
  ↓
API: POST /api/b2b/organizations/:orgId/service-requests
     Body: { serviceType: "Tax Advisory", description: "Need GST filing help",
             urgency: "high", estimatedBudget: 50000 }
  ↓
Security: B2BAccessGuard.assertOrgAccess(principal, orgId)
    — verifies the authenticated OrganizationUser belongs to this org
  ↓
Service: B2BService.createServiceRequest(orgId, req)
    ServiceRequest sr = new ServiceRequest();
    sr.setRequestId(sequenceGenerator.next(Seq.SERVICE_REQUEST)); → "SR-00001"
    sr.setOrganization(orgRepository.findById(orgId));
    sr.setServiceType("Tax Advisory");
    serviceRequestRepository.save(sr);
  ↓
Database: INSERT INTO service_requests (...)
  ↓
UI: New request appears in list with "Pending" status
```

### 3.9 Logout

```
Button: Logout icon (bottom of Sidebar)
  ↓
File: components/Sidebar.jsx
  ↓
onClick: handleLogout()
  ↓
Function: const handleLogout = () => {
    logout();         // from AuthContext
    if (onClose) onClose();  // close mobile sidebar
    navigate('/login');
  }
  ↓
AuthContext.logout():
    clearToken():
      sessionStorage.removeItem('finbridge_token');
      localStorage.removeItem('finbridge_token');
    setUser(null);
    setIsAuthenticated(false);
    setHasFinancialProfile(false);
  ↓
Database: NONE (stateless JWT — no server-side session to invalidate)
  ↓
UI: Redirects to /login → Navigate to /b2b/login (redirect rule)
```

### 3.10 Create Proposal

```
Button: "Create Proposal"
  ↓
File: pages/consultant/Proposals.jsx
  ↓
onClick: handleCreate()
  ↓
API: POST /api/proposals
     Body: { department: "loans", title: "Business Loan Advisory",
             summary: "...", leadId: "...", clientId: "...", details: {...} }
  ↓
Service: ProposalService.create(ProposalRequest, user)
    Proposal p = dtoMapper.toProposal(request, user);
    p.setLead(leadRepository.findById(request.leadId()));
    p.setClient(userRepository.findById(request.clientId()));
    proposalRepository.save(p);
  ↓
Database: INSERT INTO proposals (id, department, title, summary, details, status, ...)
  ↓
UI: New proposal card appears with "Draft" status
```

### 3.11 Record Disbursement

```
Button: "Record Disbursement"
  ↓
File: pages/consultant/LoanWorkflow.jsx
  ↓
onClick: handleDisburse(caseId)
  ↓
API: POST /api/loan-cases/:id/disburse
     Body: { disbursedAmount: 5000000, interestRate: 8.5,
             tenureMonths: 240, disbursedDate: "2026-06-23" }
  ↓
Service: LoanCaseService.disburse(id, body, user)
    LoanCase lc = loanCaseRepository.findById(id);
    lc.setDisbursedAmount(5000000);
    lc.setDisbursedDate(LocalDate.parse("2026-06-23"));
    lc.setStage("emi_tracking");
    // Calculate EMI: P * r * (1+r)^n / ((1+r)^n - 1)
    BigDecimal monthlyRate = 8.5 / 12 / 100;
    BigDecimal emi = calculated EMI;
    lc.setMonthlyEmi(emi);
    // Generate EMI schedule
    for (int i = 1; i <= 240; i++) {
      EmiScheduleItem item = new EmiScheduleItem();
      item.setLoanCase(lc);
      item.setEmiNumber(i);
      item.setDueDate(disbursedDate.plusMonths(i));
      item.setAmount(emi);
      item.setStatus("pending");
      lc.getEmiSchedule().add(item);
    }
    loanCaseRepository.save(lc);
  ↓
Database: UPDATE loan_cases SET disbursed_amount=5000000, stage='emi_tracking' ...
          INSERT INTO emi_schedule_items (loan_case_id, emi_number, due_date, amount, status)
          VALUES (...) × 240 rows
  ↓
UI: Loan case moves to "EMI Tracking" stage, EMI schedule table appears
```

---

## TASK 4: EVERY REACT COMPONENT ANALYZED

### 4.1 Core Infrastructure Components

#### `ErrorBoundary.jsx` (2KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | React class component that catches JavaScript errors in child component tree, prevents entire app from crashing |
| **Problem Solved** | Without it, a single render error in any component would show a blank white page |
| **Props** | `children` (the wrapped component tree) |
| **State** | `hasError: boolean`, `error: Error object` |
| **Functions** | `static getDerivedStateFromError(error)` → sets hasError=true; `componentDidCatch(error, info)` → logs to console |
| **If Removed** | Any unhandled render error crashes entire app to blank screen |

#### `ProtectedRoute.jsx` (1.3KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Route guard — ensures user is authenticated before accessing protected pages |
| **Problem Solved** | Prevents unauthenticated users from accessing dashboards by typing URL directly |
| **Props** | `children` (the protected page component) |
| **State** | None (reads from AuthContext) |
| **Functions** | None — pure render logic |
| **Logic** | If !isAuthenticated → detect which portal from pathname → redirect to appropriate login |
| **Parent** | AppRoutes.jsx (wraps route elements) |
| **If Removed** | Any user could access any dashboard without logging in |

#### `RoleBasedRoute.jsx` (1.2KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Authorization guard — ensures user has the correct role AND department |
| **Problem Solved** | Prevents a consultant from accessing admin pages or a loans admin from accessing tax pages |
| **Props** | `children`, `allowedRoles: string[]`, `allowedDepartment: string` (optional) |
| **State** | None (reads from AuthContext) |
| **Logic** | If role not in allowedRoles → redirect to user's own dashboard; If department doesn't match → redirect to user's department dashboard |
| **If Removed** | Any authenticated user could access any role's pages |

#### `B2BProtectedRoute.jsx` (278 bytes)

| Attribute | Detail |
|---|---|
| **Why Exists** | B2B session guard — checks `company` from B2BAuthContext |
| **Props** | `children` |
| **Logic** | If !company → Navigate to /b2b/login |
| **If Removed** | B2B portal pages accessible without B2B login |

#### `FinancialProfileGuard.jsx` (688 bytes)

| Attribute | Detail |
|---|---|
| **Why Exists** | Ensures client has completed financial profile before accessing certain features |
| **Props** | `children` |
| **Logic** | Checks `hasFinancialProfile` from AuthContext → redirect to profile setup if missing |

### 4.2 Layout Components

#### `Sidebar.jsx` (12.5KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Dynamic navigation sidebar for all portal roles |
| **Problem Solved** | Single component serves admin, consultant, department-admin, and client with different menu items |
| **Props** | `role: string`, `isOpen: boolean`, `onClose: function` |
| **State** | None (reads from AuthContext and useLocation) |
| **Functions** | `handleLogout()` — clears auth, navigates to login; `getAvatarLetter()` — first letter of user name |
| **Logic** | Based on `role` prop: selects menuItems array (adminItems/consultantItems/departmentAdminItems/clientItems). For consultant/dept-admin: filters items by user's department |
| **Child Components** | Material Symbols icons, Link components |
| **Parent** | AdminLayout, ConsultantLayout, DepartmentAdminLayout, ClientLayout |

#### `Topbar.jsx` (3.4KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Top header bar with identity, notifications, settings links |
| **Props** | `role: string`, `onMenuClick: function` |
| **State** | None |
| **Functions** | None (pure render) |
| **Logic** | Shows hamburger menu on mobile (calls onMenuClick to open Sidebar), shows user avatar, title varies by role |
| **Parent** | Layout components |

#### `AdminLayout.jsx` (2.2KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Wraps admin pages with sidebar + topbar + footer |
| **Props** | `children` |
| **State** | `isSidebarOpen: boolean` (for mobile toggle) |
| **Renders** | `<Sidebar role="admin" isOpen={...} />` + mobile topbar + `<main>{children}</main>` + footer |
| **Animation** | Framer Motion fade-in on content area |

#### `B2BLayout.jsx` (7.6KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Complete layout for B2B portal (has its OWN sidebar, not the shared one) |
| **Props** | `children` |
| **State** | `isSidebarOpen: boolean` |
| **Logic** | Uses `useB2BAuth()` context (NOT AuthContext). Shows company badge with KYC status. Has its own MENU array (Dashboard, Service Requests, Documents, etc.) |
| **useEffect** | On pathname change: calls `refreshProfile()` to keep company data fresh |

#### `MainLayout.jsx` (388 bytes)

| Attribute | Detail |
|---|---|
| **Why Exists** | Simple wrapper for public website pages |
| **Renders** | Just `<main>{children}</main>` with animation |

### 4.3 Feature Components

#### `LeadCaptureForm.jsx` (20KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Multi-field inquiry form on the public website for capturing potential leads |
| **Problem Solved** | Converts website visitors into CRM leads |
| **Props** | None |
| **State** | `formData: { name, email, phone, income, requirement, budget, serviceType }`, `loading`, `submitted`, `errors` |
| **Functions** | `handleChange(e)` — updates form field; `handleSubmit(e)` — validates and submits |
| **APIs Called** | `POST /api/leads/capture` |
| **Lifecycle** | Renders form → user fills → validates → submits → shows success |
| **If Removed** | No way to capture leads from the website |

#### `Chatbot.jsx` (11.7KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | AI-powered chatbot widget on public website pages |
| **Problem Solved** | Answers visitor questions 24/7 without human intervention |
| **State** | `isOpen`, `messages[]`, `input`, `isTyping` |
| **Logic** | Frontend-only — no backend API. Uses pattern matching on keywords to generate responses |
| **If Removed** | No chatbot on website |

#### `CustomCursor.jsx` (2.5KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Custom animated cursor for premium feel |
| **State** | `cursorX, cursorY` (mouse position) |
| **Lifecycle** | addEventListener('mousemove') on mount, removeEventListener on unmount |

#### `CookieConsent.jsx` (9KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | GDPR cookie consent banner |
| **State** | `isVisible` (checks localStorage for consent) |
| **Logic** | Shows banner on first visit, stores consent in localStorage |

#### `ThreeBackground.jsx` (12KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | WebGL animated background using pure Canvas (no Three.js library — misleading name) |
| **State** | Canvas ref, animation frame ref |
| **Lifecycle** | useEffect: creates canvas, starts animation loop, cleanup on unmount |

#### `Navbar/Navbar.jsx` (in Navbar directory)

| Attribute | Detail |
|---|---|
| **Why Exists** | Main website navigation bar (logo, links, CTA buttons) |
| **State** | `isScrolled` (changes background on scroll), `isMobileMenuOpen` |
| **Logic** | Shows different items based on route. Has "Login" / "Get Started" buttons |

#### `Footer.jsx` (8.5KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Website footer with links, social media, company info |
| **Links** | Privacy Policy, Terms, About, Contact, Services |

#### `WorkflowOverview.jsx` (component, 6.2KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Visual step-by-step workflow visualization component |
| **Props** | None (self-contained) |
| **Renders** | 6 workflow steps as connected cards with icons and descriptions |

#### `CrossSellEngine.jsx` (4.2KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Recommends additional services to clients based on their current services |
| **Logic** | If client has loans → suggest insurance; If has tax → suggest investment |

#### `KPICard.jsx` (1.2KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Reusable metric card for dashboards |
| **Props** | `title, value, icon, color, trend, trendValue` |
| **Renders** | Card with icon, large value number, trend indicator |

#### `StatusBadge.jsx` (1.2KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Color-coded status pill (new=blue, qualified=green, lost=red, etc.) |
| **Props** | `status: string` |
| **Logic** | Maps status string to background/text color classes |

#### `DataTable.jsx` (1.4KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Reusable data table component |
| **Props** | `columns, data, onRowClick` |

#### `Timeline.jsx` (1.8KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Activity timeline for lead/case history |
| **Props** | `events: Array<{title, description, date, type}>` |

#### `PageHeader.jsx` (1.3KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Consistent page header with title and breadcrumbs |
| **Props** | `title, subtitle, breadcrumbs` |

#### `EmptyState.jsx` (856 bytes)

| Attribute | Detail |
|---|---|
| **Why Exists** | "No data" placeholder |
| **Props** | `icon, title, description` |

#### `Loader.jsx` (1KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Spinning loader animation |
| **Renders** | Animated spinner div |

#### `AnimatedCounter.jsx` (1.2KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Counts up to a target number with animation |
| **Props** | `end: number, duration: number, suffix: string` |
| **State** | `count` (current animated value) |
| **Logic** | useEffect with setInterval, increments count until reaching `end` |

#### `AppLayout.jsx` (1.3KB)

| Attribute | Detail |
|---|---|
| **Why Exists** | Generic layout wrapper combining Sidebar + Topbar |
| **Props** | `children, role` |

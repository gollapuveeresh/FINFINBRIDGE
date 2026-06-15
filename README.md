# FinBridge — Full CRM + Lead-to-Client Platform

## ✅ NO npm install needed — node_modules are included

---

## 10-Phase CRM Flow

| Phase | Description |
|-------|-------------|
| 1 | **Lead Generation** — Website form, Google/FB/IG/LinkedIn Ads, Referrals, Walk-ins, Call Center |
| 2 | **CRM Qualification** — Auto lead scoring (Hot/Warm/Cold), notes, follow-up tracking |
| 3 | **Department Assignment** — Loans / Tax / Investment / Insurance / Wealth |
| 4 | **Dept Admin Review** — Priority set, documents verified, consultant assigned |
| 5 | **Consultant Assignment** — Notified via in-app notification |
| 6 | **Consultation** — Discovery, document collection, financial analysis |
| 7 | **Proposal Creation** — Consultant creates structured proposal with details |
| 8 | **Client Approval** — Approve / Request Changes / Reject with feedback |
| 9 | **Client Onboarding** — Lead converted to Client account automatically |
| 10 | **Service Delivery** — Loans, Tax, Investment, Insurance, Wealth workflows |

---

## Portals

| Portal | URL |
|--------|-----|
| Website / Lead Capture | http://localhost:5173/ |
| Client | http://localhost:5173/client/login |
| Consultant | http://localhost:5173/consultant/login |
| Department Admin | http://localhost:5173/department-admin/login |
| Super Admin | http://localhost:5173/admin/login |

---

## New Features Added

### Backend
- `Lead` model — leadId, source, score, priority, status pipeline, notes, department, consultant assignment
- `Proposal` model — department proposals with client approval workflow
- `POST /api/leads/capture` — public lead capture (website form)
- `GET/POST/PATCH /api/leads` — full CRM lead management
- `POST /api/leads/:id/convert` — convert lead to client
- `GET /api/leads/stats` — pipeline analytics
- `GET/POST/PATCH /api/proposals` — proposal lifecycle
- `GET /api/auth/consultants` — consultant listing for assignment
- `GET /api/auth/consultant/clients` — consultant's client list for proposals

### Frontend — Admin
- **Lead Management** `/admin/leads` — create, filter, score, assign, note, convert leads
- **CRM Pipeline** `/admin/crm` — real-time Kanban board from DB with move-stage actions
- **Analytics** `/admin/analytics` — live lead funnel + conversion rate from API

### Frontend — Department Admin
- **Lead Review** `/department-admin/leads` — department-filtered lead queue, assign consultants, update status

### Frontend — Consultant
- **Proposals** `/consultant/proposals` — create & send proposals to clients
- **Dashboard** — shows leads assigned to consultant, link to create proposals

### Frontend — Client
- **Proposals** `/client/proposals` — review proposals, approve / request changes / reject
- **Cross-Sell Engine** — suggests relevant services based on active products

---

## Setup

### Backend
```
cd backend
npm run dev
```
Runs on: http://localhost:5000

### Frontend
```
cd frontend
npm run dev
```
Runs on: http://localhost:5173

---

## Lead Scoring Logic

| Factor | Points |
|--------|--------|
| Income ≥ ₹15L | +35 |
| Income ₹6L–₹15L | +20 |
| Budget ≥ ₹1Cr | +35 |
| Budget ₹30L–₹1Cr | +20 |
| Requirement filled | +15 |
| Phone provided | +10 |
| Email provided | +5 |

- **Hot Lead** = Score ≥ 65
- **Warm Lead** = Score 35–64
- **Cold Lead** = Score < 35

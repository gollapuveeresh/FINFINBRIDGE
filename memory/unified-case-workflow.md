---
name: unified-case-workflow
description: How the recommendation→proposal→approval→invoice→payment→stage-advance flow works across all 5 departments in FinBridge
metadata:
  type: project
---

FinBridge has one unified workflow shared by all 5 departments (loans, tax, investment, insurance, wealth). Loans use `LoanCase` (models/LoanCase.js, routes/loanCaseRoutes.js); the other four use the `DeptCases.js` models (routes/deptCaseRoutes.js). Shared logic lives in `backend/utils/caseWorkflow.js`.

Flow:
1. Consultant advances a case to stage `client_approval` → the route auto-creates a `Proposal` (status `sent`) linked back via `Proposal.caseId` + `Proposal.caseModel`. Client sees it on dashboard + Proposals page.
2. Client approves the proposal (PATCH /proposals/:id, role client) → `proposalController` sets the case `clientDecision = Approved` and calls `ensureInvoiceForCase` (idempotent) to generate the payment-link invoice.
3. Client pays → `paymentController.verifyPayment` → `advanceCaseAfterPayment(invoice)` moves the case from `client_approval` into the first post-approval stage (loans→bank_processing, tax→return_filing, investment→investment_execution, insurance→policy_purchase, wealth→portfolio_creation).
4. Payment gate: route PATCH blocks entering any `POST_APPROVAL_STAGES[dept]` unless the linked invoice is `paid`.

**Why / gotcha:** Demo payments must work without real Razorpay keys. `.env` has placeholder `RAZORPAY_KEY_SECRET=your_razorpay_key_secret` (non-empty), so the old signature check rejected demo payments. `verifyPayment` now treats `!getRazorpay()` as demo mode and skips signature verification.

**Loan-specific gotcha (fixed):** `LoanCase` originally lacked `invoiceId`/`proposalId` fields (DeptCases had them), so Mongoose silently dropped the invoice link → the loan case never knew it was paid and never advanced. Fields were added; `reconcilePaidCase` (called in the loan + dept GET routes) self-heals/advances any case that's paid but stuck, and `advanceCaseAfterPayment` falls back to finding the case via `Proposal.invoiceId`→`caseId`.

**How to apply:** After editing backend, the dev server MUST be restarted for changes to load — a stale process was the cause of "still awaiting payment" reports even though the invoice (with the new "Loan Processing & Advisory Fee") was created. The consultant UI is not live; the consultant must refresh/reopen the workflow page to see the advanced stage.

Dept admin assigning a consultant (consultationController.assignConsultation) also writes `FinancialProfile.assignedConsultant`, which is what the client portal reads to show "Your Assigned Advisor".

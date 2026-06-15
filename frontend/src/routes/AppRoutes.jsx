import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer';
import CustomCursor from '../components/CustomCursor';

import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRoute from '../components/RoleBasedRoute';
import FinancialProfileGuard from '../components/FinancialProfileGuard';
import { useAuth } from '../context/AuthContext';
import { getDepartmentDashboardPath, getUserDepartment } from '../utils/departmentAccess';

import Home from '../pages/website/Home/Home';
import About from '../pages/website/About/About';
import Contact from '../pages/website/Contact/Contact';
import ValuationAdvisory from '../pages/website/Services/ValuationAdvisory';
import TransactionServices from '../pages/website/Services/TransactionServices';
import RiskCompliance from '../pages/website/Services/RiskCompliance';
import FinancialTransformation from '../pages/website/Services/FinancialTransformation';
import WealthManagement from '../pages/website/Services/WealthManagement';
import CorporateFinance from '../pages/website/Services/CorporateFinance';
import MarketIntelligence from '../pages/website/Industries/MarketIntelligence';
import DigitalFinance from '../pages/website/Services/DigitalFinance';

import ClientLogin from '../pages/public/ClientLogin';
import AdminLogin from '../pages/public/AdminLogin';
import DepartmentAdminLogin from '../pages/public/DepartmentAdminLogin';
import DepartmentConsultantLogin from '../pages/public/DepartmentConsultantLogin';
import CRMAdminLogin from '../pages/public/CRMAdminLogin';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import VerifyEmail from '../pages/public/VerifyEmail';
import OnboardingAssessment from '../pages/public/OnboardingAssessment';
import NotFound from '../pages/public/NotFound';

import ClientDashboard from '../pages/client/Dashboard';
import FinancialHealthScore from '../pages/client/HealthScore';
import FinancialProfile from '../pages/client/FinancialProfile';
import LoanManagement from '../pages/client/Loans';
import LoanApplicationDetail from '../pages/client/LoanDetail';
import LoanRecommendations from '../pages/client/LoanRecommendations';
import TaxPlanning from '../pages/client/TaxPlanning';
import TaxSummary from '../pages/client/TaxSummary';
import InvestmentAdvisory from '../pages/client/Investments';
import InvestmentDetail from '../pages/client/InvestmentDetail';
import InvestmentRecommendations from '../pages/client/InvestmentRecommendations';
import Consultations from '../pages/client/Consultations';
import ConsultationDetail from '../pages/client/ConsultationDetail';
import FinancialReports from '../pages/client/Reports';
import ReportDetail from '../pages/client/ReportDetail';
import BillingSubscription from '../pages/client/Billing';
import Notifications from '../pages/client/Notifications';
import ProfileAccountSettings from '../pages/client/Settings';
import HelpSupport from '../pages/client/Help';
import ClientContact from '../pages/client/Contact';
import ClientProposals from '../pages/client/Proposals';
import ClientPayments from '../pages/client/Payments';

import ConsultantDashboard from '../pages/consultant/Dashboard';
import MyClients from '../pages/consultant/ClientList';
import ClientDetail from '../pages/consultant/ClientDetail';
import ConsultantReports from '../pages/consultant/Reports';
import ConsultantInvoices from '../pages/consultant/Invoices';
import ConsultantSchedule from '../pages/consultant/Schedule';
import ConsultantNotifications from '../pages/consultant/Notifications';
import LoanWorkflow from '../pages/consultant/LoanWorkflow';
import TaxWorkflow from '../pages/consultant/TaxWorkflow';
import InvestmentWorkflow from '../pages/consultant/InvestmentWorkflow';
import InsuranceWorkflow from '../pages/consultant/InsuranceWorkflow';
import WealthWorkflow from '../pages/consultant/WealthWorkflow';
import ConsultantProposals from '../pages/consultant/Proposals';

import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/UserManagement';
import ConsultantManagement from '../pages/admin/ConsultantManagement';
import ProductManagement from '../pages/admin/ProductManagement';
import CRMPipeline from '../pages/admin/CRMPipeline';
import ContactMessages from '../pages/admin/ContactMessages';
import AnalyticsDashboard from '../pages/admin/AnalyticsDashboard';
import SystemSettings from '../pages/admin/SystemSettings';
import AuditLogs from '../pages/admin/AuditLogs';
import LeadManagement from '../pages/admin/LeadManagement';
import CRMManagement from '../pages/admin/CRMManagement';
import DepartmentManagement from '../pages/admin/DepartmentManagement';
import RevenueAnalytics from '../pages/admin/RevenueAnalytics';

import DepartmentAdminDashboard from '../pages/department-admin/Dashboard';
import DepartmentAdminClients from '../pages/department-admin/Clients';
import DepartmentLeadReview from '../pages/department-admin/LeadReview';
import DeptLeadQueue from '../pages/department-admin/LeadQueue';
import DeptConsultationQueue from '../pages/department-admin/ConsultationQueue';
import DeptAssignments from '../pages/department-admin/Assignments';
import DeptAdminClientDocuments from '../pages/department-admin/ClientDocuments';

import CRMDashboard from '../pages/crm-admin/Dashboard';
import CRMLeads from '../pages/crm-admin/Leads';

// Workflow pages
import WorkflowOverview from '../pages/workflow/WorkflowOverview';
import Step1_LeadCapture from '../pages/workflow/Step1_LeadCapture';
import Step2_CRMQualify from '../pages/workflow/Step2_CRMQualify';
import Step3_DeptAssign from '../pages/workflow/Step3_DeptAssign';
import Step4_ConsultantAction from '../pages/workflow/Step4_ConsultantAction';
import Step5_ClientApprove from '../pages/workflow/Step5_ClientApprove';
import Step6_Onboarding from '../pages/workflow/Step6_Onboarding';

function ClientRoute({ children }) {
  return (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['client']}>
        <FinancialProfileGuard>{children}</FinancialProfileGuard>
      </RoleBasedRoute>
    </ProtectedRoute>
  );
}

function ClientRouteNoGuard({ children }) {
  return (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['client']}>{children}</RoleBasedRoute>
    </ProtectedRoute>
  );
}

function ConsultantRoute({ children }) {
  return (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['consultant']}>{children}</RoleBasedRoute>
    </ProtectedRoute>
  );
}

function DepartmentConsultantRoute({ children, department }) {
  return (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['consultant']} allowedDepartment={department}>{children}</RoleBasedRoute>
    </ProtectedRoute>
  );
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['admin']}>{children}</RoleBasedRoute>
    </ProtectedRoute>
  );
}

function CRMAdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['crm-admin']}>{children}</RoleBasedRoute>
    </ProtectedRoute>
  );
}

function DepartmentAdminRoute({ children, department }) {
  return (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['department-admin']} allowedDepartment={department}>{children}</RoleBasedRoute>
    </ProtectedRoute>
  );
}

function DepartmentDashboardRedirect({ role }) {
  const { user } = useAuth();
  return <Navigate to={getDepartmentDashboardPath(role, getUserDepartment(user))} replace />;
}

export default function AppRoutes() {
  const location = useLocation();
  const isPortalRoute =
    location.pathname.startsWith('/client') ||
    location.pathname.startsWith('/consultant') ||
    location.pathname.startsWith('/department-consultant') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/department-admin') ||
    location.pathname.startsWith('/crm-admin') ||
    ['/login', '/forgot-password', '/reset-password', '/verify-email', '/onboarding'].includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-[#0A192F] text-white overflow-x-hidden">
      <CustomCursor />
      {!isPortalRoute && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Website */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          <Route path="/valuation-advisory" element={<MainLayout><ValuationAdvisory /></MainLayout>} />
          <Route path="/transaction-services" element={<MainLayout><TransactionServices /></MainLayout>} />
          <Route path="/risk-compliance" element={<MainLayout><RiskCompliance /></MainLayout>} />
          <Route path="/financial-transformation" element={<MainLayout><FinancialTransformation /></MainLayout>} />
          <Route path="/wealth-management" element={<MainLayout><WealthManagement /></MainLayout>} />
          <Route path="/corporate-finance" element={<MainLayout><CorporateFinance /></MainLayout>} />
          <Route path="/market-intelligence" element={<MainLayout><MarketIntelligence /></MainLayout>} />
          <Route path="/digital-finance" element={<MainLayout><DigitalFinance /></MainLayout>} />

          {/* Auth */}
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/department-admin/login" element={<DepartmentAdminLogin />} />
          <Route path="/department-consultant/login" element={<DepartmentConsultantLogin />} />
          <Route path="/consultant/login" element={<DepartmentConsultantLogin />} />
          <Route path="/crm-admin/login" element={<CRMAdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding" element={<OnboardingAssessment />} />

          {/* Client */}
          <Route path="/client/dashboard" element={<ClientRouteNoGuard><ClientDashboard /></ClientRouteNoGuard>} />
          <Route path="/client/health-score" element={<ClientRoute><FinancialHealthScore /></ClientRoute>} />
          <Route path="/client/financial-profile" element={<ClientRouteNoGuard><FinancialProfile /></ClientRouteNoGuard>} />
          <Route path="/client/loans" element={<ClientRoute><LoanManagement /></ClientRoute>} />
          <Route path="/client/loans/:id" element={<ClientRoute><LoanApplicationDetail /></ClientRoute>} />
          <Route path="/client/loans/recommendations" element={<ClientRoute><LoanRecommendations /></ClientRoute>} />
          <Route path="/client/tax-planning" element={<ClientRoute><TaxPlanning /></ClientRoute>} />
          <Route path="/client/tax-summary" element={<ClientRoute><TaxSummary /></ClientRoute>} />
          <Route path="/client/investments" element={<ClientRoute><InvestmentAdvisory /></ClientRoute>} />
          <Route path="/client/investments/:id" element={<ClientRoute><InvestmentDetail /></ClientRoute>} />
          <Route path="/client/investment-recommendations" element={<ClientRoute><InvestmentRecommendations /></ClientRoute>} />
          <Route path="/client/proposals" element={<ClientRoute><ClientProposals /></ClientRoute>} />
          <Route path="/client/payments" element={<ClientRoute><ClientPayments /></ClientRoute>} />
          <Route path="/client/consultations" element={<ClientRoute><Consultations /></ClientRoute>} />
          <Route path="/client/consultations/:id" element={<ClientRoute><ConsultationDetail /></ClientRoute>} />
          <Route path="/client/reports" element={<ClientRoute><FinancialReports /></ClientRoute>} />
          <Route path="/client/reports/:id" element={<ClientRoute><ReportDetail /></ClientRoute>} />
          <Route path="/client/billing" element={<ClientRoute><BillingSubscription /></ClientRoute>} />
          <Route path="/client/notifications" element={<ClientRoute><Notifications /></ClientRoute>} />
          <Route path="/client/settings" element={<ClientRoute><ProfileAccountSettings /></ClientRoute>} />
          <Route path="/client/help" element={<ClientRoute><HelpSupport /></ClientRoute>} />
          <Route path="/client/contact" element={<ClientRoute><ClientContact /></ClientRoute>} />

          {/* Consultant */}
          <Route path="/consultant/dashboard" element={<ConsultantRoute><DepartmentDashboardRedirect role="consultant" /></ConsultantRoute>} />
          <Route path="/department-consultant/loans/dashboard" element={<DepartmentConsultantRoute department="loans"><ConsultantDashboard department="loans" /></DepartmentConsultantRoute>} />
          <Route path="/department-consultant/insurance/dashboard" element={<DepartmentConsultantRoute department="insurance"><ConsultantDashboard department="insurance" /></DepartmentConsultantRoute>} />
          <Route path="/department-consultant/investments/dashboard" element={<DepartmentConsultantRoute department="investments"><ConsultantDashboard department="investments" /></DepartmentConsultantRoute>} />
          <Route path="/department-consultant/tax/dashboard" element={<DepartmentConsultantRoute department="tax"><ConsultantDashboard department="tax" /></DepartmentConsultantRoute>} />
          <Route path="/department-consultant/wealth/dashboard" element={<DepartmentConsultantRoute department="wealth"><ConsultantDashboard department="wealth" /></DepartmentConsultantRoute>} />
          <Route path="/consultant/clients" element={<ConsultantRoute><MyClients /></ConsultantRoute>} />
          <Route path="/consultant/clients/:id" element={<ConsultantRoute><ClientDetail /></ConsultantRoute>} />
          <Route path="/consultant/schedule" element={<ConsultantRoute><ConsultantSchedule /></ConsultantRoute>} />
          <Route path="/consultant/notifications" element={<ConsultantRoute><ConsultantNotifications /></ConsultantRoute>} />
          <Route path="/consultant/reports" element={<ConsultantRoute><ConsultantReports /></ConsultantRoute>} />
          <Route path="/consultant/invoices" element={<ConsultantRoute><ConsultantInvoices /></ConsultantRoute>} />
          <Route path="/consultant/loan-workflow" element={<ConsultantRoute><LoanWorkflow /></ConsultantRoute>} />
          <Route path="/consultant/tax-workflow" element={<ConsultantRoute><TaxWorkflow /></ConsultantRoute>} />
          <Route path="/consultant/investment-workflow" element={<ConsultantRoute><InvestmentWorkflow /></ConsultantRoute>} />
          <Route path="/consultant/insurance-workflow" element={<ConsultantRoute><InsuranceWorkflow /></ConsultantRoute>} />
          <Route path="/consultant/wealth-workflow" element={<ConsultantRoute><WealthWorkflow /></ConsultantRoute>} />
          <Route path="/consultant/proposals" element={<ConsultantRoute><ConsultantProposals /></ConsultantRoute>} />

          {/* Super Admin */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/consultants" element={<AdminRoute><ConsultantManagement /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><ProductManagement /></AdminRoute>} />
          <Route path="/admin/crm" element={<AdminRoute><CRMPipeline /></AdminRoute>} />
          <Route path="/admin/leads" element={<AdminRoute><LeadManagement /></AdminRoute>} />
          <Route path="/admin/crm-management" element={<AdminRoute><CRMManagement /></AdminRoute>} />
          <Route path="/admin/departments" element={<AdminRoute><DepartmentManagement /></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute><ContactMessages /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AnalyticsDashboard /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><RevenueAnalytics /></AdminRoute>} />

          {/* CRM Admin */}
          <Route path="/crm-admin/dashboard" element={<CRMAdminRoute><CRMDashboard /></CRMAdminRoute>} />
          <Route path="/crm-admin/leads" element={<CRMAdminRoute><CRMLeads /></CRMAdminRoute>} />
          <Route path="/crm-admin/pipeline" element={<CRMAdminRoute><CRMLeads /></CRMAdminRoute>} />
          <Route path="/crm-admin/analytics" element={<CRMAdminRoute><CRMDashboard /></CRMAdminRoute>} />

          {/* Department Admin */}
          <Route path="/department-admin/dashboard" element={<DepartmentAdminRoute><DepartmentDashboardRedirect role="department-admin" /></DepartmentAdminRoute>} />
          <Route path="/department-admin/loans/dashboard" element={<DepartmentAdminRoute department="loans"><DepartmentAdminDashboard department="loans" /></DepartmentAdminRoute>} />
          <Route path="/department-admin/insurance/dashboard" element={<DepartmentAdminRoute department="insurance"><DepartmentAdminDashboard department="insurance" /></DepartmentAdminRoute>} />
          <Route path="/department-admin/investments/dashboard" element={<DepartmentAdminRoute department="investments"><DepartmentAdminDashboard department="investments" /></DepartmentAdminRoute>} />
          <Route path="/department-admin/tax/dashboard" element={<DepartmentAdminRoute department="tax"><DepartmentAdminDashboard department="tax" /></DepartmentAdminRoute>} />
          <Route path="/department-admin/wealth/dashboard" element={<DepartmentAdminRoute department="wealth"><DepartmentAdminDashboard department="wealth" /></DepartmentAdminRoute>} />
          <Route path="/department-admin/clients" element={<DepartmentAdminRoute><DepartmentAdminClients /></DepartmentAdminRoute>} />
          <Route path="/department-admin/leads" element={<DepartmentAdminRoute><DepartmentLeadReview /></DepartmentAdminRoute>} />
          <Route path="/department-admin/lead-queue" element={<DepartmentAdminRoute><DeptLeadQueue /></DepartmentAdminRoute>} />
          <Route path="/department-admin/consultations" element={<DepartmentAdminRoute><DeptConsultationQueue /></DepartmentAdminRoute>} />
          <Route path="/department-admin/assignments" element={<DepartmentAdminRoute><DeptAssignments /></DepartmentAdminRoute>} />
          <Route path="/department-admin/documents" element={<DepartmentAdminRoute><DeptAdminClientDocuments /></DepartmentAdminRoute>} />

          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/client/dashboard" replace />} />
          <Route path="/loans" element={<Navigate to="/client/loans" replace />} />
          <Route path="/loan-detail" element={<Navigate to="/client/loans/LN-20241001" replace />} />
          <Route path="/tax-planning" element={<Navigate to="/client/tax-planning" replace />} />
          <Route path="/tax-summary" element={<Navigate to="/client/tax-summary" replace />} />
          <Route path="/investment-advisory" element={<Navigate to="/client/investments" replace />} />
          <Route path="/investment-recommendations" element={<Navigate to="/client/investment-recommendations" replace />} />
          <Route path="/consultations" element={<Navigate to="/client/consultations" replace />} />
          <Route path="/consultation-detail" element={<Navigate to="/client/consultations/mtg-old-01" replace />} />
          <Route path="/reports" element={<Navigate to="/client/reports" replace />} />
          <Route path="/report-detail" element={<Navigate to="/client/reports/REP-2026-Q1" replace />} />
          <Route path="/clients" element={<Navigate to="/consultant/clients" replace />} />
          <Route path="/billing" element={<Navigate to="/client/billing" replace />} />
          <Route path="/notifications" element={<Navigate to="/client/notifications" replace />} />
          <Route path="/settings" element={<Navigate to="/client/settings" replace />} />
          <Route path="/help" element={<Navigate to="/client/help" replace />} />
          <Route path="/health-score" element={<Navigate to="/client/health-score" replace />} />
          <Route path="/loans/recommendations" element={<Navigate to="/client/loans/recommendations" replace />} />
          <Route path="/financial-profile" element={<Navigate to="/client/financial-profile" replace />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/consultant" element={<DepartmentConsultantLogin />} />
          <Route path="/department-consultant" element={<DepartmentConsultantLogin />} />
          <Route path="/department-admin" element={<DepartmentAdminLogin />} />
          <Route path="/crm-admin" element={<CRMAdminLogin />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/crm" element={<Navigate to="/admin/crm" replace />} />
          {/* ── Workflow ── */}
          <Route path="/workflow" element={<WorkflowOverview />} />
          <Route path="/workflow/lead-capture" element={<Step1_LeadCapture />} />
          <Route path="/workflow/crm-qualify" element={<ProtectedRoute><Step2_CRMQualify /></ProtectedRoute>} />
          <Route path="/workflow/dept-assign" element={<ProtectedRoute><Step3_DeptAssign /></ProtectedRoute>} />
          <Route path="/workflow/consultant-action" element={<ProtectedRoute><Step4_ConsultantAction /></ProtectedRoute>} />
          <Route path="/workflow/client-approve" element={<ProtectedRoute><Step5_ClientApprove /></ProtectedRoute>} />
          <Route path="/workflow/onboarding" element={<ProtectedRoute><Step6_Onboarding /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {!isPortalRoute && <Footer />}
    </div>
  );
}

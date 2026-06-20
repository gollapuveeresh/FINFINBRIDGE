import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer';
import CustomCursor from '../components/CustomCursor';

import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRoute from '../components/RoleBasedRoute';
import { useAuth } from '../context/AuthContext';
import { getDepartmentDashboardPath, getUserDepartment } from '../utils/departmentAccess';

// Website pages
import Home from '../pages/website/Home/Home';
import About from '../pages/website/About/About';
import PrivacyPolicy from '../pages/website/Legal/PrivacyPolicy';
import TermsOfService from '../pages/website/Legal/TermsOfService';
import RegulatoryDisclosures from '../pages/website/Legal/RegulatoryDisclosures';
import CookieConsent from '../components/CookieConsent';
import Contact from '../pages/website/Contact/Contact';
import ValuationAdvisory from '../pages/website/Services/ValuationAdvisory';
import TransactionServices from '../pages/website/Services/TransactionServices';
import RiskCompliance from '../pages/website/Services/RiskCompliance';
import FinancialTransformation from '../pages/website/Services/FinancialTransformation';
import WealthManagement from '../pages/website/Services/WealthManagement';
import CorporateFinance from '../pages/website/Services/CorporateFinance';
import MarketIntelligence from '../pages/website/Industries/MarketIntelligence';
import DigitalFinance from '../pages/website/Services/DigitalFinance';
import TaxAdvisory from '../pages/website/Services/TaxAdvisory';
import DynamicDetail from '../pages/website/Services/DynamicDetail';
import ServicesWeOffer from '../pages/website/Services/ServicesWeOffer';
import ThreeWays from '../pages/website/Services/ThreeWays';
import LandingPage from '../pages/public/LandingPage';

// Auth pages
import B2BLogin from '../pages/b2b/Login';
import B2BRegister from '../pages/b2b/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import VerifyEmail from '../pages/public/VerifyEmail';
import NotFound from '../pages/public/NotFound';

// B2B (Client) Portal
import B2BProtectedRoute from '../components/B2BProtectedRoute';
import B2BDashboard from '../pages/b2b/Dashboard';
import B2BServiceRequests from '../pages/b2b/ServiceRequests';
import B2BDocuments from '../pages/b2b/Documents';
import B2BProposals from '../pages/b2b/Proposals';
import B2BMeetings from '../pages/b2b/Meetings';
import B2BPayments from '../pages/b2b/Payments';
import B2BTeam from '../pages/b2b/Team';
import B2BSupport from '../pages/b2b/Support';
import B2BSettings from '../pages/b2b/Settings';

// CRM Admin
import CRMAdminLogin from '../pages/public/CRMAdminLogin';
import CRMDashboard from '../pages/crm-admin/Dashboard';
import CRMLeads from '../pages/crm-admin/Leads';

// Internal Admin
import AdminLogin from '../pages/public/AdminLogin';
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

// Department Admin
import DepartmentAdminLogin from '../pages/public/DepartmentAdminLogin';
import DepartmentAdminDashboard from '../pages/department-admin/Dashboard';
import DepartmentAdminClients from '../pages/department-admin/Clients';
import DepartmentLeadReview from '../pages/department-admin/LeadReview';
import DeptLeadQueue from '../pages/department-admin/LeadQueue';
import DeptConsultationQueue from '../pages/department-admin/ConsultationQueue';
import DeptAssignments from '../pages/department-admin/Assignments';
import DeptAdminClientDocuments from '../pages/department-admin/ClientDocuments';

// Consultants
import ConsultantLogin from '../pages/public/ConsultantLogin';
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

// Workflow pages
import WorkflowOverview from '../pages/workflow/WorkflowOverview';
import Step1_LeadCapture from '../pages/workflow/Step1_LeadCapture';
import Step2_CRMQualify from '../pages/workflow/Step2_CRMQualify';
import Step3_DeptAssign from '../pages/workflow/Step3_DeptAssign';
import Step4_ConsultantAction from '../pages/workflow/Step4_ConsultantAction';
import Step5_ClientApprove from '../pages/workflow/Step5_ClientApprove';
import Step6_Onboarding from '../pages/workflow/Step6_Onboarding';

// Route wrappers
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

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  const isPortalRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/department-admin') ||
    location.pathname.startsWith('/department-consultant') ||
    location.pathname.startsWith('/consultant') ||
    location.pathname.startsWith('/crm-admin') ||
    location.pathname.startsWith('/b2b') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/verify-email') ||
    location.pathname.startsWith('/onboarding');

  return (
    <div className="relative min-h-screen bg-[#0A192F] text-white overflow-x-hidden">
      <CustomCursor />
      {!isPortalRoute && <Navbar />}
      <CookieConsent />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* ============================================ */}
          {/* PUBLIC WEBSITE                                */}
          {/* ============================================ */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/services" element={<MainLayout><ServicesWeOffer /></MainLayout>} />
          <Route path="/how-it-works" element={<MainLayout><ThreeWays /></MainLayout>} />
          <Route path="/pricing" element={<MainLayout><LandingPage /></MainLayout>} />
          <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
          <Route path="/terms-of-service" element={<MainLayout><TermsOfService /></MainLayout>} />
          <Route path="/regulatory-disclosures" element={<MainLayout><RegulatoryDisclosures /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          <Route path="/valuation-advisory" element={<MainLayout><ValuationAdvisory /></MainLayout>} />
          <Route path="/transaction-services" element={<MainLayout><TransactionServices /></MainLayout>} />
          <Route path="/risk-compliance" element={<MainLayout><RiskCompliance /></MainLayout>} />
          <Route path="/financial-transformation" element={<MainLayout><FinancialTransformation /></MainLayout>} />
          <Route path="/wealth-management" element={<MainLayout><WealthManagement /></MainLayout>} />
          <Route path="/corporate-finance" element={<MainLayout><CorporateFinance /></MainLayout>} />
          <Route path="/market-intelligence" element={<MainLayout><MarketIntelligence /></MainLayout>} />
          <Route path="/digital-finance" element={<MainLayout><DigitalFinance /></MainLayout>} />
          <Route path="/tax-advisory" element={<MainLayout><TaxAdvisory /></MainLayout>} />

          {/* Dynamic Category Detail Views */}
          {[
            "mission-vision", "leadership-team", "why-finbridge",
            "industry-technology", "industry-healthcare", "industry-manufacturing",
            "industry-retail", "industry-education", "industry-financial-services",
            "network-partners", "network-ecosystem", "network-investors",
            "financial-planning", "tax-planning", "tax-optimization",
            "compliance-management", "tax-reporting", "portfolio-analysis",
            "wealth-planning", "investment-strategy", "risk-analysis",
            "investor-connect", "funding-assistance", "growth-capital",
            "business-planning", "market-insights", "economic-outlook",
            "financial-trends", "industry-reports", "business-guides",
            "tax-strategies", "investment-resources", "financial-planning-guide",
            "startup-success-stories", "funding-case-studies", "client-transformations",
            "business-growth-stories", "ai-in-finance", "fintech-trends",
            "future-of-finance", "digital-transformation-guide", "success-stories",
            "technova-solutions", "medicore-health"
          ].map(slug => (
            <Route key={slug} path={`/${slug}`} element={<MainLayout><DynamicDetail /></MainLayout>} />
          ))}

          {/* ============================================ */}
          {/* AUTH                                          */}
          {/* ============================================ */}

          {/* B2B / Client Auth */}
          <Route path="/login" element={<Navigate to="/b2b/login" replace />} />
          <Route path="/b2b/login" element={<B2BLogin />} />
          <Route path="/b2b/register" element={<B2BRegister />} />

          {/* Internal Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/department-admin/login" element={<DepartmentAdminLogin />} />
          <Route path="/department-consultant/login" element={<ConsultantLogin />} />
          <Route path="/consultant/login" element={<ConsultantLogin />} />
          <Route path="/crm-admin/login" element={<CRMAdminLogin />} />

          {/* Shared Auth */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* ============================================ */}
          {/* B2B / CLIENT PORTAL (Single Client Portal)    */}
          {/* ============================================ */}
          <Route path="/b2b/dashboard" element={<B2BProtectedRoute><B2BDashboard /></B2BProtectedRoute>} />
          <Route path="/b2b/services" element={<B2BProtectedRoute><B2BServiceRequests /></B2BProtectedRoute>} />
          <Route path="/b2b/documents" element={<B2BProtectedRoute><B2BDocuments /></B2BProtectedRoute>} />
          <Route path="/b2b/proposals" element={<B2BProtectedRoute><B2BProposals /></B2BProtectedRoute>} />
          <Route path="/b2b/meetings" element={<B2BProtectedRoute><B2BMeetings /></B2BProtectedRoute>} />
          <Route path="/b2b/payments" element={<B2BProtectedRoute><B2BPayments /></B2BProtectedRoute>} />
          <Route path="/b2b/team" element={<B2BProtectedRoute><B2BTeam /></B2BProtectedRoute>} />
          <Route path="/b2b/support" element={<B2BProtectedRoute><B2BSupport /></B2BProtectedRoute>} />
          <Route path="/b2b/settings" element={<B2BProtectedRoute><B2BSettings /></B2BProtectedRoute>} />
          <Route path="/b2b" element={<Navigate to="/b2b/dashboard" replace />} />

          {/* Redirect old /client/* routes to /b2b/* */}
          <Route path="/client/dashboard" element={<Navigate to="/b2b/dashboard" replace />} />
          <Route path="/client/loans" element={<Navigate to="/b2b/services" replace />} />
          <Route path="/client/tax-planning" element={<Navigate to="/b2b/services" replace />} />
          <Route path="/client/investments" element={<Navigate to="/b2b/services" replace />} />
          <Route path="/client/proposals" element={<Navigate to="/b2b/proposals" replace />} />
          <Route path="/client/payments" element={<Navigate to="/b2b/payments" replace />} />
          <Route path="/client/consultations" element={<Navigate to="/b2b/services" replace />} />
          <Route path="/client/reports" element={<Navigate to="/b2b/documents" replace />} />
          <Route path="/client/settings" element={<Navigate to="/b2b/settings" replace />} />
          <Route path="/client/help" element={<Navigate to="/b2b/support" replace />} />
          <Route path="/client/notifications" element={<Navigate to="/b2b/dashboard" replace />} />
          <Route path="/client" element={<Navigate to="/b2b/dashboard" replace />} />

          {/* ============================================ */}
          {/* CRM ADMIN                                     */}
          {/* ============================================ */}
          <Route path="/crm-admin/dashboard" element={<CRMAdminRoute><CRMDashboard /></CRMAdminRoute>} />
          <Route path="/crm-admin/leads" element={<CRMAdminRoute><CRMLeads /></CRMAdminRoute>} />
          <Route path="/crm-admin/pipeline" element={<CRMAdminRoute><CRMLeads /></CRMAdminRoute>} />
          <Route path="/crm-admin/analytics" element={<CRMAdminRoute><CRMDashboard /></CRMAdminRoute>} />
          <Route path="/crm-admin" element={<Navigate to="/crm-admin/dashboard" replace />} />

          {/* ============================================ */}
          {/* SUPER ADMIN                                   */}
          {/* ============================================ */}
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
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* ============================================ */}
          {/* DEPARTMENT ADMIN                              */}
          {/* ============================================ */}
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
          <Route path="/department-admin" element={<Navigate to="/department-admin/dashboard" replace />} />

          {/* ============================================ */}
          {/* CONSULTANTS                                   */}
          {/* ============================================ */}
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
          <Route path="/consultant" element={<Navigate to="/consultant/login" replace />} />
          <Route path="/department-consultant" element={<Navigate to="/department-consultant/loans/dashboard" replace />} />

          {/* ============================================ */}
          {/* WORKFLOW (Internal)                           */}
          {/* ============================================ */}
          <Route path="/workflow" element={<WorkflowOverview />} />
          <Route path="/workflow/lead-capture" element={<Step1_LeadCapture />} />
          <Route path="/workflow/crm-qualify" element={<ProtectedRoute><Step2_CRMQualify /></ProtectedRoute>} />
          <Route path="/workflow/dept-assign" element={<ProtectedRoute><Step3_DeptAssign /></ProtectedRoute>} />
          <Route path="/workflow/consultant-action" element={<ProtectedRoute><Step4_ConsultantAction /></ProtectedRoute>} />
          <Route path="/workflow/client-approve" element={<ProtectedRoute><Step5_ClientApprove /></ProtectedRoute>} />
          <Route path="/workflow/onboarding" element={<ProtectedRoute><Step6_Onboarding /></ProtectedRoute>} />

          {/* ============================================ */}
          {/* LEGACY REDIRECTS                              */}
          {/* ============================================ */}
          <Route path="/dashboard" element={<Navigate to="/b2b/dashboard" replace />} />
          <Route path="/login-registration" element={<Navigate to="/b2b/login" replace />} />
          <Route path="/client/login" element={<Navigate to="/b2b/login" replace />} />
          <Route path="/client/financial-profile" element={<Navigate to="/b2b/dashboard" replace />} />
          <Route path="/client/health-score" element={<Navigate to="/b2b/dashboard" replace />} />
          <Route path="/client/billing" element={<Navigate to="/b2b/payments" replace />} />
          <Route path="/client/contact" element={<Navigate to="/b2b/support" replace />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/crm" element={<Navigate to="/admin/crm" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {!isPortalRoute && <Footer />}
    </div>
  );
}
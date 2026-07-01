import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRoute from '../components/RoleBasedRoute';
import B2BProtectedRoute from '../components/B2BProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Eagerly load critical landing and login routes for instant FCP/LCP
import Home from '../pages/website/Home/Home';
import LandingPage from '../pages/public/LandingPage';
import B2BLogin from '../pages/b2b/Login';
import CRMAdminLogin from '../pages/public/CRMAdminLogin';
import AdminLogin from '../pages/public/AdminLogin';
import DepartmentAdminLogin from '../pages/public/DepartmentAdminLogin';
import ConsultantLogin from '../pages/public/ConsultantLogin';

// Lazy-load non-critical shell components
const Navbar = lazy(() => import('../components/Navbar/Navbar'));
const Footer = lazy(() => import('../components/Footer'));
const CustomCursor = lazy(() => import('../components/CustomCursor'));
const Chatbot = lazy(() => import('../components/Chatbot'));
const CookieConsent = lazy(() => import('../components/CookieConsent'));
import { getDepartmentDashboardPath, getUserDepartment } from '../utils/departmentAccess';

// Minimal loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ width: 36, height: 36, border: '3px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

// ── Website pages (lazy) ──

const About = lazy(() => import('../pages/website/About/About'));
const PrivacyPolicy = lazy(() => import('../pages/website/Legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/website/Legal/TermsOfService'));
const RegulatoryDisclosures = lazy(() => import('../pages/website/Legal/RegulatoryDisclosures'));
const Contact = lazy(() => import('../pages/website/Contact/Contact'));
const ValuationAdvisory = lazy(() => import('../pages/website/Services/ValuationAdvisory'));
const TransactionServices = lazy(() => import('../pages/website/Services/TransactionServices'));
const RiskCompliance = lazy(() => import('../pages/website/Services/RiskCompliance'));
const FinancialTransformation = lazy(() => import('../pages/website/Services/FinancialTransformation'));
const WealthManagement = lazy(() => import('../pages/website/Services/WealthManagement'));
const CorporateFinance = lazy(() => import('../pages/website/Services/CorporateFinance'));
const MarketIntelligence = lazy(() => import('../pages/website/Industries/MarketIntelligence'));
const DigitalFinance = lazy(() => import('../pages/website/Services/DigitalFinance'));
const TaxAdvisory = lazy(() => import('../pages/website/Services/TaxAdvisory'));
const DynamicDetail = lazy(() => import('../pages/website/Services/DynamicDetail'));
const ServicesWeOffer = lazy(() => import('../pages/website/Services/ServicesWeOffer'));
const ThreeWays = lazy(() => import('../pages/website/Services/ThreeWays'));

// ── Auth pages (lazy) ──

const B2BRegister = lazy(() => import('../pages/b2b/Register'));
const ForgotPassword = lazy(() => import('../pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/public/ResetPassword'));
const VerifyEmail = lazy(() => import('../pages/public/VerifyEmail'));
const NotFound = lazy(() => import('../pages/public/NotFound'));

// ── B2B (Client) Portal (lazy) ──
const B2BDashboard = lazy(() => import('../pages/b2b/Dashboard'));
const B2BServiceRequests = lazy(() => import('../pages/b2b/ServiceRequests'));
const B2BDocuments = lazy(() => import('../pages/b2b/Documents'));
const B2BProposals = lazy(() => import('../pages/b2b/Proposals'));
const B2BMeetings = lazy(() => import('../pages/b2b/Meetings'));
const B2BPayments = lazy(() => import('../pages/b2b/Payments'));
const B2BTeam = lazy(() => import('../pages/b2b/Team'));
const B2BSupport = lazy(() => import('../pages/b2b/Support'));
const B2BSettings = lazy(() => import('../pages/b2b/Settings'));
const B2BRecommendations = lazy(() => import('../pages/b2b/Recommendations'));

// ── CRM Admin (lazy) ──

const CRMDashboard = lazy(() => import('../pages/crm-admin/Dashboard'));
const CRMLeads = lazy(() => import('../pages/crm-admin/Leads'));
const CRMClients = lazy(() => import('../pages/crm-admin/Clients'));
const CRMAdminPipeline = lazy(() => import('../pages/crm-admin/Pipeline'));

// ── Internal Admin (lazy) ──

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const ConsultantManagement = lazy(() => import('../pages/admin/ConsultantManagement'));
const ProductManagement = lazy(() => import('../pages/admin/ProductManagement'));
const CRMPipeline = lazy(() => import('../pages/admin/CRMPipeline'));
const ContactMessages = lazy(() => import('../pages/admin/ContactMessages'));
const AnalyticsDashboard = lazy(() => import('../pages/admin/AnalyticsDashboard'));
const SystemSettings = lazy(() => import('../pages/admin/SystemSettings'));
const AuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const LeadManagement = lazy(() => import('../pages/admin/LeadManagement'));
const CRMManagement = lazy(() => import('../pages/admin/CRMManagement'));
const DepartmentManagement = lazy(() => import('../pages/admin/DepartmentManagement'));
const RevenueAnalytics = lazy(() => import('../pages/admin/RevenueAnalytics'));
const ApiManagement = lazy(() => import('../pages/admin/ApiManagement'));

// ── Department Admin (lazy) ──

const DepartmentAdminDashboard = lazy(() => import('../pages/department-admin/Dashboard'));
const DepartmentAdminClients = lazy(() => import('../pages/department-admin/Clients'));
const DepartmentLeadReview = lazy(() => import('../pages/department-admin/LeadReview'));
const DeptLeadQueue = lazy(() => import('../pages/department-admin/LeadQueue'));
const DeptAssignedClients = lazy(() => import('../pages/department-admin/AssignedClients'));
const DeptConsultationQueue = lazy(() => import('../pages/department-admin/ConsultationQueue'));
const DeptAssignments = lazy(() => import('../pages/department-admin/Assignments'));
const DeptAdminClientDocuments = lazy(() => import('../pages/department-admin/ClientDocuments'));
const KycReview = lazy(() => import('../pages/department-admin/KycReview'));
const CompletedMeetings = lazy(() => import('../pages/department-admin/CompletedMeetings'));
const DepartmentAdminPayments = lazy(() => import('../pages/department-admin/Payments'));

// ── Consultants (lazy) ──

const ConsultantDashboard = lazy(() => import('../pages/consultant/Dashboard'));
const MyClients = lazy(() => import('../pages/consultant/ClientList'));
const ClientDetail = lazy(() => import('../pages/consultant/ClientDetail'));
const ConsultantReports = lazy(() => import('../pages/consultant/Reports'));
const ConsultantInvoices = lazy(() => import('../pages/consultant/Invoices'));
const ConsultantSchedule = lazy(() => import('../pages/consultant/Schedule'));
const ConsultantNotifications = lazy(() => import('../pages/consultant/Notifications'));
const LoanWorkflow = lazy(() => import('../pages/consultant/LoanWorkflow'));
const TaxWorkflow = lazy(() => import('../pages/consultant/TaxWorkflow'));
const InvestmentWorkflow = lazy(() => import('../pages/consultant/InvestmentWorkflow'));
const InsuranceWorkflow = lazy(() => import('../pages/consultant/InsuranceWorkflow'));
const WealthWorkflow = lazy(() => import('../pages/consultant/WealthWorkflow'));
const ConsultantProposals = lazy(() => import('../pages/consultant/Proposals'));
const ConsultantPayments = lazy(() => import('../pages/consultant/Payments'));

// ── Workflow pages (lazy) ──
const WorkflowOverview = lazy(() => import('../pages/workflow/WorkflowOverview'));
const Step1_LeadCapture = lazy(() => import('../pages/workflow/Step1_LeadCapture'));
const Step2_CRMQualify = lazy(() => import('../pages/workflow/Step2_CRMQualify'));
const Step3_DeptAssign = lazy(() => import('../pages/workflow/Step3_DeptAssign'));
const Step4_ConsultantAction = lazy(() => import('../pages/workflow/Step4_ConsultantAction'));
const Step5_ClientApprove = lazy(() => import('../pages/workflow/Step5_ClientApprove'));
const Step6_Onboarding = lazy(() => import('../pages/workflow/Step6_Onboarding'));

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
      <Suspense fallback={null}><CustomCursor /></Suspense>
      {!isPortalRoute && <Suspense fallback={null}><Navbar /></Suspense>}
      <Suspense fallback={null}><CookieConsent /></Suspense>
      {!isPortalRoute && <Suspense fallback={null}><Chatbot /></Suspense>}

      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
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
          <Route path="/b2b/recommendations" element={<B2BProtectedRoute><B2BRecommendations /></B2BProtectedRoute>} />
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
          <Route path="/crm-admin/clients" element={<CRMAdminRoute><CRMClients /></CRMAdminRoute>} />
          <Route path="/crm-admin/pipeline" element={<CRMAdminRoute><CRMAdminPipeline /></CRMAdminRoute>} />
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
          <Route path="/admin/api-management" element={<AdminRoute><ApiManagement /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><RevenueAnalytics /></AdminRoute>} />
          <Route path="/admin/kyc" element={<AdminRoute><KycReview /></AdminRoute>} />
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
          <Route path="/department-admin/assigned-clients" element={<DepartmentAdminRoute><DeptAssignedClients /></DepartmentAdminRoute>} />
          <Route path="/department-admin/assignments" element={<DepartmentAdminRoute><DeptAssignments /></DepartmentAdminRoute>} />
          <Route path="/department-admin/documents" element={<DepartmentAdminRoute><DeptAdminClientDocuments /></DepartmentAdminRoute>} />
          <Route path="/department-admin/kyc" element={<DepartmentAdminRoute><KycReview /></DepartmentAdminRoute>} />
          <Route path="/department-admin/completed-meetings" element={<DepartmentAdminRoute><CompletedMeetings /></DepartmentAdminRoute>} />
          <Route path="/department-admin/payments" element={<DepartmentAdminRoute><DepartmentAdminPayments /></DepartmentAdminRoute>} />
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
          <Route path="/consultant/kyc" element={<ConsultantRoute><KycReview /></ConsultantRoute>} />
          <Route path="/consultant/payments" element={<ConsultantRoute><ConsultantPayments /></ConsultantRoute>} />
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
      </Suspense>

      {!isPortalRoute && <Suspense fallback={null}><Footer /></Suspense>}
    </div>
  );
}
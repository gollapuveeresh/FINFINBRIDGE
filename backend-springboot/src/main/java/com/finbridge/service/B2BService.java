package com.finbridge.service;

import com.finbridge.dto.*;
import com.finbridge.entity.*;
import com.finbridge.exception.BadRequestException;
import com.finbridge.exception.ResourceNotFoundException;
import com.finbridge.repository.*;
import com.finbridge.security.B2BAccessGuard;
import com.finbridge.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class B2BService {

    private final OrganizationRepository orgRepo;
    private final OrganizationUserRepository orgUserRepo;
    private final ServiceRequestRepository serviceReqRepo;
    private final OrganizationDocumentRepository orgDocRepo;
    private final OrganizationProposalRepository orgProposalRepo;
    private final OrganizationMeetingRepository orgMeetingRepo;
    private final OrganizationPaymentRepository orgPaymentRepo;
    private final SupportTicketRepository supportTicketRepo;
    private final InvoiceRepository invoiceRepo;
    private final LeadService leadService;
    private final PaymentService paymentService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SequenceGenerator sequenceGenerator;

    @org.springframework.beans.factory.annotation.Value("${app.payments.mock-enabled:true}")
    private boolean mockPaymentsEnabled;

    // ─── Registration ────────────────────────────────────────────────────────
    @Transactional
    public OrgLoginResponse register(OrgRegisterRequest req) {
        if (orgUserRepo.existsByEmailIgnoreCase(req.getAdminEmail()))
            throw new BadRequestException("Email already registered");
        if (req.getGstin() != null && orgRepo.findByGstin(req.getGstin()).isPresent())
            throw new BadRequestException("GSTIN already registered");

        Organization org = new Organization();
        org.setCompanyName(req.getCompanyName());
        org.setIndustry(req.getIndustry());
        org.setGstin(req.getGstin());
        org.setCin(req.getCin());
        org.setPan(req.getPan());
        org.setAnnualTurnover(req.getAnnualTurnover());
        org.setEmployeeCount(req.getEmployeeCount());
        org.setAddress(req.getAddress());
        org.setCity(req.getCity());
        org.setState(req.getState());
        org.setPincode(req.getPincode());
        org.setWebsite(req.getWebsite());
        if (req.getServices() != null)
            org.setServices(req.getServices().toArray(new String[0]));
        org.setStatus("pending");
        orgRepo.save(org);

        OrganizationUser admin = new OrganizationUser();
        admin.setOrganization(org);
        admin.setName(req.getAdminName());
        admin.setEmail(req.getAdminEmail());
        admin.setPasswordHash(passwordEncoder.encode(req.getAdminPassword()));
        admin.setRole("COMPANY_ADMIN");
        orgUserRepo.save(admin);

        // Auto-generate a CRM lead so the sales team can follow up on the new B2B sign-up.
        createCrmLead(org, req);

        String token = jwtService.generateB2BToken(admin.getId().toString(), org.getId().toString());
        return buildLoginResponse(token, admin, org);
    }

    /** Creates a CRM lead from a freshly registered organization. */
    private void createCrmLead(Organization org, OrgRegisterRequest req) {
        Lead lead = new Lead();
        lead.setName(org.getCompanyName());
        lead.setEmail(req.getAdminEmail());
        lead.setPhone(req.getAdminPhone());
        lead.setSource("b2b_registration");
        lead.setIncome(org.getAnnualTurnover());
        lead.setServiceType(req.getServices() != null ? String.join(", ", req.getServices()) : null);
        lead.setDepartment(primaryDepartment(req.getServices()));
        lead.setRequirement(buildRequirement(org, req));
        leadService.create(lead);
    }

    private String buildRequirement(Organization org, OrgRegisterRequest req) {
        StringBuilder sb = new StringBuilder("New B2B organization registration");
        if (org.getIndustry() != null) sb.append(" • Industry: ").append(org.getIndustry());
        if (req.getServices() != null && !req.getServices().isEmpty())
            sb.append(" • Services: ").append(String.join(", ", req.getServices()));
        if (org.getEmployeeCount() != null) sb.append(" • Employees: ").append(org.getEmployeeCount());
        return sb.toString();
    }

    /** Maps the first selected service to a CRM department code (null if none/unknown). */
    private String primaryDepartment(List<String> services) {
        if (services == null || services.isEmpty()) return null;
        String s = services.get(0).toLowerCase();
        if (s.contains("loan")) return "loans";
        if (s.contains("tax")) return "tax";
        if (s.contains("invest")) return "investment";
        if (s.contains("insurance")) return "insurance";
        if (s.contains("wealth")) return "wealth";
        return null;
    }

    // ─── Login ───────────────────────────────────────────────────────────────
    @Transactional
    public OrgLoginResponse login(OrgLoginRequest req) {
        OrganizationUser user = orgUserRepo.findByEmailIgnoreCase(req.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash()))
            throw new BadRequestException("Invalid credentials");
        if (!user.isActive())
            throw new BadRequestException("Account is disabled");

        user.setLastLogin(Instant.now());
        orgUserRepo.save(user);

        String token = jwtService.generateB2BToken(user.getId().toString(), user.getOrganization().getId().toString());
        return buildLoginResponse(token, user, user.getOrganization());
    }

    // ─── Service Requests ────────────────────────────────────────────────────
    @Transactional
    public ServiceRequestResponse createServiceRequest(UUID orgId, ServiceRequestRequest req) {
        Organization org = orgRepo.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        ServiceRequest sr = new ServiceRequest();
        sr.setRequestNumber(sequenceGenerator.next(SequenceGenerator.Seq.SERVICE_REQUEST));
        sr.setOrganization(org);
        sr.setDepartmentId(req.getDepartmentId());
        sr.setTitle(req.getTitle());
        sr.setDescription(req.getDescription());
        sr.setPriority(req.getPriority() != null ? req.getPriority() : "medium");
        sr.setAmountInvolved(req.getAmountInvolved());
        sr.setCurrency(req.getCurrency() != null ? req.getCurrency() : "INR");
        sr.setNotes(req.getNotes());
        serviceReqRepo.save(sr);
        return toResponse(sr);
    }

    public List<ServiceRequestResponse> getOrgServiceRequests(UUID orgId) {
        return serviceReqRepo.findByOrganizationIdAndActiveTrue(orgId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ServiceRequestResponse updateStatus(UUID srId, String status, Object principal) {
        ServiceRequest sr = serviceReqRepo.findById(srId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));
        B2BAccessGuard.assertOrgAccess(principal, sr.getOrganization().getId());
        sr.setStatus(status);
        if ("completed".equals(status) || "rejected".equals(status))
            sr.setClosedAt(Instant.now());
        serviceReqRepo.save(sr);
        return toResponse(sr);
    }

    // ─── Department Admin: list by dept ──────────────────────────────────────
    public List<ServiceRequestResponse> getDeptServiceRequests(String deptId) {
        return serviceReqRepo.findByDepartmentIdAndActiveTrue(deptId)
                .stream().map(this::toResponse).toList();
    }

    // ─── Organization Dashboard Stats ────────────────────────────────────────
    public java.util.Map<String, Object> getOrgStats(UUID orgId) {
        var all = serviceReqRepo.findByOrganizationIdAndActiveTrue(orgId);
        long pending = all.stream().filter(s -> !List.of("completed","rejected").contains(s.getStatus())).count();
        long completed = all.stream().filter(s -> "completed".equals(s.getStatus())).count();
        var docs = orgDocRepo.findByOrganizationId(orgId);
        long pendingDocs = docs.stream().filter(d -> "pending".equals(d.getStatus())).count();
        var payments = orgPaymentRepo.findByOrganizationIdOrderByCreatedAtDesc(orgId);
        var totalPaid = payments.stream().filter(p -> "paid".equals(p.getStatus()))
                .mapToDouble(p -> p.getAmount().doubleValue()).sum();
        return java.util.Map.of(
                "totalRequests", all.size(),
                "pendingRequests", pending,
                "completedRequests", completed,
                "totalDocuments", docs.size(),
                "pendingDocuments", pendingDocs,
                "totalPaid", totalPaid,
                "activeProposals", orgProposalRepo.findByOrganizationIdAndActiveTrue(orgId).size()
        );
    }

    // ─── Support Tickets ─────────────────────────────────────────────────────
    @Transactional
    public SupportTicket createTicket(UUID orgId, String subject, String description, String category, String priority) {
        Organization org = orgRepo.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        SupportTicket ticket = new SupportTicket();
        ticket.setTicketNumber(sequenceGenerator.next(SequenceGenerator.Seq.SUPPORT_TICKET));
        ticket.setOrganization(org);
        ticket.setSubject(subject);
        ticket.setDescription(description);
        ticket.setCategory(category != null ? category : "general");
        ticket.setPriority(priority != null ? priority : "medium");
        return supportTicketRepo.save(ticket);
    }

    public List<SupportTicket> getOrgTickets(UUID orgId) {
        return supportTicketRepo.findByOrganizationIdOrderByCreatedAtDesc(orgId);
    }

    // ─── Team Members ────────────────────────────────────────────────────────
    public List<OrganizationUser> getTeamMembers(UUID orgId) {
        return orgUserRepo.findByOrganizationId(orgId);
    }

    @Transactional
    public OrganizationUser addTeamMember(UUID orgId, String name, String email, String role, String password) {
        if (orgUserRepo.existsByEmailIgnoreCase(email)) throw new BadRequestException("Email already registered");
        Organization org = orgRepo.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        OrganizationUser u = new OrganizationUser();
        u.setOrganization(org);
        u.setName(name);
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(password));
        u.setRole(role);
        return orgUserRepo.save(u);
    }

    // ─── Proposals (org-facing) ───────────────────────────────────────────────
    public List<OrganizationProposal> getOrgProposals(UUID orgId) {
        return orgProposalRepo.findByOrganizationIdAndActiveTrue(orgId);
    }

    @Transactional
    public OrganizationProposal decideProposal(UUID proposalId, String decision, String feedback, Object principal) {
        OrganizationProposal p = orgProposalRepo.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found"));
        B2BAccessGuard.assertOrgAccess(principal, p.getOrganization().getId());
        p.setStatus(decision); // approved | changes_requested | rejected
        p.setOrgFeedback(feedback);
        return orgProposalRepo.save(p);
    }

    // ─── Meetings ────────────────────────────────────────────────────────────
    public List<OrganizationMeeting> getOrgMeetings(UUID orgId) {
        return orgMeetingRepo.findByOrganizationIdOrderByScheduledAtDesc(orgId);
    }

    // ─── Payments ────────────────────────────────────────────────────────────
    public List<OrganizationPayment> getOrgPayments(UUID orgId) {
        return orgPaymentRepo.findByOrganizationIdOrderByCreatedAtDesc(orgId);
    }

    /**
     * Settle a pending payment. For now this is a MOCK gateway (no real charge) so the flow can be
     * demoed end-to-end; once Razorpay keys are provided, replace the body with: create order →
     * client opens Razorpay Checkout → verify the returned signature here → then mark paid.
     *
     * @param gatewayRef the payment id returned by the (mock) gateway
     */
    @Transactional
    public OrganizationPayment payPayment(UUID paymentId, Object principal, String gatewayRef) {
        if (!mockPaymentsEnabled)
            throw new BadRequestException("Online payment is not available yet. Please contact FinBridge to settle this invoice.");
        OrganizationPayment op = orgPaymentRepo.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        B2BAccessGuard.assertOrgAccess(principal, op.getOrganization().getId());
        if ("paid".equals(op.getStatus())) return op;   // idempotent

        op.setStatus("paid");
        op.setPaidAt(Instant.now());
        op.setGateway("razorpay");
        op.setGatewayPaymentId(gatewayRef != null ? gatewayRef : "pay_mock_" + UUID.randomUUID().toString().substring(0, 12));
        orgPaymentRepo.save(op);

        // Reflect the settlement on the originating CRM invoice (gateway_order_id holds the invoice number),
        // so the consultant/department side and revenue analytics show it as paid too.
        if (op.getGatewayOrderId() != null) {
            invoiceRepo.findByInvoiceNumber(op.getGatewayOrderId()).ifPresent(inv -> {
                if (!"paid".equals(inv.getStatus())) {
                    inv.setStatus("paid");
                    inv.setPaidAt(Instant.now());
                    invoiceRepo.save(inv);
                    paymentService.recordForInvoice(inv, "razorpay");
                }
            });
        }
        return op;
    }

    /** Build a printable invoice payload for an org payment (real CRM invoice if linked, else a basic one). */
    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentInvoice(UUID paymentId, Object principal) {
        OrganizationPayment op = orgPaymentRepo.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        B2BAccessGuard.assertOrgAccess(principal, op.getOrganization().getId());
        Organization org = op.getOrganization();

        Invoice inv = op.getGatewayOrderId() == null ? null
                : invoiceRepo.findByInvoiceNumber(op.getGatewayOrderId()).orElse(null);

        Map<String, Object> out = new LinkedHashMap<>();
        if (inv != null) {
            out.put("invoiceNumber", inv.getInvoiceNumber());
            out.put("clientId", ref(org.getCompanyName(), inv.getClient() != null ? inv.getClient().getEmail() : null));
            out.put("consultantId", ref(inv.getConsultant() != null ? inv.getConsultant().getName() : "FinBridge Advisory", null));
            out.put("serviceTitle", inv.getServiceTitle());
            out.put("department", inv.getDepartment());
            List<Map<String, Object>> items = new ArrayList<>();
            for (InvoiceLineItem li : inv.getLineItems()) items.add(lineItem(li.getDescription(), li.getAmount()));
            out.put("lineItems", items);
            out.put("subtotal", inv.getSubtotal());
            out.put("tax", inv.getTax());
            out.put("taxPercent", inv.getTaxPercent());
            out.put("totalAmount", inv.getTotalAmount());
            out.put("status", inv.getStatus());
            out.put("dueDate", inv.getDueDate());
            out.put("paidAt", inv.getPaidAt());
            out.put("notes", inv.getNotes());
            out.put("currency", inv.getCurrency());
            out.put("createdAt", inv.getCreatedAt());
        } else {
            // No linked CRM invoice — synthesize a minimal invoice from the payment row.
            out.put("invoiceNumber", op.getPaymentNumber());
            out.put("clientId", ref(org.getCompanyName(), null));
            out.put("consultantId", ref("FinBridge Advisory", null));
            out.put("serviceTitle", "Professional services");
            out.put("lineItems", List.of(lineItem("Professional services", op.getAmount())));
            out.put("subtotal", op.getAmount());
            out.put("tax", java.math.BigDecimal.ZERO);
            out.put("taxPercent", java.math.BigDecimal.ZERO);
            out.put("totalAmount", op.getAmount());
            out.put("status", op.getStatus());
            out.put("paidAt", op.getPaidAt());
            out.put("currency", op.getCurrency());
            out.put("createdAt", op.getCreatedAt());
        }
        return out;
    }

    private Map<String, Object> ref(String name, String email) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", name);
        m.put("email", email);
        return m;
    }

    private Map<String, Object> lineItem(String description, java.math.BigDecimal amount) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("description", description);
        m.put("amount", amount);
        return m;
    }

    // ─── Documents ───────────────────────────────────────────────────────────
    public List<OrganizationDocument> getOrgDocuments(UUID orgId) {
        return orgDocRepo.findByOrganizationId(orgId);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private OrgLoginResponse buildLoginResponse(String token, OrganizationUser user, Organization org) {
        return OrgLoginResponse.builder()
                .token(token)
                .orgUserId(user.getId())
                .organizationId(org.getId())
                .companyName(org.getCompanyName())
                .industry(org.getIndustry())
                .gstin(org.getGstin())
                .status(org.getStatus())
                .kycVerified(org.isKycVerified())
                .userName(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private ServiceRequestResponse toResponse(ServiceRequest sr) {
        return ServiceRequestResponse.builder()
                .id(sr.getId())
                .requestNumber(sr.getRequestNumber())
                .organizationId(sr.getOrganization().getId())
                .companyName(sr.getOrganization().getCompanyName())
                .departmentId(sr.getDepartmentId())
                .consultantName(sr.getConsultant() != null ? sr.getConsultant().getName() : null)
                .title(sr.getTitle())
                .description(sr.getDescription())
                .priority(sr.getPriority())
                .status(sr.getStatus())
                .amountInvolved(sr.getAmountInvolved())
                .currency(sr.getCurrency())
                .notes(sr.getNotes())
                .createdAt(sr.getCreatedAt())
                .updatedAt(sr.getUpdatedAt())
                .build();
    }
}

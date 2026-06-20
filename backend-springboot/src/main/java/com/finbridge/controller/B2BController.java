package com.finbridge.controller;

import com.finbridge.dto.*;
import com.finbridge.entity.*;
import com.finbridge.security.B2BAccessGuard;
import com.finbridge.service.B2BService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/b2b")
@RequiredArgsConstructor
@Tag(name = "B2B", description = "B2B Organization Portal APIs")
public class B2BController {

    private final B2BService b2bService;

    // ─── Auth ────────────────────────────────────────────────────────────────
    @PostMapping("/register")
    @Operation(summary = "Register a new organization")
    public ResponseEntity<OrgLoginResponse> register(@RequestBody OrgRegisterRequest req) {
        return ResponseEntity.ok(b2bService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Login as organization user")
    public ResponseEntity<OrgLoginResponse> login(@RequestBody OrgLoginRequest req) {
        return ResponseEntity.ok(b2bService.login(req));
    }

    // ─── Dashboard Stats ─────────────────────────────────────────────────────
    @GetMapping("/organizations/{orgId}/stats")
    public ResponseEntity<Map<String, Object>> stats(@PathVariable UUID orgId,
                                                     @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.getOrgStats(orgId));
    }

    // ─── Service Requests ────────────────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/service-requests")
    public ResponseEntity<ServiceRequestResponse> createRequest(
            @PathVariable UUID orgId, @RequestBody ServiceRequestRequest req,
            @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.createServiceRequest(orgId, req));
    }

    @GetMapping("/organizations/{orgId}/service-requests")
    public ResponseEntity<List<ServiceRequestResponse>> getRequests(@PathVariable UUID orgId,
                                                                    @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.getOrgServiceRequests(orgId));
    }

    @PatchMapping("/service-requests/{id}/status")
    public ResponseEntity<ServiceRequestResponse> updateStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(b2bService.updateStatus(id, body.get("status"), principal));
    }

    @GetMapping("/departments/{deptId}/service-requests")
    public ResponseEntity<List<ServiceRequestResponse>> getDeptRequests(@PathVariable String deptId) {
        return ResponseEntity.ok(b2bService.getDeptServiceRequests(deptId));
    }

    // ─── Proposals ───────────────────────────────────────────────────────────
    @GetMapping("/organizations/{orgId}/proposals")
    public ResponseEntity<List<OrganizationProposal>> getProposals(@PathVariable UUID orgId,
                                                                   @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.getOrgProposals(orgId));
    }

    @PatchMapping("/proposals/{id}/decision")
    public ResponseEntity<OrganizationProposal> decideProposal(
            @PathVariable UUID id, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(b2bService.decideProposal(id, body.get("decision"), body.get("feedback"), principal));
    }

    // ─── Meetings ────────────────────────────────────────────────────────────
    @GetMapping("/organizations/{orgId}/meetings")
    public ResponseEntity<List<OrganizationMeeting>> getMeetings(@PathVariable UUID orgId,
                                                                 @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.getOrgMeetings(orgId));
    }

    // ─── Payments ────────────────────────────────────────────────────────────
    @GetMapping("/organizations/{orgId}/payments")
    public ResponseEntity<List<OrganizationPayment>> getPayments(@PathVariable UUID orgId,
                                                                 @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.getOrgPayments(orgId));
    }

    /** Settle a pending payment (mock gateway for now; Razorpay verification slots in here later). */
    @PostMapping("/payments/{paymentId}/pay")
    public ResponseEntity<OrganizationPayment> payPayment(@PathVariable UUID paymentId,
                                                          @RequestBody(required = false) Map<String, String> body,
                                                          @AuthenticationPrincipal Object principal) {
        String gatewayRef = body != null ? body.get("razorpayPaymentId") : null;
        return ResponseEntity.ok(b2bService.payPayment(paymentId, principal, gatewayRef));
    }

    /** Printable invoice payload for a payment (used by the portal's "Download" action). */
    @GetMapping("/payments/{paymentId}/invoice")
    public ResponseEntity<Map<String, Object>> paymentInvoice(@PathVariable UUID paymentId,
                                                              @AuthenticationPrincipal Object principal) {
        return ResponseEntity.ok(b2bService.getPaymentInvoice(paymentId, principal));
    }

    // ─── Team ────────────────────────────────────────────────────────────────
    @GetMapping("/organizations/{orgId}/team")
    public ResponseEntity<List<OrganizationUser>> getTeam(@PathVariable UUID orgId,
                                                          @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.getTeamMembers(orgId));
    }

    @PostMapping("/organizations/{orgId}/team")
    public ResponseEntity<OrganizationUser> addTeamMember(
            @PathVariable UUID orgId, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.addTeamMember(
                orgId, body.get("name"), body.get("email"), body.get("role"), body.get("password")));
    }

    // ─── Support ─────────────────────────────────────────────────────────────
    @GetMapping("/organizations/{orgId}/support")
    public ResponseEntity<List<SupportTicket>> getTickets(@PathVariable UUID orgId,
                                                          @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.getOrgTickets(orgId));
    }

    @PostMapping("/organizations/{orgId}/support")
    public ResponseEntity<SupportTicket> createTicket(
            @PathVariable UUID orgId, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.createTicket(
                orgId, body.get("subject"), body.get("description"),
                body.get("category"), body.get("priority")));
    }

    // ─── Documents ───────────────────────────────────────────────────────────
    @GetMapping("/organizations/{orgId}/documents")
    public ResponseEntity<List<OrganizationDocument>> getDocuments(@PathVariable UUID orgId,
                                                                   @AuthenticationPrincipal Object principal) {
        B2BAccessGuard.assertOrgAccess(principal, orgId);
        return ResponseEntity.ok(b2bService.getOrgDocuments(orgId));
    }
}

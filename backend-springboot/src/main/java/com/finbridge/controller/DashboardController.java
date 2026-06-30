package com.finbridge.controller;

import com.finbridge.entity.User;
import com.finbridge.repository.InvoiceRepository;
import com.finbridge.repository.LeadRepository;
import com.finbridge.repository.LoanRepository;
import com.finbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final LoanRepository loanRepository;
    private final InvoiceRepository invoiceRepository;
    private final com.finbridge.repository.OrganizationRepository organizationRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal User user) {
        java.util.List<Map<String, Object>> packageStats = new java.util.ArrayList<>();
        for (Object[] row : organizationRepository.countBySelectedPackage()) {
            if (row[0] != null) {
                packageStats.add(Map.of(
                    "packageName", row[0],
                    "count", row[1]
                ));
            }
        }

        return ResponseEntity.ok(Map.of(
            "totalUsers",    userRepository.count(),
            "totalLeads",    leadRepository.countActive(),
            "hotLeads",      leadRepository.countByStatus("hot"),
            "wonLeads",      leadRepository.countByStatus("won"),
            "totalLoans",    loanRepository.count(),
            "totalInvoices", invoiceRepository.countByActiveTrue(),
            "packageStats",  packageStats,
            "role",          user.getRole(),
            "department",    user.getDepartment() != null ? user.getDepartment() : ""
        ));
    }
}

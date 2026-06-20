package com.finbridge.service;

import com.finbridge.entity.DeptCase;
import com.finbridge.entity.LoanCase;
import com.finbridge.entity.LoanCaseDocument;
import com.finbridge.entity.User;
import com.finbridge.repository.DeptCaseRepository;
import com.finbridge.repository.LoanCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Aggregates the documents attached to a staff member's cases into the flat shape the
 * "Client Documents" page expects: { _id, name, type, size, status, createdAt, clientId:{name,email} }.
 *
 * Sources: loan-case documents (relational) and department-case documents (stored in the JSONB blob).
 */
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final LoanCaseRepository loanCaseRepository;
    private final DeptCaseRepository deptCaseRepository;

    /** Documents across the loan cases the consultant owns. */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> forConsultant(User consultant) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (LoanCase lc : loanCaseRepository.findByConsultantIdAndActiveTrueOrderByCreatedAtDesc(consultant.getId()))
            addLoanDocs(out, lc);
        return out;
    }

    /** Documents across the department's cases (loans → loan cases; other depts → dept cases). */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> forDepartment(User admin) {
        List<Map<String, Object>> out = new ArrayList<>();
        String dept = admin.getDepartment();
        if (dept == null || dept.isBlank() || dept.equalsIgnoreCase("loans")) {
            for (LoanCase lc : loanCaseRepository.findByActiveTrueOrderByCreatedAtDesc())
                addLoanDocs(out, lc);
        } else {
            for (DeptCase dc : deptCaseRepository.findByDepartmentAndActiveTrueOrderByCreatedAtDesc(dept))
                addDeptDocs(out, dc);
        }
        return out;
    }

    private void addLoanDocs(List<Map<String, Object>> out, LoanCase lc) {
        User client = lc.getClient();
        for (LoanCaseDocument d : lc.getDocuments()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("_id", d.getId());
            m.put("id", d.getId());
            m.put("name", d.getName());
            m.put("type", d.getCategory() != null ? d.getCategory() : "Other");
            m.put("size", null);
            m.put("status", mapStatus(d.getStatus()));
            m.put("createdAt", d.getUploadedAt() != null ? d.getUploadedAt() : lc.getCreatedAt());
            m.put("clientId", clientRef(client));
            out.add(m);
        }
    }

    @SuppressWarnings("unchecked")
    private void addDeptDocs(List<Map<String, Object>> out, DeptCase dc) {
        User client = dc.getClient();
        Map<String, Object> data = dc.getData();
        if (data == null || !(data.get("documents") instanceof List<?> docs)) return;
        for (Object o : docs) {
            if (!(o instanceof Map)) continue;
            Map<String, Object> d = (Map<String, Object>) o;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("_id", d.get("_id"));
            m.put("id", d.get("_id"));
            m.put("name", d.get("name"));
            m.put("type", d.getOrDefault("category", "Other"));
            m.put("size", null);
            m.put("status", mapStatus(String.valueOf(d.get("status"))));
            m.put("createdAt", d.get("uploadedAt") != null ? d.get("uploadedAt") : dc.getCreatedAt());
            m.put("clientId", clientRef(client));
            out.add(m);
        }
    }

    private Map<String, Object> clientRef(User u) {
        if (u == null) return null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        return m;
    }

    /** Map case-document statuses onto the labels the page renders (Signed / Pending Sign / Uploaded). */
    private String mapStatus(String s) {
        if (s == null) return "Uploaded";
        return switch (s) {
            case "Verified" -> "Signed";
            case "Pending", "Rejected" -> "Pending Sign";
            case "Uploaded" -> "Uploaded";
            default -> s;
        };
    }
}

package com.finbridge.service;

import com.finbridge.entity.Lead;
import com.finbridge.entity.LeadNote;
import com.finbridge.entity.User;
import com.finbridge.exception.ResourceNotFoundException;
import com.finbridge.repository.LeadRepository;
import com.finbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeadService {
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final SequenceGenerator sequenceGenerator;

    /** Result of converting a lead into a client account. */
    public record ConversionResult(boolean isNewClient, String tempPassword, User client) {}

    public List<Lead> getAll() { return leadRepository.findByActiveTrueOrderByCreatedAtDesc(); }
    public List<Lead> getByDepartment(String dept) { return leadRepository.findByDepartmentAndActiveTrue(dept); }

    /** Filtered, non-paginated list for the CRM/department views. */
    @Transactional(readOnly = true)
    public List<Lead> getFiltered(String department, String status) {
        return leadRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(l -> department == null || department.equalsIgnoreCase(l.getDepartment()))
                .filter(l -> status == null || status.equalsIgnoreCase(l.getStatus()))
                .toList();
    }

    public Page<Lead> getAll(String department, String status, Pageable pageable) {
        if (department != null && status != null)
            return leadRepository.findByDepartmentAndStatusAndActiveTrue(department, status, pageable);
        if (department != null)
            return leadRepository.findByDepartmentAndActiveTrue(department, pageable);
        if (status != null)
            return leadRepository.findByStatusAndActiveTrue(status, pageable);
        return leadRepository.findByActiveTrue(pageable);
    }

    public Lead getById(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
    }

    @Transactional
    public Lead create(Lead lead) {
        lead.setLeadId(sequenceGenerator.next(SequenceGenerator.Seq.LEAD));
        lead.setScore(calculateScore(lead));
        lead.setPriority(scoreToPriority(lead.getScore()));
        Lead saved = leadRepository.save(lead);
        log.info("Lead created: {} score={} priority={}", saved.getLeadId(), saved.getScore(), saved.getPriority());
        return saved;
    }

    @Transactional
    public Lead update(UUID id, com.finbridge.dto.LeadUpdateRequest patch) {
        Lead lead = getById(id);
        if (patch.name() != null)        lead.setName(patch.name());
        if (patch.email() != null)       lead.setEmail(patch.email());
        if (patch.phone() != null)       lead.setPhone(patch.phone());
        if (patch.income() != null)      lead.setIncome(patch.income());
        if (patch.requirement() != null) lead.setRequirement(patch.requirement());
        if (patch.budget() != null)      lead.setBudget(patch.budget());
        if (patch.source() != null)      lead.setSource(patch.source());
        if (patch.serviceType() != null) lead.setServiceType(patch.serviceType());
        if (patch.status() != null)      lead.setStatus(patch.status());
        if (patch.department() != null)  lead.setDepartment(patch.department());
        if (patch.priority() != null)    lead.setPriority(patch.priority());
        if (patch.score() != null)       lead.setScore(patch.score());
        if (patch.assignedConsultant() != null)
            userRepository.findById(patch.assignedConsultant()).ifPresent(lead::setAssignedConsultant);
        if (patch.followUpDate() != null) lead.setFollowUpDate(patch.followUpDate());
        return leadRepository.save(lead);
    }

    @Transactional
    public Lead addNote(UUID id, String text, String addedBy) {
        Lead lead = getById(id);
        LeadNote note = new LeadNote();
        note.setLead(lead);
        note.setText(text);
        note.setAddedBy(addedBy);
        note.setAddedAt(Instant.now());
        lead.getNotes().add(note);
        return leadRepository.save(lead);
    }

    /** Routes a lead to a department, marks it assigned, logs a note, and notifies the dept admins. */
    @Transactional
    public Lead sendToDepartment(UUID id, String department, String notes, String actorName) {
        Lead lead = getById(id);
        lead.setDepartment(department);
        if (!"won".equals(lead.getStatus())) lead.setStatus("assigned");
        if (notes != null && !notes.isBlank()) {
            LeadNote note = new LeadNote();
            note.setLead(lead);
            note.setText("Routed to " + department + ": " + notes);
            note.setAddedBy(actorName != null ? actorName : "CRM");
            note.setAddedAt(Instant.now());
            lead.getNotes().add(note);
        }
        Lead saved = leadRepository.save(lead);

        // Notify every department admin for this department.
        for (User admin : userRepository.findByRoleAndDepartmentAndActiveTrue("department-admin", department)) {
            notificationService.create(admin, "lead",
                    "New lead routed to " + department,
                    "Lead " + lead.getName() + " (" + lead.getLeadId() + ") has been assigned to your department.");
        }
        log.info("Lead {} routed to department {}", lead.getLeadId(), department);
        return saved;
    }

    /** Converts a lead into a client user account (creating one if needed) and marks it won. */
    @Transactional
    public ConversionResult convertToClient(UUID id) {
        Lead lead = getById(id);
        lead.setStatus("won");

        User existing = userRepository.findByEmailIgnoreCase(lead.getEmail()).orElse(null);
        if (existing != null) {
            lead.setConvertedClient(existing);
            leadRepository.save(lead);
            return new ConversionResult(false, null, existing);
        }

        String tempPassword = "FB" + UUID.randomUUID().toString().substring(0, 8);
        User client = new User();
        client.setName(lead.getName());
        client.setEmail(lead.getEmail());
        client.setPhone(lead.getPhone());
        client.setRole("client");
        client.setDepartment(lead.getDepartment());
        client.setPassword(passwordEncoder.encode(tempPassword));
        User savedClient = userRepository.save(client);

        lead.setConvertedClient(savedClient);
        leadRepository.save(lead);
        log.info("Lead {} converted to new client {}", lead.getLeadId(), savedClient.getEmail());
        return new ConversionResult(true, tempPassword, savedClient);
    }

    /** Rich pipeline stats grouped by status, priority, department and source for CRM dashboards. */
    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        List<Lead> leads = leadRepository.findByActiveTrueOrderByCreatedAtDesc();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("pipeline",     countList(leads, Lead::getStatus, "status"));
        out.put("byPriority",   countList(leads, Lead::getPriority, "_id"));
        out.put("byDepartment", countList(leads, l -> l.getDepartment() == null ? "unassigned" : l.getDepartment(), "_id"));
        out.put("bySource",     countList(leads, Lead::getSource, "_id"));
        out.put("total",        (long) leads.size());
        return out;
    }

    private List<Map<String, Object>> countList(List<Lead> leads,
            java.util.function.Function<Lead, String> key, String keyName) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Lead l : leads) {
            String k = key.apply(l);
            if (k == null) continue;
            counts.merge(k, 1L, Long::sum);
        }
        return counts.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put(keyName, e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                .toList();
    }

    private int calculateScore(Lead lead) {
        int score = 0;
        if (lead.getIncome() != null) {
            double income = lead.getIncome().doubleValue();
            if (income >= 1500000) score += 35;
            else if (income >= 600000) score += 20;
        }
        if (lead.getBudget() != null) {
            double budget = lead.getBudget().doubleValue();
            if (budget >= 10000000) score += 35;
            else if (budget >= 3000000) score += 20;
        }
        if (lead.getRequirement() != null && !lead.getRequirement().isBlank()) score += 15;
        if (lead.getPhone() != null && !lead.getPhone().isBlank()) score += 10;
        if (lead.getEmail() != null && !lead.getEmail().isBlank()) score += 5;
        return Math.min(score, 100);
    }

    private String scoreToPriority(int score) {
        if (score >= 65) return "hot";
        if (score >= 35) return "warm";
        return "cold";
    }
}

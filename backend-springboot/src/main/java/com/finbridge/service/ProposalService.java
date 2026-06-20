package com.finbridge.service;

import com.finbridge.dto.DtoMapper;
import com.finbridge.dto.ProposalRequest;
import com.finbridge.dto.ProposalResponse;
import com.finbridge.entity.OrganizationProposal;
import com.finbridge.entity.OrganizationUser;
import com.finbridge.entity.Proposal;
import com.finbridge.entity.User;
import com.finbridge.exception.ResourceNotFoundException;
import com.finbridge.repository.OrganizationProposalRepository;
import com.finbridge.repository.OrganizationUserRepository;
import com.finbridge.repository.ProposalRepository;
import com.finbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProposalService {
    private final ProposalRepository proposalRepository;
    private final UserRepository userRepository;
    private final com.finbridge.repository.LeadRepository leadRepository;
    private final OrganizationUserRepository orgUserRepository;
    private final OrganizationProposalRepository orgProposalRepository;
    private final DtoMapper mapper;

    /** Proposals relevant to the user (consultant/client/department-admin), optional department override. */
    @Transactional(readOnly = true)
    public List<ProposalResponse> getForUser(User user, String department) {
        List<Proposal> list;
        if (department != null) {
            list = proposalRepository.findByDepartmentAndActiveTrueOrderByCreatedAtDesc(department);
        } else {
            list = switch (user.getRole()) {
                case "consultant" -> proposalRepository.findByConsultantIdAndActiveTrueOrderByCreatedAtDesc(user.getId());
                case "department-admin" -> user.getDepartment() != null
                        ? proposalRepository.findByDepartmentAndActiveTrueOrderByCreatedAtDesc(user.getDepartment())
                        : proposalRepository.findByActiveTrueOrderByCreatedAtDesc();
                case "admin", "super-admin", "crm-admin" -> proposalRepository.findByActiveTrueOrderByCreatedAtDesc();
                default -> proposalRepository.findByClientIdAndActiveTrueOrderByCreatedAtDesc(user.getId());
            };
        }
        return list.stream().map(mapper::toProposalResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProposalResponse getResponse(UUID id) { return mapper.toProposalResponse(getById(id)); }

    public Proposal getById(UUID id) {
        return proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found: " + id));
    }

    /** The proposal form sends a calendar date; the entity stores an Instant. Convert at the boundary. */
    private static java.time.Instant toInstant(java.time.LocalDate d) {
        return d == null ? null : d.atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    @Transactional
    public void delete(UUID id) {
        Proposal p = getById(id);
        p.setActive(false);
        proposalRepository.save(p);
    }

    @Transactional
    public ProposalResponse create(ProposalRequest r, User currentUser) {
        Proposal p = new Proposal();
        p.setConsultant(currentUser);
        User client = null;
        if (r.clientId() != null) {
            client = userRepository.findById(r.clientId()).orElse(null);
            p.setClient(client);
        }
        if (r.leadId() != null) leadRepository.findById(r.leadId()).ifPresent(p::setLead);
        p.setDepartment(r.department());
        p.setTitle(r.title());
        p.setSummary(r.summary());
        p.setDetails(r.details());
        p.setValidUntil(toInstant(r.validUntil()));
        p.setStatus("draft");
        ProposalResponse response = mapper.toProposalResponse(proposalRepository.save(p));
        // NOTE: a draft is NOT pushed to the B2B portal — the org should only see a proposal
        // once it is actually sent. The sync happens in updateStatus() on status="sent".
        return response;
    }

    @Transactional
    public ProposalResponse update(UUID id, ProposalRequest r) {
        Proposal p = getById(id);
        if (r.title() != null) p.setTitle(r.title());
        if (r.summary() != null) p.setSummary(r.summary());
        if (r.details() != null) p.setDetails(r.details());
        if (r.validUntil() != null) p.setValidUntil(toInstant(r.validUntil()));
        return mapper.toProposalResponse(proposalRepository.save(p));
    }

    /** Status update (send / approve / reject / request-changes), with optional client feedback. */
    @Transactional
    public ProposalResponse updateStatus(UUID id, String status, String feedback) {
        Proposal p = getById(id);
        if (status != null) p.setStatus(status);
        if (feedback != null) p.setClientFeedback(feedback);
        ProposalResponse response = mapper.toProposalResponse(proposalRepository.save(p));

        // When a proposal is sent, push it to the client's B2B portal (if the client is an org user).
        if ("sent".equals(status)) syncToOrgProposal(p);

        return response;
    }

    /**
     * If the proposal's client is also a B2B organization user, mirror it into the org's portal as an
     * OrganizationProposal. Idempotent: re-sending updates the existing mirror instead of duplicating it.
     */
    private void syncToOrgProposal(Proposal p) {
        User client = p.getClient();
        if (client == null || client.getEmail() == null) return;
        orgUserRepository.findByEmailIgnoreCase(client.getEmail()).ifPresent(orgUser -> {
            UUID orgId = orgUser.getOrganization().getId();
            // Reuse an existing mirror for the same org + title + department instead of creating a duplicate.
            OrganizationProposal op = orgProposalRepository.findByOrganizationIdAndActiveTrue(orgId).stream()
                    .filter(e -> p.getTitle() != null && p.getTitle().equals(e.getTitle())
                            && java.util.Objects.equals(p.getDepartment(), e.getDepartment()))
                    .findFirst()
                    .orElseGet(OrganizationProposal::new);
            op.setOrganization(orgUser.getOrganization());
            op.setConsultant(p.getConsultant());   // required (NOT NULL) — was missing, broke the sync
            op.setDepartment(p.getDepartment());
            op.setTitle(p.getTitle());
            op.setSummary(p.getSummary());
            op.setDetails(p.getDetails());
            op.setStatus("sent");
            if (p.getValidUntil() != null) {
                op.setValidUntil(p.getValidUntil().atZone(ZoneId.systemDefault()).toLocalDate());
            }
            orgProposalRepository.save(op);
            log.info("Synced proposal '{}' to organization {} as B2B proposal", p.getTitle(), orgId);
        });
    }
}

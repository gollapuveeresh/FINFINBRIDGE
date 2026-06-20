package com.finbridge.service;

import com.finbridge.dto.ConsultationResponse;
import com.finbridge.entity.Consultation;
import com.finbridge.entity.User;
import com.finbridge.exception.ResourceNotFoundException;
import com.finbridge.repository.ConsultationRepository;
import com.finbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationService {
    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;

    /** Returns consultations relevant to the given user based on their role. */
    @Transactional(readOnly = true)
    public List<ConsultationResponse> getForUser(User user) {
        List<Consultation> list = switch (user.getRole()) {
            case "consultant" -> consultationRepository.findByConsultantIdOrderByCreatedAtDesc(user.getId());
            case "department-admin" -> user.getDepartment() != null
                    ? consultationRepository.findByDepartmentOrderByCreatedAtDesc(user.getDepartment())
                    : consultationRepository.findAllByOrderByCreatedAtDesc();
            case "admin", "super-admin", "crm-admin" -> consultationRepository.findAllByOrderByCreatedAtDesc();
            default -> consultationRepository.findByClientIdOrderByCreatedAtDesc(user.getId());
        };
        return list.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ConsultationResponse getOne(@NonNull UUID id) {
        return toResponse(load(id));
    }

    @Transactional
    public ConsultationResponse create(Consultation c) {
        return toResponse(consultationRepository.save(c));
    }

    @Transactional
    public ConsultationResponse accept(@NonNull UUID id, String confirmedDate, String confirmedTime) {
        Consultation c = load(id);
        c.setStatus("accepted");
        if (confirmedDate != null) c.setConfirmedDate(confirmedDate);
        if (confirmedTime != null) c.setConfirmedTime(confirmedTime);
        return toResponse(consultationRepository.save(c));
    }

    @Transactional
    public ConsultationResponse assign(@NonNull UUID id, @NonNull UUID consultantId) {
        Consultation c = load(id);
        User consultant = userRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultant not found: " + consultantId));
        c.setConsultant(consultant);
        if ("pending".equals(c.getStatus())) c.setStatus("assigned");
        return toResponse(consultationRepository.save(c));
    }

    @Transactional
    public ConsultationResponse update(@NonNull UUID id, Consultation patch) {
        Consultation c = load(id);
        if (patch.getStatus() != null) c.setStatus(patch.getStatus());
        if (patch.getConfirmedDate() != null) c.setConfirmedDate(patch.getConfirmedDate());
        if (patch.getConfirmedTime() != null) c.setConfirmedTime(patch.getConfirmedTime());
        if (patch.getMeetingLink() != null) c.setMeetingLink(patch.getMeetingLink());
        return toResponse(consultationRepository.save(c));
    }

    private Consultation load(@NonNull UUID id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found: " + id));
    }

    private ConsultationResponse toResponse(Consultation c) {
        ConsultationResponse.Ref client = c.getClient() != null
                ? new ConsultationResponse.Ref(c.getClient().getId(), c.getClient().getName(),
                    c.getClient().getEmail(), c.getClient().getCompanyName()) : null;
        ConsultationResponse.Ref consultant = c.getConsultant() != null
                ? new ConsultationResponse.Ref(c.getConsultant().getId(), c.getConsultant().getName(),
                    c.getConsultant().getEmail(), c.getConsultant().getCompanyName()) : null;
        return new ConsultationResponse(
                c.getId(), client, consultant, c.getDepartment(), c.getCategory(),
                c.getStatus(), c.getClientNotes(), c.getConfirmedDate(), c.getConfirmedTime(),
                c.getMeetingLink(), c.getCreatedAt()
        );
    }
}

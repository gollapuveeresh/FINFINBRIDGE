package com.finbridge.repository;

import com.finbridge.entity.CaseRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CaseRecommendationRepository extends JpaRepository<CaseRecommendation, UUID> {
    Optional<CaseRecommendation> findByCaseId(UUID caseId);
    List<CaseRecommendation> findByClientId(UUID clientId);
    List<CaseRecommendation> findByOrganizationId(UUID organizationId);
    List<CaseRecommendation> findByOrderByGeneratedAtDesc();
}

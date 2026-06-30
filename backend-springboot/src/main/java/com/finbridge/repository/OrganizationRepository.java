package com.finbridge.repository;

import com.finbridge.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    Optional<Organization> findByGstin(String gstin);
    List<Organization> findByStatus(String status);
    List<Organization> findByIndustry(String industry);

    @org.springframework.data.jpa.repository.Query("SELECT o.selectedPackage, COUNT(o) FROM Organization o WHERE o.selectedPackage IS NOT NULL GROUP BY o.selectedPackage")
    List<Object[]> countBySelectedPackage();
}

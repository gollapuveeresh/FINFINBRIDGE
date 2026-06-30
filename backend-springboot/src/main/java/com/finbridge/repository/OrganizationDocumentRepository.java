package com.finbridge.repository;

import com.finbridge.entity.OrganizationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationDocumentRepository extends JpaRepository<OrganizationDocument, UUID> {
    List<OrganizationDocument> findByOrganizationId(UUID organizationId);
    List<OrganizationDocument> findByOrganizationIdAndStatus(UUID organizationId, String status);
    List<OrganizationDocument> findByStatus(String status);

    @Query("SELECT d.id as id, d.documentType as documentType, d.fileName as fileName, " +
           "d.status as status, d.reviewerNote as reviewerNote, d.reviewedAt as reviewedAt, " +
           "d.createdAt as createdAt, o.id as organizationId, o.companyName as companyName, " +
           "o.kycVerified as kycVerified " +
           "FROM OrganizationDocument d JOIN d.organization o")
    List<DocumentSummaryProjection> findAllSummaries();
}

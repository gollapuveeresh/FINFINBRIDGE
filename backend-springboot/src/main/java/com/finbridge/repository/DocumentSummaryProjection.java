package com.finbridge.repository;

import java.time.Instant;
import java.util.UUID;

public interface DocumentSummaryProjection {
    UUID getId();
    String getDocumentType();
    String getFileName();
    String getStatus();
    String getReviewerNote();
    Instant getReviewedAt();
    Instant getCreatedAt();
    UUID getOrganizationId();
    String getCompanyName();
    Boolean getKycVerified();
}

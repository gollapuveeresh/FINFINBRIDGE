package com.finbridge.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "case_recommendations")
public class CaseRecommendation {
    @Id @GeneratedValue private UUID id;
    
    @Column(name = "case_id", nullable = false)
    private UUID caseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id")
    private User consultant;

    @Column(nullable = false)
    private String department;

    @Column(name = "recommendation_data", nullable = false, columnDefinition = "TEXT")
    private String recommendationData;

    @Column(name = "recommendation_notes", columnDefinition = "TEXT")
    private String recommendationNotes;

    @Column(nullable = false)
    private String status = "pending";

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private Instant generatedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

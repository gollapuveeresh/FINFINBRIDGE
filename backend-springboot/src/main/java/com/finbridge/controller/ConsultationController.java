package com.finbridge.controller;

import com.finbridge.dto.ConsultationResponse;
import com.finbridge.entity.Consultation;
import com.finbridge.entity.User;
import com.finbridge.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {
    private final ConsultationService consultationService;

    @GetMapping
    public ResponseEntity<List<ConsultationResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(consultationService.getForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultationResponse> getOne(@PathVariable UUID id) {
        return ResponseEntity.ok(consultationService.getOne(id));
    }

    @PostMapping
    public ResponseEntity<ConsultationResponse> create(@RequestBody Consultation consultation,
                                                @AuthenticationPrincipal User user) {
        consultation.setClient(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(consultationService.create(consultation));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ConsultationResponse> update(@PathVariable UUID id, @RequestBody Consultation patch) {
        return ResponseEntity.ok(consultationService.update(id, patch));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<Map<String, Object>> accept(@PathVariable UUID id,
                                                       @RequestBody Map<String, String> body) {
        ConsultationResponse c = consultationService.accept(id, body.get("confirmedDate"), body.get("confirmedTime"));
        return ResponseEntity.ok(Map.of("status", "success", "consultation", c));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Map<String, Object>> assign(@PathVariable UUID id,
                                                      @RequestBody Map<String, String> body) {
        ConsultationResponse c = consultationService.assign(id, UUID.fromString(body.get("consultantId")));
        return ResponseEntity.ok(Map.of("consultation", c));
    }
}

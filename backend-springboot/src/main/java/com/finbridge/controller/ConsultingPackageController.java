package com.finbridge.controller;

import com.finbridge.entity.ConsultingPackage;
import com.finbridge.repository.ConsultingPackageRepository;
import com.finbridge.security.SecurityRoles;
import com.finbridge.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@Tag(name = "Consulting Packages", description = "Management of consulting packages")
public class ConsultingPackageController {

    private final ConsultingPackageRepository packageRepo;

    @GetMapping
    @Operation(summary = "Get all consulting packages")
    public ResponseEntity<List<ConsultingPackage>> getAll() {
        return ResponseEntity.ok(packageRepo.findAll());
    }

    @GetMapping("/{department}")
    @Operation(summary = "Get consulting packages by department")
    public ResponseEntity<List<ConsultingPackage>> getByDepartment(@PathVariable String department) {
        String deptClean = department.trim().toLowerCase();
        
        // Standardize the mapping to match what's stored in the database:
        // 'loans', 'tax', 'investment', 'insurance', 'wealth'
        if (deptClean.contains("loan")) {
            deptClean = "loans";
        } else if (deptClean.contains("tax")) {
            deptClean = "tax";
        } else if (deptClean.contains("invest")) {
            deptClean = "investment";
        } else if (deptClean.contains("insurance")) {
            deptClean = "insurance";
        } else if (deptClean.contains("wealth")) {
            deptClean = "wealth";
        }

        return ResponseEntity.ok(packageRepo.findByDepartmentIgnoreCaseAndStatus(deptClean, "Active"));
    }

    @PostMapping
    @PreAuthorize(SecurityRoles.ADMINS)
    @Operation(summary = "Create a new consulting package")
    public ResponseEntity<ConsultingPackage> create(@RequestBody ConsultingPackage cp) {
        if (cp.getStatus() == null || cp.getStatus().isBlank()) {
            cp.setStatus("Active");
        }
        if (cp.getDepartment() != null) {
            cp.setDepartment(cp.getDepartment().trim().toLowerCase());
        }
        return ResponseEntity.ok(packageRepo.save(cp));
    }

    @PutMapping("/{id}")
    @PreAuthorize(SecurityRoles.ADMINS)
    @Operation(summary = "Update an existing consulting package")
    public ResponseEntity<ConsultingPackage> update(@PathVariable UUID id, @RequestBody ConsultingPackage cp) {
        ConsultingPackage existing = packageRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        existing.setName(cp.getName());
        existing.setDescription(cp.getDescription());
        if (cp.getDepartment() != null) {
            existing.setDepartment(cp.getDepartment().trim().toLowerCase());
        }
        existing.setPrice(cp.getPrice());
        existing.setDuration(cp.getDuration());
        existing.setFeatures(cp.getFeatures());
        existing.setStatus(cp.getStatus());
        return ResponseEntity.ok(packageRepo.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(SecurityRoles.ADMINS)
    @Operation(summary = "Delete a consulting package")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable UUID id) {
        ConsultingPackage existing = packageRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        packageRepo.delete(existing);
        return ResponseEntity.ok(Map.of("success", true));
    }
}

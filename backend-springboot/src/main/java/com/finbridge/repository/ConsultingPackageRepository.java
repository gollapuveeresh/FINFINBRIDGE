package com.finbridge.repository;

import com.finbridge.entity.ConsultingPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ConsultingPackageRepository extends JpaRepository<ConsultingPackage, UUID> {
    List<ConsultingPackage> findByDepartmentIgnoreCaseAndStatus(String department, String status);
    List<ConsultingPackage> findByDepartmentIgnoreCase(String department);
}

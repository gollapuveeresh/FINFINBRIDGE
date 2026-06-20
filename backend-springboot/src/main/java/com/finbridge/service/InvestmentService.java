package com.finbridge.service;

import com.finbridge.entity.Investment;
import com.finbridge.exception.ResourceNotFoundException;
import com.finbridge.repository.InvestmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.springframework.lang.NonNull;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvestmentService {
    private final InvestmentRepository investmentRepository;

    public List<Investment> getByUser(UUID userId) { return investmentRepository.findByUserIdAndActiveTrue(userId); }

    public Investment getById(UUID id) {
        return investmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found: " + id));
    }

    @Transactional
    public Investment create(Investment inv) { return investmentRepository.save(inv); }

    @Transactional
    public Investment update(UUID id, Investment patch) {
        Investment inv = getById(id);
        if (patch.getCurrentValue() != null) inv.setCurrentValue(patch.getCurrentValue());
        if (patch.getNotes() != null) inv.setNotes(patch.getNotes());
        if (patch.getRiskLevel() != null) inv.setRiskLevel(patch.getRiskLevel());
        return investmentRepository.save(inv);
    }

    @Transactional
    public void softDelete(UUID id) {
        Investment inv = getById(id);
        inv.setActive(false);
        investmentRepository.save(inv);
    }
}

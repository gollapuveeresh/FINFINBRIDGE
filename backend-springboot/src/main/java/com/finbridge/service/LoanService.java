package com.finbridge.service;

import com.finbridge.entity.Loan;
import com.finbridge.exception.ResourceNotFoundException;
import com.finbridge.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoanService {
    private final LoanRepository loanRepository;

    public List<Loan> getByUser(UUID userId) { return loanRepository.findByUserIdAndActiveTrue(userId); }

    public Loan getById(UUID id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + id));
    }

    @Transactional
    public Loan create(Loan loan) { return loanRepository.save(loan); }

    @Transactional
    public Loan update(UUID id, Loan patch) {
        Loan loan = getById(id);
        if (patch.getStatus() != null) loan.setStatus(patch.getStatus());
        if (patch.getOutstandingBalance() != null) loan.setOutstandingBalance(patch.getOutstandingBalance());
        if (patch.getNotes() != null) loan.setNotes(patch.getNotes());
        return loanRepository.save(loan);
    }

    @Transactional
    public void softDelete(UUID id) {
        Loan loan = getById(id);
        loan.setActive(false);
        loanRepository.save(loan);
    }
}

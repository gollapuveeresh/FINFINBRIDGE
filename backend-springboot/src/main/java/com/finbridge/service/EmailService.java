package com.finbridge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void send(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendLeadAssigned(String to, String consultantName, String leadName) {
        send(to, "New Lead Assigned — " + leadName,
            "Hi " + consultantName + ",\n\nA new lead has been assigned to you: " + leadName +
            "\n\nLogin to FinBridge to view details.\n\nFinBridge Team");
    }

    @Async
    public void sendProposalApproved(String to, String clientName, String proposalTitle) {
        send(to, "Proposal Approved — " + proposalTitle,
            "Hi " + clientName + ",\n\nYour proposal '" + proposalTitle + "' has been approved." +
            "\n\nLogin to FinBridge to proceed.\n\nFinBridge Team");
    }

    @Async
    public void sendConsultationScheduled(String to, String name, String date, String time) {
        send(to, "Consultation Scheduled",
            "Hi " + name + ",\n\nYour consultation has been scheduled on " + date + " at " + time +
            ".\n\nFinBridge Team");
    }

    @Async
    public void sendPasswordReset(String to, String resetLink) {
        send(to, "Reset Your Password",
            "Click the link below to reset your password:\n\n" + resetLink +
            "\n\nThis link expires in 1 hour.\n\nFinBridge Team");
    }
}

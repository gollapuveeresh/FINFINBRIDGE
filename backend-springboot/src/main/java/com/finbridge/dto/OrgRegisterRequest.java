package com.finbridge.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrgRegisterRequest {
    private String companyName;
    private String industry;
    private String gstin;
    private String cin;
    private String pan;
    private BigDecimal annualTurnover;
    private Integer employeeCount;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String website;
    private List<String> services;

    // Primary contact / admin user
    private String adminName;
    private String adminEmail;
    private String adminPassword;
    private String adminPhone;
}

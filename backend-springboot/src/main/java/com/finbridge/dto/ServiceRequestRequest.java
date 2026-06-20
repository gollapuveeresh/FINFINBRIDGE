package com.finbridge.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServiceRequestRequest {
    private String departmentId;
    private String title;
    private String description;
    private String priority;
    private BigDecimal amountInvolved;
    private String currency;
    private String notes;
}

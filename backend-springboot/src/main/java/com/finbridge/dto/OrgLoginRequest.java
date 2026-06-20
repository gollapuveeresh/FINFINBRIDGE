package com.finbridge.dto;

import lombok.Data;

@Data
public class OrgLoginRequest {
    private String email;
    private String password;
}

package com.vertexa.keystone.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long id;
    private String organizationName;
    private String contactName;
    private String email;
    private String phone;
    private String address;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
    private int siteCount;
    private int workOrderCount;
}
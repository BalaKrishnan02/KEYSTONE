package com.vertexa.keystone.dto.site;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteResponse {

    private Long id;
    private String name;
    private String address;
    private Long customerId;
    private String customerName;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
    private int workOrderCount;
}
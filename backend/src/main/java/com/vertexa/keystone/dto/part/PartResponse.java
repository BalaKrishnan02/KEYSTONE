package com.vertexa.keystone.dto.part;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartResponse {

    private Long id;
    private String partCode;
    private String name;
    private String description;
    private BigDecimal unitCost;
    private Integer availableStock;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}

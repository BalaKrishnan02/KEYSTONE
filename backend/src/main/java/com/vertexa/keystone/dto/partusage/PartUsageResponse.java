package com.vertexa.keystone.dto.partusage;

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
public class PartUsageResponse {

    private Long id;
    private Long workOrderId;
    private Long partId;
    private String partCode;
    private String partName;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private String loggedByName;
    private Instant loggedAt;
}

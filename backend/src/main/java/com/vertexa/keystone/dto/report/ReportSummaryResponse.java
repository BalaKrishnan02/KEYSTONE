package com.vertexa.keystone.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryResponse {

    private Long totalWorkOrders;
    private Long openWorkOrders;
    private Long completedWorkOrders;
    private BigDecimal totalPartsCost;
    private Integer totalMinutesLogged;
    private double averageCompletionTimeHours;
    private double slaCompliancePercent;
    private Map<String, Long> workOrdersByStatus;
    private Map<String, Long> workOrdersByPriority;
    private Map<String, Long> workOrdersByCustomer;
}

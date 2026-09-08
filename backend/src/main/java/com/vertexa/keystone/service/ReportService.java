package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.*;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import com.vertexa.keystone.dto.report.ReportSummaryResponse;
import com.vertexa.keystone.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportService {

    private final WorkOrderRepository workOrderRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public ReportSummaryResponse getReportSummary(Long customerId) {
        List<WorkOrder> allWorkOrders = getAllWorkOrders(customerId);

        long totalWorkOrders = allWorkOrders.size();

        long openWorkOrders = allWorkOrders.stream()
                .filter(wo -> !wo.getStatus().isTerminal())
                .count();

        long completedWorkOrders = allWorkOrders.stream()
                .filter(wo -> wo.getStatus() == WorkOrderStatus.COMPLETED ||
                        wo.getStatus() == WorkOrderStatus.CLOSED)
                .count();

        BigDecimal totalPartsCost = calculateTotalPartsCost(allWorkOrders);

        int totalMinutesLogged = calculateTotalMinutes(allWorkOrders);

        double averageCompletionTimeHours = calculateAverageCompletionTime(allWorkOrders);

        double slaCompliance = calculateSlaCompliance(allWorkOrders);

        Map<String, Long> workOrdersByStatus = allWorkOrders.stream()
                .collect(Collectors.groupingBy(
                        wo -> wo.getStatus().name(),
                        LinkedHashMap::new,
                        Collectors.counting()));

        Map<String, Long> workOrdersByPriority = allWorkOrders.stream()
                .collect(Collectors.groupingBy(
                        wo -> wo.getPriority().name(),
                        LinkedHashMap::new,
                        Collectors.counting()));

        Map<String, Long> workOrdersByCustomer = allWorkOrders.stream()
                .filter(wo -> wo.getCustomer() != null)
                .collect(Collectors.groupingBy(
                        wo -> wo.getCustomer().getOrganizationName(),
                        LinkedHashMap::new,
                        Collectors.counting()));

        return ReportSummaryResponse.builder()
                .totalWorkOrders(totalWorkOrders)
                .openWorkOrders(openWorkOrders)
                .completedWorkOrders(completedWorkOrders)
                .totalPartsCost(totalPartsCost)
                .totalMinutesLogged(totalMinutesLogged)
                .averageCompletionTimeHours(averageCompletionTimeHours)
                .slaCompliancePercent(slaCompliance)
                .workOrdersByStatus(workOrdersByStatus)
                .workOrdersByPriority(workOrdersByPriority)
                .workOrdersByCustomer(workOrdersByCustomer)
                .build();
    }

    private List<WorkOrder> getAllWorkOrders(Long customerId) {
        if (customerId != null) {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer == null) return List.of();
            return workOrderRepository.findByCustomerAndDeletedFalse(customer);
        }
        return workOrderRepository.searchAllWorkOrders(
                null, null, null, null, null, null, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
    }

    private BigDecimal calculateTotalPartsCost(List<WorkOrder> workOrders) {
        BigDecimal total = BigDecimal.ZERO;
        for (WorkOrder wo : workOrders) {
            Optional<BigDecimal> cost = partUsageRepository.findTotalCostByWorkOrder(wo);
            total = total.add(cost.orElse(BigDecimal.ZERO));
        }
        return total;
    }

    private int calculateTotalMinutes(List<WorkOrder> workOrders) {
        int total = 0;
        for (WorkOrder wo : workOrders) {
            total += timeLogRepository.findTotalMinutesByWorkOrder(wo).orElse(0);
        }
        return total;
    }

    private double calculateAverageCompletionTime(List<WorkOrder> workOrders) {
        List<WorkOrder> completedWithTimes = workOrders.stream()
                .filter(wo -> wo.getCompletedAt() != null)
                .collect(Collectors.toList());

        if (completedWithTimes.isEmpty()) return 0.0;

        double totalHours = completedWithTimes.stream()
                .mapToLong(wo -> Duration.between(wo.getCreatedAt(), wo.getCompletedAt()).toHours())
                .sum();

        return totalHours / completedWithTimes.size();
    }

    private double calculateSlaCompliance(List<WorkOrder> workOrders) {
        List<WorkOrder> completedWorkOrders = workOrders.stream()
                .filter(wo -> wo.getStatus() == WorkOrderStatus.COMPLETED ||
                        wo.getStatus() == WorkOrderStatus.CLOSED)
                .filter(wo -> wo.getCompletedAt() != null && wo.getSlaDueDate() != null)
                .collect(Collectors.toList());

        if (completedWorkOrders.isEmpty()) return 100.0;

        long onTimeCount = completedWorkOrders.stream()
                .filter(wo -> !wo.getCompletedAt().isAfter(wo.getSlaDueDate()))
                .count();

        return (double) onTimeCount / completedWorkOrders.size() * 100.0;
    }
}

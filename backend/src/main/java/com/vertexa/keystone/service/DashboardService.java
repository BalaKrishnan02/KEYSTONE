package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.*;
import com.vertexa.keystone.domain.enums.*;
import com.vertexa.keystone.dto.dashboard.DashboardResponse;
import com.vertexa.keystone.dto.workorder.WorkOrderResponse;
import com.vertexa.keystone.mapper.WorkOrderMapper;
import com.vertexa.keystone.repository.*;
import com.vertexa.keystone.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardService {

    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final NotificationRepository notificationRepository;
    private final WorkOrderMapper workOrderMapper;
    private final SlaService slaService;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long customerId) {
        User currentUser = securityUtils.getCurrentUser();
        UserRole role = currentUser.getRole();

        if (role == UserRole.CUSTOMER) {
            customerId = currentUser.getCustomerId();
        }

        List<WorkOrderStatus> allStatuses = List.of(WorkOrderStatus.values());
        List<WorkOrderStatus> terminalStatuses = List.of(WorkOrderStatus.CLOSED, WorkOrderStatus.CANCELLED);

        long totalWorkOrders;
        if (customerId != null) {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer != null) {
                totalWorkOrders = workOrderRepository.countByCustomerAndDeletedFalse(customer);
            } else {
                totalWorkOrders = 0;
            }
        } else {
            totalWorkOrders = workOrderRepository.countByStatusIn(allStatuses);
        }

        long newCount = countByStatusAndCustomer(WorkOrderStatus.NEW, customerId);
        long assignedCount = countByStatusAndCustomer(WorkOrderStatus.ASSIGNED, customerId);
        long inProgressCount = countByStatusAndCustomer(WorkOrderStatus.IN_PROGRESS, customerId);
        long onHoldCount = countByStatusAndCustomer(WorkOrderStatus.ON_HOLD, customerId);
        long completedCount = countByStatusAndCustomer(WorkOrderStatus.COMPLETED, customerId);
        long closedCount = countByStatusAndCustomer(WorkOrderStatus.CLOSED, customerId);
        long cancelledCount = countByStatusAndCustomer(WorkOrderStatus.CANCELLED, customerId);

        long openWorkOrders = newCount + assignedCount + inProgressCount + onHoldCount;

        Instant now = Instant.now();
        List<WorkOrder> overdueWorkOrders = workOrderRepository.findOverdueWorkOrders(terminalStatuses, now);
        Instant riskThreshold = now.plus(java.time.Duration.ofHours(2));
        List<WorkOrder> atRiskWorkOrders = workOrderRepository.findAtRiskWorkOrders(terminalStatuses, now, riskThreshold);

        long overdueCount = filterByCustomerId(overdueWorkOrders, customerId).size();
        long atRiskCount = filterByCustomerId(atRiskWorkOrders, customerId).size();

        double slaCompliance = calculateSlaCompliance(customerId);

        Map<String, Long> workOrdersByStatus = new LinkedHashMap<>();
        workOrdersByStatus.put("NEW", newCount);
        workOrdersByStatus.put("ASSIGNED", assignedCount);
        workOrdersByStatus.put("IN_PROGRESS", inProgressCount);
        workOrdersByStatus.put("ON_HOLD", onHoldCount);
        workOrdersByStatus.put("COMPLETED", completedCount);
        workOrdersByStatus.put("CLOSED", closedCount);
        workOrdersByStatus.put("CANCELLED", cancelledCount);

        Map<String, Long> workOrdersByPriority = new LinkedHashMap<>();
        for (Priority priority : Priority.values()) {
            workOrdersByPriority.put(priority.name(), countByPriorityAndCustomer(priority, customerId));
        }

        List<DashboardResponse.TechnicianWorkCount> workOrdersByTechnician = getWorkOrdersByTechnician(customerId);

        List<WorkOrder> recentWorkOrders;
        if (customerId != null) {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            recentWorkOrders = customer != null
                    ? workOrderRepository.findByCustomerAndDeletedFalse(customer).stream()
                            .sorted(Comparator.comparing(WorkOrder::getCreatedAt).reversed())
                            .limit(10)
                            .collect(Collectors.toList())
                    : List.of();
        } else {
            recentWorkOrders = workOrderRepository.searchAllWorkOrders(
                    null, null, null, null, null, null, PageRequest.of(0, 10)).getContent();
        }

        List<WorkOrderResponse> recentResponses = recentWorkOrders.stream()
                .map(wo -> {
                    WorkOrderResponse response = workOrderMapper.toResponse(wo);
                    response.setSlaState(slaService.getSlaState(wo));
                    return response;
                })
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalWorkOrders(totalWorkOrders)
                .openWorkOrders(openWorkOrders)
                .completedWorkOrders(completedCount)
                .closedWorkOrders(closedCount)
                .cancelledWorkOrders(cancelledCount)
                .overdueWorkOrders(overdueCount)
                .atRiskWorkOrders(atRiskCount)
                .slaCompliancePercent(slaCompliance)
                .workOrdersByStatus(workOrdersByStatus)
                .workOrdersByPriority(workOrdersByPriority)
                .workOrdersByTechnician(workOrdersByTechnician)
                .recentWorkOrders(recentResponses)
                .build();
    }

    private long countByStatusAndCustomer(WorkOrderStatus status, Long customerId) {
        if (customerId != null) {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer == null) return 0;
            return workOrderRepository.searchAllWorkOrders(
                    status, null, null, customerId, null, null, PageRequest.of(0, 1)).getTotalElements();
        }
        return workOrderRepository.countByStatus(status);
    }

    private long countByPriorityAndCustomer(Priority priority, Long customerId) {
        return workOrderRepository.searchAllWorkOrders(
                null, priority, null, customerId, null, null, PageRequest.of(0, 1)).getTotalElements();
    }

    private List<WorkOrder> filterByCustomerId(List<WorkOrder> workOrders, Long customerId) {
        if (customerId == null) return workOrders;
        return workOrders.stream()
                .filter(wo -> wo.getCustomer().getId().equals(customerId))
                .collect(Collectors.toList());
    }

    private double calculateSlaCompliance(Long customerId) {
        List<WorkOrderStatus> terminalStatuses = List.of(WorkOrderStatus.CLOSED, WorkOrderStatus.CANCELLED);
        List<WorkOrder> completedWorkOrders;

        if (customerId != null) {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer == null) return 0.0;
            completedWorkOrders = workOrderRepository.findByCustomerAndDeletedFalse(customer)
                    .stream()
                    .filter(wo -> wo.getStatus() == WorkOrderStatus.COMPLETED ||
                            wo.getStatus() == WorkOrderStatus.CLOSED)
                    .collect(Collectors.toList());
        } else {
            completedWorkOrders = workOrderRepository.searchAllWorkOrders(
                    WorkOrderStatus.COMPLETED, null, null, null, null, null, PageRequest.of(0, Integer.MAX_VALUE))
                    .getContent();
        }

        if (completedWorkOrders.isEmpty()) return 100.0;

        long onTimeCount = completedWorkOrders.stream()
                .filter(wo -> wo.getCompletedAt() != null && wo.getSlaDueDate() != null)
                .filter(wo -> !wo.getCompletedAt().isAfter(wo.getSlaDueDate()))
                .count();

        return (double) onTimeCount / completedWorkOrders.size() * 100.0;
    }

    private List<DashboardResponse.TechnicianWorkCount> getWorkOrdersByTechnician(Long customerId) {
        List<User> technicians = userRepository.findByRole(UserRole.TECHNICIAN);
        List<DashboardResponse.TechnicianWorkCount> result = new ArrayList<>();

        for (User technician : technicians) {
            long count = workOrderRepository.searchAllWorkOrders(
                    null, null, technician.getId(), customerId, null, null, PageRequest.of(0, 1))
                    .getTotalElements();

            if (count > 0) {
                result.add(DashboardResponse.TechnicianWorkCount.builder()
                        .technicianId(technician.getId())
                        .technicianName(technician.getName())
                        .workOrderCount(count)
                        .build());
            }
        }

        return result.stream()
                .sorted(Comparator.comparing(DashboardResponse.TechnicianWorkCount::getWorkOrderCount).reversed())
                .collect(Collectors.toList());
    }
}

package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.WorkOrder;
import com.vertexa.keystone.domain.enums.Priority;
import com.vertexa.keystone.domain.enums.SLAState;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import com.vertexa.keystone.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SlaService {

    private final WorkOrderRepository workOrderRepository;
    private final NotificationService notificationService;

    @Value("${keystone.sla.low-hours:72}")
    private long lowHours;

    @Value("${keystone.sla.medium-hours:24}")
    private long mediumHours;

    @Value("${keystone.sla.high-hours:8}")
    private long highHours;

    @Value("${keystone.sla.critical-hours:2}")
    private long criticalHours;

    @Transactional(readOnly = true)
    public Instant calculateSlaDueDate(Priority priority) {
        long hours = switch (priority) {
            case LOW -> lowHours;
            case MEDIUM -> mediumHours;
            case HIGH -> highHours;
            case CRITICAL -> criticalHours;
        };
        return Instant.now().plus(Duration.ofHours(hours));
    }

    @Transactional(readOnly = true)
    public SLAState getSlaState(WorkOrder workOrder) {
        if (workOrder.getSlaDueDate() == null) {
            return SLAState.ON_TRACK;
        }

        Instant now = Instant.now();
        Instant dueDate = workOrder.getSlaDueDate();

        if (now.isAfter(dueDate)) {
            return SLAState.BREACHED;
        }

        Duration remaining = Duration.between(now, dueDate);
        if (remaining.toHours() <= 2) {
            return SLAState.AT_RISK;
        }

        return SLAState.ON_TRACK;
    }

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkSlaBreaches() {
        log.info("Running SLA breach check");

        List<WorkOrderStatus> terminalStatuses = List.of(WorkOrderStatus.CLOSED, WorkOrderStatus.CANCELLED);
        Instant now = Instant.now();
        Instant riskThreshold = now.plus(Duration.ofHours(2));

        List<WorkOrder> overdueWorkOrders = workOrderRepository.findOverdueWorkOrders(terminalStatuses, now);
        for (WorkOrder wo : overdueWorkOrders) {
            if (wo.getAssignedTechnician() != null) {
                notificationService.createNotification(
                        wo.getAssignedTechnician(),
                        com.vertexa.keystone.domain.Notification.Type.SLA_BREACHED,
                        "SLA Breached: " + wo.getWorkOrderCode(),
                        "Work order " + wo.getWorkOrderCode() + " has breached its SLA deadline",
                        wo.getId(),
                        "WORK_ORDER"
                );
            }
        }

        List<WorkOrder> atRiskWorkOrders = workOrderRepository.findAtRiskWorkOrders(terminalStatuses, now, riskThreshold);
        for (WorkOrder wo : atRiskWorkOrders) {
            if (wo.getAssignedTechnician() != null) {
                notificationService.createNotification(
                        wo.getAssignedTechnician(),
                        com.vertexa.keystone.domain.Notification.Type.SLA_APPROACHING,
                        "SLA At Risk: " + wo.getWorkOrderCode(),
                        "Work order " + wo.getWorkOrderCode() + " is approaching its SLA deadline",
                        wo.getId(),
                        "WORK_ORDER"
                );
            }
        }

        log.info("SLA check complete. Overdue: {}, At Risk: {}", overdueWorkOrders.size(), atRiskWorkOrders.size());
    }
}

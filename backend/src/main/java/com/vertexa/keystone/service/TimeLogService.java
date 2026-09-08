package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.TimeLog;
import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.WorkOrder;
import com.vertexa.keystone.domain.enums.UserRole;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import com.vertexa.keystone.dto.timelog.TimeLogRequest;
import com.vertexa.keystone.dto.timelog.TimeLogResponse;
import com.vertexa.keystone.exception.ForbiddenOperationException;
import com.vertexa.keystone.exception.ResourceNotFoundException;
import com.vertexa.keystone.mapper.TimeLogMapper;
import com.vertexa.keystone.repository.TimeLogRepository;
import com.vertexa.keystone.repository.WorkOrderRepository;
import com.vertexa.keystone.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final WorkOrderRepository workOrderRepository;
    private final TimeLogMapper timeLogMapper;
    private final SecurityUtils securityUtils;

    @Transactional
    public TimeLogResponse logTime(Long workOrderId, TimeLogRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() != UserRole.TECHNICIAN) {
            throw new ForbiddenOperationException("Only technicians can log time");
        }

        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", workOrderId));

        if (workOrder.getAssignedTechnician() == null ||
                !workOrder.getAssignedTechnician().getId().equals(currentUser.getId())) {
            throw new ForbiddenOperationException("Technician can only log time on assigned work orders");
        }

        if (workOrder.getStatus() != WorkOrderStatus.IN_PROGRESS &&
                workOrder.getStatus() != WorkOrderStatus.ON_HOLD) {
            throw new ForbiddenOperationException("Time can only be logged on work orders that are IN_PROGRESS or ON_HOLD");
        }

        TimeLog timeLog = TimeLog.builder()
                .workOrder(workOrder)
                .technician(currentUser)
                .minutes(request.getMinutes())
                .note(request.getNote())
                .loggedAt(Instant.now())
                .build();

        timeLog = timeLogRepository.save(timeLog);
        log.info("Time logged: {} minutes on work order {} by technician {}",
                request.getMinutes(), workOrder.getWorkOrderCode(), currentUser.getId());

        return timeLogMapper.toResponse(timeLog);
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponse> getTimeLogsByWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", workOrderId));

        return timeLogRepository.findByWorkOrder(workOrder)
                .stream()
                .map(timeLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public int getTotalMinutesByWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", workOrderId));

        return timeLogRepository.findTotalMinutesByWorkOrder(workOrder).orElse(0);
    }
}

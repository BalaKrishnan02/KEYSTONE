package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.Part;
import com.vertexa.keystone.domain.PartUsage;
import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.WorkOrder;
import com.vertexa.keystone.domain.enums.UserRole;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import com.vertexa.keystone.dto.partusage.PartUsageRequest;
import com.vertexa.keystone.dto.partusage.PartUsageResponse;
import com.vertexa.keystone.exception.ForbiddenOperationException;
import com.vertexa.keystone.exception.InsufficientStockException;
import com.vertexa.keystone.exception.ResourceNotFoundException;
import com.vertexa.keystone.mapper.PartUsageMapper;
import com.vertexa.keystone.repository.PartRepository;
import com.vertexa.keystone.repository.PartUsageRepository;
import com.vertexa.keystone.repository.WorkOrderRepository;
import com.vertexa.keystone.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PartUsageService {

    private final PartUsageRepository partUsageRepository;
    private final PartRepository partRepository;
    private final WorkOrderRepository workOrderRepository;
    private final PartUsageMapper partUsageMapper;
    private final SecurityUtils securityUtils;

    @Transactional
    public PartUsageResponse addPartToWorkOrder(Long workOrderId, PartUsageRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() != UserRole.TECHNICIAN) {
            throw new ForbiddenOperationException("Only technicians can add parts to work orders");
        }

        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", workOrderId));

        if (workOrder.getAssignedTechnician() == null ||
                !workOrder.getAssignedTechnician().getId().equals(currentUser.getId())) {
            throw new ForbiddenOperationException("Technician can only add parts to assigned work orders");
        }

        if (workOrder.getStatus() != WorkOrderStatus.IN_PROGRESS &&
                workOrder.getStatus() != WorkOrderStatus.ON_HOLD) {
            throw new ForbiddenOperationException(
                    "Parts can only be added to work orders that are IN_PROGRESS or ON_HOLD");
        }

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part", "id", request.getPartId()));

        if (part.getAvailableStock() < request.getQuantity()) {
            throw new InsufficientStockException(part.getPartCode(), request.getQuantity(), part.getAvailableStock());
        }

        part.setAvailableStock(part.getAvailableStock() - request.getQuantity());
        partRepository.save(part);

        BigDecimal unitCost = part.getUnitCost();
        BigDecimal totalCost = unitCost.multiply(BigDecimal.valueOf(request.getQuantity()));

        PartUsage partUsage = PartUsage.builder()
                .workOrder(workOrder)
                .part(part)
                .quantity(request.getQuantity())
                .unitCost(unitCost)
                .totalCost(totalCost)
                .loggedBy(currentUser)
                .loggedAt(Instant.now())
                .build();

        partUsage = partUsageRepository.save(partUsage);
        log.info("Part {} (qty: {}) added to work order {} by technician {}",
                part.getPartCode(), request.getQuantity(), workOrder.getWorkOrderCode(), currentUser.getId());

        return partUsageMapper.toResponse(partUsage);
    }

    @Transactional(readOnly = true)
    public List<PartUsageResponse> getPartUsagesByWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", workOrderId));

        return partUsageRepository.findByWorkOrder(workOrder)
                .stream()
                .map(partUsageMapper::toResponse)
                .collect(Collectors.toList());
    }
}

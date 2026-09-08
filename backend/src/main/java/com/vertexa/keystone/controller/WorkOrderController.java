package com.vertexa.keystone.controller;

import com.vertexa.keystone.domain.enums.Priority;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import com.vertexa.keystone.domain.WorkOrderStatusHistory;
import com.vertexa.keystone.dto.common.PageResponse;
import com.vertexa.keystone.dto.workorder.*;
import com.vertexa.keystone.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
@Slf4j
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<PageResponse<WorkOrderResponse>> getAllWorkOrders(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<WorkOrderResponse> workOrderPage = workOrderService.getAllWorkOrders(
                status, priority, technicianId, customerId, siteId, search, pageable);
        PageResponse<WorkOrderResponse> response = PageResponse.<WorkOrderResponse>builder()
                .content(workOrderPage.getContent())
                .page(workOrderPage.getNumber())
                .size(workOrderPage.getSize())
                .totalElements(workOrderPage.getTotalElements())
                .totalPages(workOrderPage.getTotalPages())
                .first(workOrderPage.isFirst())
                .last(workOrderPage.isLast())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> createWorkOrder(@Valid @RequestBody WorkOrderRequest request) {
        WorkOrderResponse response = workOrderService.createWorkOrder(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<WorkOrderResponse> getWorkOrderById(@PathVariable Long id) {
        WorkOrderResponse response = workOrderService.getWorkOrderById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderRequest request) {
        WorkOrderResponse response = workOrderService.updateWorkOrder(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderAssignRequest request) {
        WorkOrderResponse response = workOrderService.assignTechnician(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reassign")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> reassignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderAssignRequest request) {
        WorkOrderResponse response = workOrderService.reassignTechnician(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    public ResponseEntity<WorkOrderResponse> transitionStatus(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderStatusRequest request) {
        WorkOrderResponse response = workOrderService.transitionStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<List<WorkOrderStatusHistory>> getWorkOrderHistory(@PathVariable Long id) {
        List<WorkOrderStatusHistory> history = workOrderService.getWorkOrderHistory(id);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/kanban")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<Map<String, List<WorkOrderResponse>>> getKanbanBoard(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) Priority priority) {
        Map<String, List<WorkOrderResponse>> board = workOrderService.getKanbanBoard(
                customerId, technicianId, siteId, priority);
        return ResponseEntity.ok(board);
    }
}

package com.vertexa.keystone.controller;

import com.vertexa.keystone.dto.partusage.PartUsageRequest;
import com.vertexa.keystone.dto.partusage.PartUsageResponse;
import com.vertexa.keystone.service.PartUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders/{workOrderId}/parts")
@RequiredArgsConstructor
@Slf4j
public class PartUsageController {

    private final PartUsageService partUsageService;

    @PostMapping
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<PartUsageResponse> addPartToWorkOrder(
            @PathVariable Long workOrderId,
            @Valid @RequestBody PartUsageRequest request) {
        PartUsageResponse response = partUsageService.addPartToWorkOrder(workOrderId, request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    public ResponseEntity<List<PartUsageResponse>> getPartUsagesByWorkOrder(@PathVariable Long workOrderId) {
        List<PartUsageResponse> response = partUsageService.getPartUsagesByWorkOrder(workOrderId);
        return ResponseEntity.ok(response);
    }
}

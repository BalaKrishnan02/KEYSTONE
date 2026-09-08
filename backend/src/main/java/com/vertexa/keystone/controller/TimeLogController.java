package com.vertexa.keystone.controller;

import com.vertexa.keystone.dto.timelog.TimeLogRequest;
import com.vertexa.keystone.dto.timelog.TimeLogResponse;
import com.vertexa.keystone.service.TimeLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders/{workOrderId}/time")
@RequiredArgsConstructor
@Slf4j
public class TimeLogController {

    private final TimeLogService timeLogService;

    @PostMapping
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TimeLogResponse> logTime(
            @PathVariable Long workOrderId,
            @Valid @RequestBody TimeLogRequest request) {
        TimeLogResponse response = timeLogService.logTime(workOrderId, request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    public ResponseEntity<List<TimeLogResponse>> getTimeLogsByWorkOrder(@PathVariable Long workOrderId) {
        List<TimeLogResponse> response = timeLogService.getTimeLogsByWorkOrder(workOrderId);
        return ResponseEntity.ok(response);
    }
}

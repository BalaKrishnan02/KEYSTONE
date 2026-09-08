package com.vertexa.keystone.controller;

import com.vertexa.keystone.dto.dashboard.DashboardResponse;
import com.vertexa.keystone.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestParam(required = false) Long customerId) {
        DashboardResponse response = dashboardService.getDashboard(customerId);
        return ResponseEntity.ok(response);
    }
}

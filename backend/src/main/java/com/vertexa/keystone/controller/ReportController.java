package com.vertexa.keystone.controller;

import com.vertexa.keystone.dto.report.ReportSummaryResponse;
import com.vertexa.keystone.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<ReportSummaryResponse> getReportSummary(
            @RequestParam(required = false) Long customerId) {
        ReportSummaryResponse response = reportService.getReportSummary(customerId);
        return ResponseEntity.ok(response);
    }
}

package com.vertexa.keystone.controller;

import com.vertexa.keystone.dto.common.PageResponse;
import com.vertexa.keystone.dto.site.SiteRequest;
import com.vertexa.keystone.dto.site.SiteResponse;
import com.vertexa.keystone.service.SiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SiteController {

    private final SiteService siteService;

    @GetMapping("/sites")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<PageResponse<SiteResponse>> getAllSites(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SiteResponse> sitePage = siteService.getAllSites(search, customerId, pageable);
        PageResponse<SiteResponse> response = PageResponse.<SiteResponse>builder()
                .content(sitePage.getContent())
                .page(sitePage.getNumber())
                .size(sitePage.getSize())
                .totalElements(sitePage.getTotalElements())
                .totalPages(sitePage.getTotalPages())
                .first(sitePage.isFirst())
                .last(sitePage.isLast())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customers/{customerId}/sites")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'CUSTOMER')")
    public ResponseEntity<PageResponse<SiteResponse>> getSitesByCustomer(
            @PathVariable Long customerId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SiteResponse> sitePage = siteService.getSitesByCustomer(customerId, search, pageable);
        PageResponse<SiteResponse> response = PageResponse.<SiteResponse>builder()
                .content(sitePage.getContent())
                .page(sitePage.getNumber())
                .size(sitePage.getSize())
                .totalElements(sitePage.getTotalElements())
                .totalPages(sitePage.getTotalPages())
                .first(sitePage.isFirst())
                .last(sitePage.isLast())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/customers/{customerId}/sites")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<SiteResponse> createSite(
            @PathVariable Long customerId,
            @Valid @RequestBody SiteRequest request) {
        SiteResponse response = siteService.createSite(customerId, request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/sites/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'CUSTOMER')")
    public ResponseEntity<SiteResponse> getSiteById(@PathVariable Long id) {
        SiteResponse response = siteService.getSiteById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/sites/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<SiteResponse> updateSite(
            @PathVariable Long id,
            @Valid @RequestBody SiteRequest request) {
        SiteResponse response = siteService.updateSite(id, request);
        return ResponseEntity.ok(response);
    }
}

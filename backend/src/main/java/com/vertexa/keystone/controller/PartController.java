package com.vertexa.keystone.controller;

import com.vertexa.keystone.dto.common.PageResponse;
import com.vertexa.keystone.dto.part.PartRequest;
import com.vertexa.keystone.dto.part.PartResponse;
import com.vertexa.keystone.service.PartService;
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

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
@Slf4j
public class PartController {

    private final PartService partService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    public ResponseEntity<PageResponse<PartResponse>> getAllParts(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PartResponse> partPage = partService.getAllParts(search, pageable);
        PageResponse<PartResponse> response = PageResponse.<PartResponse>builder()
                .content(partPage.getContent())
                .page(partPage.getNumber())
                .size(partPage.getSize())
                .totalElements(partPage.getTotalElements())
                .totalPages(partPage.getTotalPages())
                .first(partPage.isFirst())
                .last(partPage.isLast())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<PartResponse> createPart(@Valid @RequestBody PartRequest request) {
        PartResponse response = partService.createPart(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')")
    public ResponseEntity<PartResponse> getPartById(@PathVariable Long id) {
        PartResponse response = partService.getPartById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<PartResponse> updatePart(
            @PathVariable Long id,
            @Valid @RequestBody PartRequest request) {
        PartResponse response = partService.updatePart(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<PartResponse>> getLowStockParts() {
        List<PartResponse> response = partService.getLowStockParts();
        return ResponseEntity.ok(response);
    }
}

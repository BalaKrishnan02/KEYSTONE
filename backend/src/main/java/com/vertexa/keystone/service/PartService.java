package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.Part;
import com.vertexa.keystone.domain.enums.UserRole;
import com.vertexa.keystone.dto.part.PartRequest;
import com.vertexa.keystone.dto.part.PartResponse;
import com.vertexa.keystone.exception.DuplicateResourceException;
import com.vertexa.keystone.exception.ForbiddenOperationException;
import com.vertexa.keystone.exception.ResourceNotFoundException;
import com.vertexa.keystone.mapper.PartMapper;
import com.vertexa.keystone.repository.PartRepository;
import com.vertexa.keystone.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PartService {

    private final PartRepository partRepository;
    private final PartMapper partMapper;
    private final SecurityUtils securityUtils;

    @Value("${keystone.parts.low-stock-threshold:5}")
    private int lowStockThreshold;

    @Transactional(readOnly = true)
    public Page<PartResponse> getAllParts(String search, Pageable pageable) {
        Page<Part> parts;
        if (search != null && !search.isBlank()) {
            parts = partRepository.searchActiveParts(search, pageable);
        } else {
            parts = partRepository.findByActiveTrue(pageable);
        }
        return parts.map(partMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PartResponse getPartById(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part", "id", id));
        return partMapper.toResponse(part);
    }

    @Transactional
    public PartResponse createPart(PartRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER) {
            throw new ForbiddenOperationException("Only managers can create parts");
        }

        if (partRepository.existsByPartCode(request.getPartCode())) {
            throw new DuplicateResourceException("Part with code '" + request.getPartCode() + "' already exists");
        }

        Part part = Part.builder()
                .partCode(request.getPartCode())
                .name(request.getName())
                .description(request.getDescription())
                .unitCost(request.getUnitCost())
                .availableStock(request.getAvailableStock())
                .active(true)
                .build();

        part = partRepository.save(part);
        log.info("Part created: {} ({})", part.getName(), part.getPartCode());
        return partMapper.toResponse(part);
    }

    @Transactional
    public PartResponse updatePart(Long id, PartRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER) {
            throw new ForbiddenOperationException("Only managers can update parts");
        }

        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part", "id", id));

        part.setPartCode(request.getPartCode());
        part.setName(request.getName());
        part.setDescription(request.getDescription());
        part.setUnitCost(request.getUnitCost());
        part.setAvailableStock(request.getAvailableStock());

        part = partRepository.save(part);
        log.info("Part updated: {} ({})", part.getName(), part.getPartCode());
        return partMapper.toResponse(part);
    }

    @Transactional(readOnly = true)
    public List<PartResponse> getLowStockParts() {
        List<Part> lowStockParts = partRepository.findByAvailableStockLessThanEqual(lowStockThreshold);
        return lowStockParts.stream()
                .map(partMapper::toResponse)
                .collect(Collectors.toList());
    }
}

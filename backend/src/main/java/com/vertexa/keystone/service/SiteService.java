package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.Customer;
import com.vertexa.keystone.domain.Site;
import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.enums.UserRole;
import com.vertexa.keystone.dto.site.SiteRequest;
import com.vertexa.keystone.dto.site.SiteResponse;
import com.vertexa.keystone.exception.DuplicateResourceException;
import com.vertexa.keystone.exception.ForbiddenOperationException;
import com.vertexa.keystone.exception.ResourceNotFoundException;
import com.vertexa.keystone.mapper.SiteMapper;
import com.vertexa.keystone.repository.CustomerRepository;
import com.vertexa.keystone.repository.SiteRepository;
import com.vertexa.keystone.repository.WorkOrderRepository;
import com.vertexa.keystone.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;
    private final CustomerRepository customerRepository;
    private final WorkOrderRepository workOrderRepository;
    private final SiteMapper siteMapper;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public Page<SiteResponse> getAllSites(String search, Long customerId, Pageable pageable) {
        Customer customer = null;
        if (customerId != null) {
            customer = customerRepository.findById(customerId).orElse(null);
        }

        Page<Site> sites = siteRepository.searchAllSites(
                customer,
                (search != null && !search.isBlank()) ? search.trim() : null,
                pageable
        );

        return sites.map(site -> {
            SiteResponse response = siteMapper.toResponse(site);
            long siteWorkOrderCount = workOrderRepository.searchAllWorkOrders(
                    null, null, null, null, site.getId(), null, PageRequest.of(0, 1)).getTotalElements();
            response.setWorkOrderCount((int) siteWorkOrderCount);
            return response;
        });
    }

    @Transactional(readOnly = true)
    public Page<SiteResponse> getSitesByCustomer(Long customerId, String search, Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        UserRole role = currentUser.getRole();

        if (role == UserRole.CUSTOMER) {
            if (currentUser.getCustomerId() == null ||
                    !currentUser.getCustomerId().equals(customerId)) {
                throw new ForbiddenOperationException("Customers can only view their own sites");
            }
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        Page<Site> sites;
        if (search != null && !search.isBlank()) {
            sites = siteRepository.searchByCustomer(customer, search.trim(), pageable);
        } else {
            sites = siteRepository.findByCustomerAndActiveTrue(customer, pageable);
        }

        return sites.map(site -> {
            SiteResponse response = siteMapper.toResponse(site);
            long siteWorkOrderCount = workOrderRepository.searchAllWorkOrders(
                    null, null, null, null, site.getId(), null, PageRequest.of(0, 1)).getTotalElements();
            response.setWorkOrderCount((int) siteWorkOrderCount);
            return response;
        });
    }

    @Transactional(readOnly = true)
    public SiteResponse getSiteById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        UserRole role = currentUser.getRole();

        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site", "id", id));

        if (role == UserRole.CUSTOMER) {
            if (currentUser.getCustomerId() == null ||
                    !currentUser.getCustomerId().equals(site.getCustomer().getId())) {
                throw new ForbiddenOperationException("Customers can only view their own sites");
            }
        }

        SiteResponse response = siteMapper.toResponse(site);
        long siteWorkOrderCount = workOrderRepository.searchAllWorkOrders(
                null, null, null, null, site.getId(), null, PageRequest.of(0, 1)).getTotalElements();
        response.setWorkOrderCount((int) siteWorkOrderCount);
        return response;
    }

    @Transactional
    public SiteResponse createSite(Long customerId, SiteRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER && role != UserRole.DISPATCHER) {
            throw new ForbiddenOperationException("Only managers and dispatchers can create sites");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        if (siteRepository.existsByCustomerAndName(customer, request.getName())) {
            throw new DuplicateResourceException(
                    "Site with name '" + request.getName() + "' already exists for this customer");
        }

        Site site = Site.builder()
                .name(request.getName())
                .address(request.getAddress())
                .customer(customer)
                .active(true)
                .build();

        site = siteRepository.save(site);
        log.info("Site created: {} for customer {}", site.getName(), customer.getId());

        SiteResponse response = siteMapper.toResponse(site);
        response.setWorkOrderCount(0);
        return response;
    }

    @Transactional
    public SiteResponse updateSite(Long id, SiteRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER && role != UserRole.DISPATCHER) {
            throw new ForbiddenOperationException("Only managers and dispatchers can update sites");
        }

        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site", "id", id));

        siteRepository.findByCustomerAndName(site.getCustomer(), request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException(
                                "Site with name '" + request.getName() + "' already exists for this customer");
                    }
                });

        site.setName(request.getName());
        site.setAddress(request.getAddress());

        site = siteRepository.save(site);
        log.info("Site updated: {} ({})", site.getName(), site.getId());

        SiteResponse response = siteMapper.toResponse(site);
        long siteWorkOrderCount = workOrderRepository.searchAllWorkOrders(
                null, null, null, null, site.getId(), null, PageRequest.of(0, 1)).getTotalElements();
        response.setWorkOrderCount((int) siteWorkOrderCount);
        return response;
    }

    @Transactional(readOnly = true)
    public long getSiteCountByCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
        return siteRepository.countByCustomerAndActiveTrue(customer);
    }
}

package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.Customer;
import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.enums.UserRole;
import com.vertexa.keystone.dto.customer.CustomerRequest;
import com.vertexa.keystone.dto.customer.CustomerResponse;
import com.vertexa.keystone.exception.DuplicateResourceException;
import com.vertexa.keystone.exception.ForbiddenOperationException;
import com.vertexa.keystone.exception.ResourceNotFoundException;
import com.vertexa.keystone.mapper.CustomerMapper;
import com.vertexa.keystone.repository.CustomerRepository;
import com.vertexa.keystone.repository.SiteRepository;
import com.vertexa.keystone.repository.WorkOrderRepository;
import com.vertexa.keystone.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final WorkOrderRepository workOrderRepository;
    private final CustomerMapper customerMapper;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(String search, Pageable pageable) {
        Page<Customer> customers;
        if (search != null && !search.isBlank()) {
            customers = customerRepository.searchActiveCustomers(search, pageable);
        } else {
            customers = customerRepository.findByActiveTrue(pageable);
        }
        return customers.map(customer -> {
            CustomerResponse response = customerMapper.toResponse(customer);
            response.setSiteCount((int) siteRepository.countByCustomerAndActiveTrue(customer));
            response.setWorkOrderCount((int) workOrderRepository.countByCustomerAndDeletedFalse(customer));
            return response;
        });
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        UserRole role = currentUser.getRole();

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        if (role == UserRole.CUSTOMER) {
            if (currentUser.getCustomerId() == null || !currentUser.getCustomerId().equals(id)) {
                throw new ForbiddenOperationException("Customers can only view their own profile");
            }
        }

        CustomerResponse response = customerMapper.toResponse(customer);
        response.setSiteCount((int) siteRepository.countByCustomerAndActiveTrue(customer));
        response.setWorkOrderCount((int) workOrderRepository.countByCustomerAndDeletedFalse(customer));
        return response;
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER && role != UserRole.DISPATCHER) {
            throw new ForbiddenOperationException("Only managers and dispatchers can create customers");
        }

        if (customerRepository.existsByOrganizationName(request.getOrganizationName())) {
            throw new DuplicateResourceException(
                    "Customer with organization name '" + request.getOrganizationName() + "' already exists");
        }

        Customer customer = Customer.builder()
                .organizationName(request.getOrganizationName())
                .contactName(request.getContactName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .active(true)
                .build();

        customer = customerRepository.save(customer);
        log.info("Customer created: {} ({})", customer.getOrganizationName(), customer.getId());

        CustomerResponse response = customerMapper.toResponse(customer);
        response.setSiteCount(0);
        response.setWorkOrderCount(0);
        return response;
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER && role != UserRole.DISPATCHER) {
            throw new ForbiddenOperationException("Only managers and dispatchers can update customers");
        }

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        customerRepository.findByOrganizationName(request.getOrganizationName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException(
                                "Customer with organization name '" + request.getOrganizationName() + "' already exists");
                    }
                });

        customer.setOrganizationName(request.getOrganizationName());
        customer.setContactName(request.getContactName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());

        customer = customerRepository.save(customer);
        log.info("Customer updated: {} ({})", customer.getOrganizationName(), customer.getId());

        CustomerResponse response = customerMapper.toResponse(customer);
        response.setSiteCount((int) siteRepository.countByCustomerAndActiveTrue(customer));
        response.setWorkOrderCount((int) workOrderRepository.countByCustomerAndDeletedFalse(customer));
        return response;
    }

    @Transactional(readOnly = true)
    public long getCustomerCount() {
        return customerRepository.countByActiveTrue();
    }
}

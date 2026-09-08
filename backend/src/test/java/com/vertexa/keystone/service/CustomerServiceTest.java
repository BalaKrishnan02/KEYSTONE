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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private SiteRepository siteRepository;
    @Mock
    private WorkOrderRepository workOrderRepository;
    @Mock
    private CustomerMapper customerMapper;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private CustomerService customerService;

    private User managerUser;
    private User dispatcherUser;
    private User customerUser;
    private Customer existingCustomer;

    @BeforeEach
    void setUp() {
        managerUser = User.builder()
                .id(1L)
                .name("Manager One")
                .email("manager@keystone.com")
                .role(UserRole.MANAGER)
                .build();

        dispatcherUser = User.builder()
                .id(2L)
                .name("Dispatcher One")
                .email("dispatcher@keystone.com")
                .role(UserRole.DISPATCHER)
                .build();

        customerUser = User.builder()
                .id(4L)
                .name("Customer One")
                .email("customer@acme.com")
                .role(UserRole.CUSTOMER)
                .customerId(100L)
                .build();

        existingCustomer = Customer.builder()
                .id(100L)
                .organizationName("Acme Corp")
                .contactName("John Doe")
                .email("john@acme.com")
                .phone("555-0100")
                .address("123 Main St")
                .active(true)
                .build();
    }

    @Nested
    @DisplayName("createCustomer")
    class CreateCustomer {

        @Test
        @DisplayName("Manager can create customer")
        void managerCanCreateCustomer() {
            CustomerRequest request = CustomerRequest.builder()
                    .organizationName("Tech Solutions")
                    .contactName("Jane Smith")
                    .email("jane@techsolutions.com")
                    .phone("555-0200")
                    .address("456 Oak Ave")
                    .build();

            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(customerRepository.existsByOrganizationName("Tech Solutions")).thenReturn(false);
            when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
                Customer c = invocation.getArgument(0);
                c.setId(200L);
                return c;
            });
            when(customerMapper.toResponse(any(Customer.class))).thenReturn(buildCustomerResponse());

            CustomerResponse response = customerService.createCustomer(request);

            assertNotNull(response);
            verify(customerRepository).save(any(Customer.class));
        }

        @Test
        @DisplayName("Dispatcher can create customer")
        void dispatcherCanCreateCustomer() {
            CustomerRequest request = CustomerRequest.builder()
                    .organizationName("Tech Solutions")
                    .contactName("Jane Smith")
                    .email("jane@techsolutions.com")
                    .phone("555-0200")
                    .address("456 Oak Ave")
                    .build();

            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.DISPATCHER);
            when(customerRepository.existsByOrganizationName("Tech Solutions")).thenReturn(false);
            when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
                Customer c = invocation.getArgument(0);
                c.setId(200L);
                return c;
            });
            when(customerMapper.toResponse(any(Customer.class))).thenReturn(buildCustomerResponse());

            CustomerResponse response = customerService.createCustomer(request);

            assertNotNull(response);
        }

        @Test
        @DisplayName("Duplicate org name throws DuplicateResourceException")
        void duplicateOrgNameThrowsException() {
            CustomerRequest request = CustomerRequest.builder()
                    .organizationName("Acme Corp")
                    .contactName("Jane Smith")
                    .email("jane@techsolutions.com")
                    .phone("555-0200")
                    .address("456 Oak Ave")
                    .build();

            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(customerRepository.existsByOrganizationName("Acme Corp")).thenReturn(true);

            assertThrows(DuplicateResourceException.class, () -> customerService.createCustomer(request));
        }

        @Test
        @DisplayName("Technician cannot create customer")
        void technicianCannotCreateCustomer() {
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.TECHNICIAN);

            CustomerRequest request = CustomerRequest.builder()
                    .organizationName("Tech Solutions")
                    .build();

            assertThrows(ForbiddenOperationException.class, () -> customerService.createCustomer(request));
        }

        @Test
        @DisplayName("Customer role cannot create customer")
        void customerRoleCannotCreateCustomer() {
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.CUSTOMER);

            CustomerRequest request = CustomerRequest.builder()
                    .organizationName("Tech Solutions")
                    .build();

            assertThrows(ForbiddenOperationException.class, () -> customerService.createCustomer(request));
        }
    }

    @Nested
    @DisplayName("getAllCustomers")
    class GetAllCustomers {

        @Test
        @DisplayName("Search works with search parameter")
        void searchWorks() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Customer> customerPage = new PageImpl<>(Collections.singletonList(existingCustomer), pageable, 1);

            when(customerRepository.searchActiveCustomers("Acme", pageable)).thenReturn(customerPage);
            when(customerMapper.toResponse(any(Customer.class))).thenReturn(buildCustomerResponse());
            when(siteRepository.countByCustomerAndActiveTrue(any())).thenReturn(3L);
            when(workOrderRepository.countByCustomerAndDeletedFalse(any())).thenReturn(5L);

            Page<CustomerResponse> result = customerService.getAllCustomers("Acme", pageable);

            assertEquals(1, result.getContent().size());
            verify(customerRepository).searchActiveCustomers("Acme", pageable);
        }

        @Test
        @DisplayName("Blank search returns all active customers")
        void blankSearchReturnsAll() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Customer> customerPage = new PageImpl<>(Collections.singletonList(existingCustomer), pageable, 1);

            when(customerRepository.findByActiveTrue(pageable)).thenReturn(customerPage);
            when(customerMapper.toResponse(any(Customer.class))).thenReturn(buildCustomerResponse());
            when(siteRepository.countByCustomerAndActiveTrue(any())).thenReturn(3L);
            when(workOrderRepository.countByCustomerAndDeletedFalse(any())).thenReturn(5L);

            Page<CustomerResponse> result = customerService.getAllCustomers(null, pageable);

            assertEquals(1, result.getContent().size());
            verify(customerRepository).findByActiveTrue(pageable);
        }
    }

    @Nested
    @DisplayName("updateCustomer")
    class UpdateCustomer {

        @Test
        @DisplayName("Manager can update customer")
        void managerCanUpdateCustomer() {
            CustomerRequest request = CustomerRequest.builder()
                    .organizationName("Acme Corp Updated")
                    .contactName("John Updated")
                    .email("john.updated@acme.com")
                    .phone("555-0101")
                    .address("123 Main St Updated")
                    .build();

            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(existingCustomer));
            when(customerRepository.findByOrganizationName("Acme Corp Updated")).thenReturn(Optional.empty());
            when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(customerMapper.toResponse(any(Customer.class))).thenReturn(buildCustomerResponse());
            when(siteRepository.countByCustomerAndActiveTrue(any())).thenReturn(3L);
            when(workOrderRepository.countByCustomerAndDeletedFalse(any())).thenReturn(5L);

            CustomerResponse response = customerService.updateCustomer(100L, request);

            assertNotNull(response);
            verify(customerRepository).save(any(Customer.class));
        }

        @Test
        @DisplayName("Update with same org name does not throw duplicate error")
        void updateWithSameOrgNameDoesNotThrow() {
            CustomerRequest request = CustomerRequest.builder()
                    .organizationName("Acme Corp")
                    .contactName("John Updated")
                    .email("john.updated@acme.com")
                    .phone("555-0101")
                    .address("123 Main St Updated")
                    .build();

            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(existingCustomer));
            when(customerRepository.findByOrganizationName("Acme Corp")).thenReturn(Optional.of(existingCustomer));
            when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(customerMapper.toResponse(any(Customer.class))).thenReturn(buildCustomerResponse());
            when(siteRepository.countByCustomerAndActiveTrue(any())).thenReturn(3L);
            when(workOrderRepository.countByCustomerAndDeletedFalse(any())).thenReturn(5L);

            CustomerResponse response = customerService.updateCustomer(100L, request);

            assertNotNull(response);
        }

        @Test
        @DisplayName("Update with different org name that exists throws DuplicateResourceException")
        void updateWithDifferentExistingOrgNameThrows() {
            Customer otherCustomer = Customer.builder()
                    .id(200L)
                    .organizationName("Other Corp")
                    .build();

            CustomerRequest request = CustomerRequest.builder()
                    .organizationName("Other Corp")
                    .contactName("John Updated")
                    .email("john.updated@acme.com")
                    .phone("555-0101")
                    .address("123 Main St Updated")
                    .build();

            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(existingCustomer));
            when(customerRepository.findByOrganizationName("Other Corp")).thenReturn(Optional.of(otherCustomer));

            assertThrows(DuplicateResourceException.class, () -> customerService.updateCustomer(100L, request));
        }

        @Test
        @DisplayName("Customer not found throws exception")
        void customerNotFoundThrows() {
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(customerRepository.findById(999L)).thenReturn(Optional.empty());

            CustomerRequest request = CustomerRequest.builder()
                    .organizationName("Tech Solutions")
                    .contactName("Jane Smith")
                    .email("jane@techsolutions.com")
                    .phone("555-0200")
                    .address("456 Oak Ave")
                    .build();

            assertThrows(ResourceNotFoundException.class, () -> customerService.updateCustomer(999L, request));
        }
    }

    @Nested
    @DisplayName("getCustomerById")
    class GetCustomerById {

        @Test
        @DisplayName("Manager can view any customer")
        void managerCanViewAnyCustomer() {
            when(securityUtils.getCurrentUser()).thenReturn(managerUser);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(existingCustomer));
            when(customerMapper.toResponse(any(Customer.class))).thenReturn(buildCustomerResponse());
            when(siteRepository.countByCustomerAndActiveTrue(any())).thenReturn(3L);
            when(workOrderRepository.countByCustomerAndDeletedFalse(any())).thenReturn(5L);

            CustomerResponse response = customerService.getCustomerById(100L);

            assertNotNull(response);
        }

        @Test
        @DisplayName("Customer can view own profile")
        void customerCanViewOwnProfile() {
            when(securityUtils.getCurrentUser()).thenReturn(customerUser);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(existingCustomer));
            when(customerMapper.toResponse(any(Customer.class))).thenReturn(buildCustomerResponse());
            when(siteRepository.countByCustomerAndActiveTrue(any())).thenReturn(3L);
            when(workOrderRepository.countByCustomerAndDeletedFalse(any())).thenReturn(5L);

            CustomerResponse response = customerService.getCustomerById(100L);

            assertNotNull(response);
        }

        @Test
        @DisplayName("Customer cannot view another customer's profile")
        void customerCannotViewOtherProfile() {
            User otherCustomerUser = User.builder()
                    .id(5L)
                    .name("Other Customer")
                    .email("other@other.com")
                    .role(UserRole.CUSTOMER)
                    .customerId(999L)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(otherCustomerUser);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(existingCustomer));

            assertThrows(ForbiddenOperationException.class, () -> customerService.getCustomerById(100L));
        }

        @Test
        @DisplayName("Customer not found throws exception")
        void customerNotFound() {
            when(securityUtils.getCurrentUser()).thenReturn(managerUser);
            when(customerRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> customerService.getCustomerById(999L));
        }
    }

    private CustomerResponse buildCustomerResponse() {
        return CustomerResponse.builder()
                .id(100L)
                .organizationName("Acme Corp")
                .contactName("John Doe")
                .email("john@acme.com")
                .phone("555-0100")
                .address("123 Main St")
                .active(true)
                .siteCount(3)
                .workOrderCount(5)
                .build();
    }
}

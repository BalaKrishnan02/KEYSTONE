package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.*;
import com.vertexa.keystone.domain.enums.*;
import com.vertexa.keystone.dto.partusage.PartUsageRequest;
import com.vertexa.keystone.dto.partusage.PartUsageResponse;
import com.vertexa.keystone.exception.ForbiddenOperationException;
import com.vertexa.keystone.exception.InsufficientStockException;
import com.vertexa.keystone.exception.ResourceNotFoundException;
import com.vertexa.keystone.mapper.PartUsageMapper;
import com.vertexa.keystone.repository.PartRepository;
import com.vertexa.keystone.repository.PartUsageRepository;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartUsageServiceTest {

    @Mock
    private PartUsageRepository partUsageRepository;
    @Mock
    private PartRepository partRepository;
    @Mock
    private WorkOrderRepository workOrderRepository;
    @Mock
    private PartUsageMapper partUsageMapper;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private PartUsageService partUsageService;

    private User technicianUser;
    private User managerUser;
    private WorkOrder workOrder;
    private Part part;

    @BeforeEach
    void setUp() {
        technicianUser = User.builder()
                .id(3L)
                .name("Technician One")
                .email("tech@keystone.com")
                .role(UserRole.TECHNICIAN)
                .build();

        managerUser = User.builder()
                .id(1L)
                .name("Manager One")
                .email("manager@keystone.com")
                .role(UserRole.MANAGER)
                .build();

        Customer customer = Customer.builder()
                .id(100L)
                .organizationName("Acme Corp")
                .contactName("John Doe")
                .email("john@acme.com")
                .phone("555-0100")
                .address("123 Main St")
                .active(true)
                .build();

        Site site = Site.builder()
                .id(200L)
                .name("Headquarters")
                .address("123 Main St")
                .customer(customer)
                .active(true)
                .build();

        workOrder = WorkOrder.builder()
                .id(500L)
                .workOrderCode("WO-2026-000001")
                .title("HVAC Repair")
                .priority(Priority.HIGH)
                .status(WorkOrderStatus.IN_PROGRESS)
                .customer(customer)
                .site(site)
                .assignedTechnician(technicianUser)
                .createdBy(managerUser)
                .slaDueDate(Instant.now().plus(8, ChronoUnit.HOURS))
                .build();

        part = Part.builder()
                .id(10L)
                .partCode("PART-001")
                .name("Filter")
                .unitCost(new BigDecimal("25.50"))
                .availableStock(50)
                .active(true)
                .build();
    }

    @Nested
    @DisplayName("addPartToWorkOrder")
    class AddPartToWorkOrder {

        @Test
        @DisplayName("Successful part usage decreases stock")
        void successfulPartUsageDecreasesStock() {
            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(10L)
                    .quantity(3)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(partRepository.findById(10L)).thenReturn(Optional.of(part));
            when(partUsageRepository.save(any(PartUsage.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(partUsageMapper.toResponse(any(PartUsage.class))).thenReturn(buildPartUsageResponse());

            partUsageService.addPartToWorkOrder(500L, request);

            assertEquals(47, part.getAvailableStock());
            verify(partRepository).save(part);
        }

        @Test
        @DisplayName("Insufficient stock throws InsufficientStockException")
        void insufficientStockThrowsException() {
            part.setAvailableStock(2);

            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(10L)
                    .quantity(5)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(partRepository.findById(10L)).thenReturn(Optional.of(part));

            InsufficientStockException exception = assertThrows(InsufficientStockException.class,
                    () -> partUsageService.addPartToWorkOrder(500L, request));

            assertEquals("PART-001", exception.getPartCode());
            assertEquals(5, exception.getRequested());
            assertEquals(2, exception.getAvailable());
        }

        @Test
        @DisplayName("Stock never goes negative")
        void stockNeverGoesNegative() {
            part.setAvailableStock(0);

            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(10L)
                    .quantity(1)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(partRepository.findById(10L)).thenReturn(Optional.of(part));

            assertThrows(InsufficientStockException.class,
                    () -> partUsageService.addPartToWorkOrder(500L, request));

            assertEquals(0, part.getAvailableStock());
        }

        @Test
        @DisplayName("Cost calculation is correct (quantity * unitCost)")
        void costCalculationIsCorrect() {
            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(10L)
                    .quantity(4)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(partRepository.findById(10L)).thenReturn(Optional.of(part));
            when(partUsageRepository.save(any(PartUsage.class))).thenAnswer(invocation -> {
                PartUsage pu = invocation.getArgument(0);
                pu.setId(1L);
                return pu;
            });
            when(partUsageMapper.toResponse(any(PartUsage.class))).thenReturn(buildPartUsageResponse());

            partUsageService.addPartToWorkOrder(500L, request);

            verify(partUsageRepository).save(argThat(pu ->
                    pu.getTotalCost().equals(new BigDecimal("102.00")) &&
                    pu.getUnitCost().equals(new BigDecimal("25.50")) &&
                    pu.getQuantity() == 4
            ));
        }

        @Test
        @DisplayName("Only assigned technician can add parts")
        void onlyAssignedTechnicianCanAddParts() {
            User otherTechnician = User.builder()
                    .id(99L)
                    .name("Other Tech")
                    .email("other@keystone.com")
                    .role(UserRole.TECHNICIAN)
                    .build();

            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(10L)
                    .quantity(1)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(otherTechnician);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));

            assertThrows(ForbiddenOperationException.class,
                    () -> partUsageService.addPartToWorkOrder(500L, request));
        }

        @Test
        @DisplayName("Non-technician cannot add parts")
        void nonTechnicianCannotAddParts() {
            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(10L)
                    .quantity(1)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(managerUser);

            assertThrows(ForbiddenOperationException.class,
                    () -> partUsageService.addPartToWorkOrder(500L, request));
        }

        @Test
        @DisplayName("Cannot add parts to non-assigned work order status")
        void cannotAddPartsToNewWorkOrder() {
            workOrder.setStatus(WorkOrderStatus.NEW);

            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(10L)
                    .quantity(1)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));

            assertThrows(ForbiddenOperationException.class,
                    () -> partUsageService.addPartToWorkOrder(500L, request));
        }

        @Test
        @DisplayName("Can add parts when work order is ON_HOLD")
        void canAddPartsWhenOnHold() {
            workOrder.setStatus(WorkOrderStatus.ON_HOLD);

            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(10L)
                    .quantity(2)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(partRepository.findById(10L)).thenReturn(Optional.of(part));
            when(partUsageRepository.save(any(PartUsage.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(partUsageMapper.toResponse(any(PartUsage.class))).thenReturn(buildPartUsageResponse());

            partUsageService.addPartToWorkOrder(500L, request);

            assertEquals(48, part.getAvailableStock());
        }

        @Test
        @DisplayName("Work order not found throws exception")
        void workOrderNotFound() {
            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(10L)
                    .quantity(1)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> partUsageService.addPartToWorkOrder(999L, request));
        }

        @Test
        @DisplayName("Part not found throws exception")
        void partNotFound() {
            PartUsageRequest request = PartUsageRequest.builder()
                    .partId(999L)
                    .quantity(1)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(partRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> partUsageService.addPartToWorkOrder(500L, request));
        }
    }

    @Nested
    @DisplayName("getPartUsagesByWorkOrder")
    class GetPartUsagesByWorkOrder {

        @Test
        @DisplayName("Returns list of part usages for work order")
        void returnsPartUsages() {
            PartUsage partUsage = PartUsage.builder()
                    .id(1L)
                    .workOrder(workOrder)
                    .part(part)
                    .quantity(3)
                    .unitCost(new BigDecimal("25.50"))
                    .totalCost(new BigDecimal("76.50"))
                    .loggedBy(technicianUser)
                    .loggedAt(Instant.now())
                    .build();

            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(partUsageRepository.findByWorkOrder(workOrder)).thenReturn(List.of(partUsage));
            when(partUsageMapper.toResponse(any(PartUsage.class))).thenReturn(buildPartUsageResponse());

            List<PartUsageResponse> responses = partUsageService.getPartUsagesByWorkOrder(500L);

            assertEquals(1, responses.size());
        }

        @Test
        @DisplayName("Work order not found throws exception")
        void workOrderNotFoundForList() {
            when(workOrderRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> partUsageService.getPartUsagesByWorkOrder(999L));
        }
    }

    private PartUsageResponse buildPartUsageResponse() {
        return PartUsageResponse.builder()
                .id(1L)
                .workOrderId(500L)
                .partId(10L)
                .partCode("PART-001")
                .partName("Filter")
                .quantity(3)
                .unitCost(new BigDecimal("25.50"))
                .totalCost(new BigDecimal("76.50"))
                .loggedByName("Technician One")
                .loggedAt(Instant.now())
                .build();
    }
}

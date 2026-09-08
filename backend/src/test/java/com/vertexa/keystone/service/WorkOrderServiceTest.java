package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.*;
import com.vertexa.keystone.domain.enums.*;
import com.vertexa.keystone.dto.workorder.*;
import com.vertexa.keystone.exception.*;
import com.vertexa.keystone.mapper.WorkOrderMapper;
import com.vertexa.keystone.repository.*;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkOrderServiceTest {

    @Mock
    private WorkOrderRepository workOrderRepository;
    @Mock
    private WorkOrderStatusHistoryRepository statusHistoryRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private SiteRepository siteRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private WorkOrderMapper workOrderMapper;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private NotificationService notificationService;
    @Mock
    private SlaService slaService;
    @Mock
    private PartUsageRepository partUsageRepository;
    @Mock
    private TimeLogRepository timeLogRepository;

    @InjectMocks
    private WorkOrderService workOrderService;

    private User managerUser;
    private User dispatcherUser;
    private User technicianUser;
    private User customerUser;
    private Customer customer;
    private Site site;
    private WorkOrder workOrder;

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

        technicianUser = User.builder()
                .id(3L)
                .name("Technician One")
                .email("tech@keystone.com")
                .role(UserRole.TECHNICIAN)
                .build();

        customerUser = User.builder()
                .id(4L)
                .name("Customer One")
                .email("customer@acme.com")
                .role(UserRole.CUSTOMER)
                .customerId(100L)
                .build();

        customer = Customer.builder()
                .id(100L)
                .organizationName("Acme Corp")
                .contactName("John Doe")
                .email("john@acme.com")
                .phone("555-0100")
                .address("123 Main St")
                .active(true)
                .build();

        site = Site.builder()
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
                .description("AC unit not cooling")
                .priority(Priority.HIGH)
                .status(WorkOrderStatus.NEW)
                .customer(customer)
                .site(site)
                .createdBy(managerUser)
                .slaDueDate(Instant.now().plus(8, ChronoUnit.HOURS))
                .build();
    }

    @Nested
    @DisplayName("createWorkOrder")
    class CreateWorkOrder {

        @Test
        @DisplayName("Manager can create work order and generates unique code")
        void managerCanCreateWorkOrder() {
            WorkOrderRequest request = WorkOrderRequest.builder()
                    .title("HVAC Repair")
                    .description("AC unit not cooling")
                    .priority(Priority.HIGH)
                    .customerId(100L)
                    .siteId(200L)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(managerUser);
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(customer));
            when(siteRepository.findById(200L)).thenReturn(Optional.of(site));
            when(workOrderRepository.count()).thenReturn(0L);
            when(workOrderRepository.existsByWorkOrderCode(anyString())).thenReturn(false);
            when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> {
                WorkOrder wo = invocation.getArgument(0);
                wo.setId(500L);
                return wo;
            });
            when(slaService.calculateSlaDueDate(Priority.HIGH)).thenReturn(Instant.now().plus(8, ChronoUnit.HOURS));
            when(statusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());

            WorkOrderResponse response = workOrderService.createWorkOrder(request);

            assertNotNull(response);
            verify(workOrderRepository).save(any(WorkOrder.class));
            verify(statusHistoryRepository).save(any(WorkOrderStatusHistory.class));
        }

        @Test
        @DisplayName("Dispatcher can create work order")
        void dispatcherCanCreateWorkOrder() {
            WorkOrderRequest request = WorkOrderRequest.builder()
                    .title("HVAC Repair")
                    .description("AC unit not cooling")
                    .priority(Priority.HIGH)
                    .customerId(100L)
                    .siteId(200L)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(dispatcherUser);
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.DISPATCHER);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(customer));
            when(siteRepository.findById(200L)).thenReturn(Optional.of(site));
            when(workOrderRepository.count()).thenReturn(0L);
            when(workOrderRepository.existsByWorkOrderCode(anyString())).thenReturn(false);
            when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> {
                WorkOrder wo = invocation.getArgument(0);
                wo.setId(500L);
                return wo;
            });
            when(slaService.calculateSlaDueDate(Priority.HIGH)).thenReturn(Instant.now().plus(8, ChronoUnit.HOURS));
            when(statusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());

            WorkOrderResponse response = workOrderService.createWorkOrder(request);

            assertNotNull(response);
            verify(workOrderRepository).save(any(WorkOrder.class));
        }

        @Test
        @DisplayName("Technician cannot create work order")
        void technicianCannotCreateWorkOrder() {
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.TECHNICIAN);

            WorkOrderRequest request = WorkOrderRequest.builder()
                    .title("HVAC Repair")
                    .customerId(100L)
                    .siteId(200L)
                    .priority(Priority.HIGH)
                    .build();

            assertThrows(ForbiddenOperationException.class, () -> workOrderService.createWorkOrder(request));
        }

        @Test
        @DisplayName("Customer cannot create work order")
        void customerCannotCreateWorkOrder() {
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.CUSTOMER);

            WorkOrderRequest request = WorkOrderRequest.builder()
                    .title("HVAC Repair")
                    .customerId(100L)
                    .siteId(200L)
                    .priority(Priority.HIGH)
                    .build();

            assertThrows(ForbiddenOperationException.class, () -> workOrderService.createWorkOrder(request));
        }

        @Test
        @DisplayName("Work order code is generated with correct format")
        void workOrderCodeFormatIsCorrect() {
            when(workOrderRepository.count()).thenReturn(42L);
            when(workOrderRepository.existsByWorkOrderCode(anyString())).thenReturn(false);

            String code = workOrderService.getWorkOrderCode();

            assertNotNull(code);
            assertTrue(code.startsWith("WO-"));
            assertTrue(code.contains("2026"));
        }

        @Test
        @DisplayName("Work order code avoids duplicates")
        void workOrderCodeAvoidsDuplicates() {
            when(workOrderRepository.count()).thenReturn(0L);
            when(workOrderRepository.existsByWorkOrderCode("WO-2026-000001")).thenReturn(true);
            when(workOrderRepository.existsByWorkOrderCode("WO-2026-000002")).thenReturn(false);

            String code = workOrderService.getWorkOrderCode();

            assertEquals("WO-2026-000002", code);
        }

        @Test
        @DisplayName("Assigns technician and sends notification when assignedTechnicianId provided")
        void assignsTechnicianAndSendsNotification() {
            WorkOrderRequest request = WorkOrderRequest.builder()
                    .title("HVAC Repair")
                    .description("AC unit not cooling")
                    .priority(Priority.HIGH)
                    .customerId(100L)
                    .siteId(200L)
                    .assignedTechnicianId(3L)
                    .build();

            when(securityUtils.getCurrentUser()).thenReturn(managerUser);
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(customer));
            when(siteRepository.findById(200L)).thenReturn(Optional.of(site));
            when(userRepository.findById(3L)).thenReturn(Optional.of(technicianUser));
            when(workOrderRepository.count()).thenReturn(0L);
            when(workOrderRepository.existsByWorkOrderCode(anyString())).thenReturn(false);
            when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> {
                WorkOrder wo = invocation.getArgument(0);
                wo.setId(500L);
                return wo;
            });
            when(slaService.calculateSlaDueDate(Priority.HIGH)).thenReturn(Instant.now().plus(8, ChronoUnit.HOURS));
            when(statusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());

            workOrderService.createWorkOrder(request);

            verify(notificationService).createNotification(
                    eq(technicianUser),
                    eq(Notification.Type.WORK_ORDER_ASSIGNED),
                    anyString(),
                    anyString(),
                    eq(null),
                    eq("WORK_ORDER")
            );
        }
    }

    @Nested
    @DisplayName("assignTechnician")
    class AssignTechnician {

        @Test
        @DisplayName("Manager can assign technician to NEW work order")
        void managerCanAssignTechnician() {
            WorkOrderAssignRequest request = WorkOrderAssignRequest.builder().technicianId(3L).build();

            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(securityUtils.getCurrentUser()).thenReturn(managerUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(userRepository.findById(3L)).thenReturn(Optional.of(technicianUser));
            when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(statusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());

            WorkOrderResponse response = workOrderService.assignTechnician(500L, request);

            assertNotNull(response);
            assertEquals(WorkOrderStatus.ASSIGNED, workOrder.getStatus());
            verify(notificationService).createNotification(
                    eq(technicianUser),
                    eq(Notification.Type.WORK_ORDER_ASSIGNED),
                    anyString(),
                    anyString(),
                    eq(500L),
                    eq("WORK_ORDER")
            );
        }

        @Test
        @DisplayName("Dispatcher can assign technician")
        void dispatcherCanAssignTechnician() {
            WorkOrderAssignRequest request = WorkOrderAssignRequest.builder().technicianId(3L).build();

            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.DISPATCHER);
            when(securityUtils.getCurrentUser()).thenReturn(dispatcherUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(userRepository.findById(3L)).thenReturn(Optional.of(technicianUser));
            when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(statusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());

            WorkOrderResponse response = workOrderService.assignTechnician(500L, request);

            assertNotNull(response);
        }

        @Test
        @DisplayName("Technician cannot assign work orders")
        void technicianCannotAssign() {
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.TECHNICIAN);

            WorkOrderAssignRequest request = WorkOrderAssignRequest.builder().technicianId(3L).build();

            assertThrows(ForbiddenOperationException.class, () -> workOrderService.assignTechnician(500L, request));
        }

        @Test
        @DisplayName("Cannot assign to non-NEW/ASSIGNED work order")
        void cannotAssignToInProgressWorkOrder() {
            workOrder.setStatus(WorkOrderStatus.IN_PROGRESS);

            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));

            WorkOrderAssignRequest request = WorkOrderAssignRequest.builder().technicianId(3L).build();

            assertThrows(ForbiddenOperationException.class, () -> workOrderService.assignTechnician(500L, request));
        }

        @Test
        @DisplayName("Cannot assign non-technician user")
        void cannotAssignNonTechnician() {
            when(securityUtils.getCurrentUserRole()).thenReturn(UserRole.MANAGER);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(userRepository.findById(1L)).thenReturn(Optional.of(managerUser));

            WorkOrderAssignRequest request = WorkOrderAssignRequest.builder().technicianId(1L).build();

            assertThrows(ForbiddenOperationException.class, () -> workOrderService.assignTechnician(500L, request));
        }
    }

    @Nested
    @DisplayName("transitionStatus")
    class TransitionStatus {

        @Test
        @DisplayName("Illegal transition throws IllegalWorkOrderTransitionException")
        void illegalTransitionThrowsException() {
            when(securityUtils.getCurrentUser()).thenReturn(managerUser);

            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));

            WorkOrderStatusRequest request = WorkOrderStatusRequest.builder()
                    .status(WorkOrderStatus.IN_PROGRESS)
                    .build();

            assertThrows(IllegalWorkOrderTransitionException.class,
                    () -> workOrderService.transitionStatus(500L, request));
        }

        @Test
        @DisplayName("Customer cannot transition work order status")
        void customerCannotTransitionStatus() {
            when(securityUtils.getCurrentUser()).thenReturn(customerUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));

            WorkOrderStatusRequest request = WorkOrderStatusRequest.builder()
                    .status(WorkOrderStatus.ASSIGNED)
                    .build();

            assertThrows(ForbiddenOperationException.class,
                    () -> workOrderService.transitionStatus(500L, request));
        }

        @Test
        @DisplayName("VALID NEW -> ASSIGNED transition works")
        void validNewToAssignedTransition() {
            when(securityUtils.getCurrentUser()).thenReturn(managerUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(statusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());
            when(partUsageRepository.findTotalCostByWorkOrder(any())).thenReturn(Optional.empty());
            when(timeLogRepository.findTotalMinutesByWorkOrder(any())).thenReturn(Optional.empty());

            WorkOrderStatusRequest request = WorkOrderStatusRequest.builder()
                    .status(WorkOrderStatus.ASSIGNED)
                    .build();

            WorkOrderResponse response = workOrderService.transitionStatus(500L, request);

            assertNotNull(response);
            assertEquals(WorkOrderStatus.ASSIGNED, workOrder.getStatus());
        }

        @Test
        @DisplayName("Transition to COMPLETED sets completedAt timestamp")
        void transitionToCompletedSetsTimestamp() {
            workOrder.setStatus(WorkOrderStatus.IN_PROGRESS);
            workOrder.setAssignedTechnician(technicianUser);

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(statusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());
            when(partUsageRepository.findTotalCostByWorkOrder(any())).thenReturn(Optional.empty());
            when(timeLogRepository.findTotalMinutesByWorkOrder(any())).thenReturn(Optional.empty());

            WorkOrderStatusRequest request = WorkOrderStatusRequest.builder()
                    .status(WorkOrderStatus.COMPLETED)
                    .build();

            workOrderService.transitionStatus(500L, request);

            assertNotNull(workOrder.getCompletedAt());
            assertTrue(workOrder.getCompletedAt().isBefore(Instant.now().plusSeconds(5)));
        }

        @Test
        @DisplayName("Transition to CLOSED sets closedAt timestamp")
        void transitionToClosedSetsTimestamp() {
            workOrder.setStatus(WorkOrderStatus.COMPLETED);

            when(securityUtils.getCurrentUser()).thenReturn(managerUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(statusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());
            when(partUsageRepository.findTotalCostByWorkOrder(any())).thenReturn(Optional.empty());
            when(timeLogRepository.findTotalMinutesByWorkOrder(any())).thenReturn(Optional.empty());

            WorkOrderStatusRequest request = WorkOrderStatusRequest.builder()
                    .status(WorkOrderStatus.CLOSED)
                    .build();

            workOrderService.transitionStatus(500L, request);

            assertNotNull(workOrder.getClosedAt());
        }

        @Test
        @DisplayName("Technician cannot transition to CANCELLED")
        void technicianCannotCancel() {
            workOrder.setStatus(WorkOrderStatus.IN_PROGRESS);
            workOrder.setAssignedTechnician(technicianUser);

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));

            WorkOrderStatusRequest request = WorkOrderStatusRequest.builder()
                    .status(WorkOrderStatus.CANCELLED)
                    .build();

            assertThrows(ForbiddenOperationException.class,
                    () -> workOrderService.transitionStatus(500L, request));
        }

        @Test
        @DisplayName("Technician can transition ASSIGNED -> IN_PROGRESS")
        void technicianCanStartWork() {
            workOrder.setStatus(WorkOrderStatus.ASSIGNED);
            workOrder.setAssignedTechnician(technicianUser);

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(statusHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());
            when(partUsageRepository.findTotalCostByWorkOrder(any())).thenReturn(Optional.empty());
            when(timeLogRepository.findTotalMinutesByWorkOrder(any())).thenReturn(Optional.empty());

            WorkOrderStatusRequest request = WorkOrderStatusRequest.builder()
                    .status(WorkOrderStatus.IN_PROGRESS)
                    .build();

            WorkOrderResponse response = workOrderService.transitionStatus(500L, request);

            assertNotNull(response);
            assertEquals(WorkOrderStatus.IN_PROGRESS, workOrder.getStatus());
        }

        @Test
        @DisplayName("Technician cannot transition work order not assigned to them")
        void technicianCannotTransitionUnassignedWorkOrder() {
            workOrder.setStatus(WorkOrderStatus.ASSIGNED);
            workOrder.setAssignedTechnician(null);

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));

            WorkOrderStatusRequest request = WorkOrderStatusRequest.builder()
                    .status(WorkOrderStatus.IN_PROGRESS)
                    .build();

            assertThrows(ForbiddenOperationException.class,
                    () -> workOrderService.transitionStatus(500L, request));
        }
    }

    @Nested
    @DisplayName("getAllWorkOrders - role-based filtering")
    class GetAllWorkOrders {

        @Test
        @DisplayName("Customer can only see own work orders")
        void customerSeesOwnWorkOrders() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<WorkOrder> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

            when(securityUtils.getCurrentUser()).thenReturn(customerUser);
            when(customerRepository.findById(100L)).thenReturn(Optional.of(customer));
            when(workOrderRepository.searchWorkOrders(
                    eq(customer), eq(null), eq(null), eq(null), eq(null), eq(null), eq(pageable)
            )).thenReturn(emptyPage);

            workOrderService.getAllWorkOrders(null, null, null, null, null, null, pageable);

            verify(workOrderRepository).searchWorkOrders(
                    eq(customer), eq(null), eq(null), eq(null), eq(null), eq(null), eq(pageable)
            );
        }

        @Test
        @DisplayName("Technician can only see assigned work orders")
        void technicianSeesAssignedWorkOrders() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<WorkOrder> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.searchAllWorkOrders(
                    eq(null), eq(null), eq(3L), eq(null), eq(null), eq(null), eq(pageable)
            )).thenReturn(emptyPage);

            workOrderService.getAllWorkOrders(null, null, null, null, null, null, pageable);

            verify(workOrderRepository).searchAllWorkOrders(
                    eq(null), eq(null), eq(3L), eq(null), eq(null), eq(null), eq(pageable)
            );
        }

        @Test
        @DisplayName("Manager can see all work orders with filters")
        void managerSeesAllWorkOrders() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<WorkOrder> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

            when(securityUtils.getCurrentUser()).thenReturn(managerUser);
            when(workOrderRepository.searchAllWorkOrders(
                    eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(pageable)
            )).thenReturn(emptyPage);

            workOrderService.getAllWorkOrders(null, null, null, null, null, null, pageable);

            verify(workOrderRepository).searchAllWorkOrders(
                    eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(pageable)
            );
        }
    }

    @Nested
    @DisplayName("getWorkOrderById - authorization checks")
    class GetWorkOrderById {

        @Test
        @DisplayName("Customer can view own work order")
        void customerCanViewOwnWorkOrder() {
            workOrder.setCustomer(customer);

            when(securityUtils.getCurrentUser()).thenReturn(customerUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());
            when(partUsageRepository.findTotalCostByWorkOrder(any())).thenReturn(Optional.empty());
            when(timeLogRepository.findTotalMinutesByWorkOrder(any())).thenReturn(Optional.empty());

            WorkOrderResponse response = workOrderService.getWorkOrderById(500L);

            assertNotNull(response);
        }

        @Test
        @DisplayName("Customer cannot view another customer's work order")
        void customerCannotViewOtherWorkOrder() {
            Customer otherCustomer = Customer.builder().id(999L).build();
            workOrder.setCustomer(otherCustomer);

            when(securityUtils.getCurrentUser()).thenReturn(customerUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));

            assertThrows(ForbiddenOperationException.class, () -> workOrderService.getWorkOrderById(500L));
        }

        @Test
        @DisplayName("Technician can view assigned work order")
        void technicianCanViewAssignedWorkOrder() {
            workOrder.setAssignedTechnician(technicianUser);

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));
            when(workOrderMapper.toResponse(any(WorkOrder.class))).thenReturn(buildWorkOrderResponse());
            when(partUsageRepository.findTotalCostByWorkOrder(any())).thenReturn(Optional.empty());
            when(timeLogRepository.findTotalMinutesByWorkOrder(any())).thenReturn(Optional.empty());

            WorkOrderResponse response = workOrderService.getWorkOrderById(500L);

            assertNotNull(response);
        }

        @Test
        @DisplayName("Technician cannot view unassigned work order")
        void technicianCannotViewUnassignedWorkOrder() {
            workOrder.setAssignedTechnician(null);

            when(securityUtils.getCurrentUser()).thenReturn(technicianUser);
            when(workOrderRepository.findById(500L)).thenReturn(Optional.of(workOrder));

            assertThrows(ForbiddenOperationException.class, () -> workOrderService.getWorkOrderById(500L));
        }

        @Test
        @DisplayName("Work order not found throws ResourceNotFoundException")
        void workOrderNotFound() {
            when(securityUtils.getCurrentUser()).thenReturn(managerUser);
            when(workOrderRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> workOrderService.getWorkOrderById(999L));
        }
    }

    private WorkOrderResponse buildWorkOrderResponse() {
        return WorkOrderResponse.builder()
                .id(500L)
                .workOrderCode("WO-2026-000001")
                .title("HVAC Repair")
                .description("AC unit not cooling")
                .priority(Priority.HIGH)
                .status(WorkOrderStatus.NEW)
                .customerId(100L)
                .customerName("Acme Corp")
                .siteId(200L)
                .siteName("Headquarters")
                .createdById(1L)
                .createdByName("Manager One")
                .slaDueDate(Instant.now().plus(8, ChronoUnit.HOURS))
                .build();
    }
}

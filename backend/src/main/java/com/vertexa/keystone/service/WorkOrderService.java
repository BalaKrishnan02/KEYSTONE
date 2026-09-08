package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.*;
import com.vertexa.keystone.domain.enums.*;
import com.vertexa.keystone.dto.workorder.*;
import com.vertexa.keystone.exception.*;
import com.vertexa.keystone.mapper.WorkOrderMapper;
import com.vertexa.keystone.repository.*;
import com.vertexa.keystone.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.Year;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderStatusHistoryRepository statusHistoryRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final WorkOrderMapper workOrderMapper;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;
    private final SlaService slaService;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;

    private final AtomicLong woCounter = new AtomicLong(0);

    @Transactional(readOnly = true)
    public Page<WorkOrderResponse> getAllWorkOrders(WorkOrderStatus status, Priority priority,
                                                     Long technicianId, Long customerId, Long siteId,
                                                     String search, Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        UserRole role = currentUser.getRole();
        String searchPattern = (search == null || search.isBlank()) ? null : "%" + search.toLowerCase() + "%";

        Page<WorkOrder> workOrders;

        if (role == UserRole.CUSTOMER) {
            Long custId = currentUser.getCustomerId();
            if (custId == null) {
                return Page.empty(pageable);
            }
            workOrders = workOrderRepository.searchWorkOrders(
                    customerRepository.findById(custId).orElse(null),
                    status, priority, null, siteId, searchPattern, pageable);
        } else if (role == UserRole.TECHNICIAN) {
            workOrders = workOrderRepository.searchAllWorkOrders(
                    status, priority, currentUser.getId(), null, siteId, searchPattern, pageable);
        } else {
            workOrders = workOrderRepository.searchAllWorkOrders(
                    status, priority, technicianId, customerId, siteId, searchPattern, pageable);
        }

        return workOrders.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse getWorkOrderById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        UserRole role = currentUser.getRole();

        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", id));

        if (role == UserRole.CUSTOMER) {
            if (currentUser.getCustomerId() == null ||
                    !currentUser.getCustomerId().equals(workOrder.getCustomer().getId())) {
                throw new ForbiddenOperationException("Customers can only view their own work orders");
            }
        } else if (role == UserRole.TECHNICIAN) {
            if (workOrder.getAssignedTechnician() == null ||
                    !workOrder.getAssignedTechnician().getId().equals(currentUser.getId())) {
                throw new ForbiddenOperationException("Technicians can only view assigned work orders");
            }
        }

        return mapToResponse(workOrder);
    }

    @Transactional
    public WorkOrderResponse createWorkOrder(WorkOrderRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER && role != UserRole.DISPATCHER) {
            throw new ForbiddenOperationException("Only managers and dispatchers can create work orders");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site", "id", request.getSiteId()));

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenOperationException("Site does not belong to the specified customer");
        }

        User currentUser = securityUtils.getCurrentUser();
        String workOrderCode = getWorkOrderCode();

        WorkOrder workOrder = WorkOrder.builder()
                .workOrderCode(workOrderCode)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(WorkOrderStatus.NEW)
                .customer(customer)
                .site(site)
                .createdBy(currentUser)
                .slaDueDate(slaService.calculateSlaDueDate(request.getPriority()))
                .build();

        if (request.getAssignedTechnicianId() != null) {
            User technician = userRepository.findById(request.getAssignedTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", "id",
                            request.getAssignedTechnicianId()));
            workOrder.setAssignedTechnician(technician);

            notificationService.createNotification(
                    technician,
                    Notification.Type.WORK_ORDER_ASSIGNED,
                    "Work Order Assigned: " + workOrderCode,
                    "You have been assigned work order " + workOrderCode + ": " + request.getTitle(),
                    null,
                    "WORK_ORDER"
            );
        }

        workOrder = workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(workOrder)
                .fromStatus(null)
                .toStatus(WorkOrderStatus.NEW)
                .changedBy(currentUser)
                .changedAt(Instant.now())
                .note("Work order created")
                .build();
        statusHistoryRepository.save(history);

        log.info("Work order created: {} by user {}", workOrderCode, currentUser.getId());
        return mapToResponse(workOrder);
    }

    @Transactional
    public WorkOrderResponse updateWorkOrder(Long id, WorkOrderRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER && role != UserRole.DISPATCHER) {
            throw new ForbiddenOperationException("Only managers and dispatchers can update work orders");
        }

        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", id));

        if (workOrder.getStatus() != WorkOrderStatus.NEW && workOrder.getStatus() != WorkOrderStatus.ASSIGNED) {
            throw new ForbiddenOperationException("Work order can only be edited when in NEW or ASSIGNED status");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Site", "id", request.getSiteId()));

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenOperationException("Site does not belong to the specified customer");
        }

        workOrder.setTitle(request.getTitle());
        workOrder.setDescription(request.getDescription());
        workOrder.setPriority(request.getPriority());
        workOrder.setCustomer(customer);
        workOrder.setSite(site);

        if (request.getAssignedTechnicianId() != null) {
            User technician = userRepository.findById(request.getAssignedTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", "id",
                            request.getAssignedTechnicianId()));
            workOrder.setAssignedTechnician(technician);
        } else {
            workOrder.setAssignedTechnician(null);
        }

        workOrder = workOrderRepository.save(workOrder);
        log.info("Work order updated: {}", workOrder.getWorkOrderCode());
        return mapToResponse(workOrder);
    }

    @Transactional
    public WorkOrderResponse assignTechnician(Long id, WorkOrderAssignRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER && role != UserRole.DISPATCHER) {
            throw new ForbiddenOperationException("Only managers and dispatchers can assign technicians");
        }

        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", id));

        if (workOrder.getStatus() != WorkOrderStatus.NEW && workOrder.getStatus() != WorkOrderStatus.ASSIGNED) {
            throw new ForbiddenOperationException("Work order must be in NEW or ASSIGNED status to assign a technician");
        }

        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", request.getTechnicianId()));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new ForbiddenOperationException("Assigned user must have TECHNICIAN role");
        }

        User currentUser = securityUtils.getCurrentUser();
        WorkOrderStatus fromStatus = workOrder.getStatus();

        workOrder.setAssignedTechnician(technician);

        if (fromStatus == WorkOrderStatus.NEW) {
            workOrder.setStatus(WorkOrderStatus.ASSIGNED);
        }

        workOrder = workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(workOrder)
                .fromStatus(fromStatus)
                .toStatus(workOrder.getStatus())
                .changedBy(currentUser)
                .changedAt(Instant.now())
                .note("Technician assigned: " + technician.getName())
                .build();
        statusHistoryRepository.save(history);

        notificationService.createNotification(
                technician,
                Notification.Type.WORK_ORDER_ASSIGNED,
                "Work Order Assigned: " + workOrder.getWorkOrderCode(),
                "You have been assigned work order " + workOrder.getWorkOrderCode() + ": " + workOrder.getTitle(),
                workOrder.getId(),
                "WORK_ORDER"
        );

        log.info("Technician {} assigned to work order {}", technician.getId(), workOrder.getWorkOrderCode());
        return mapToResponse(workOrder);
    }

    @Transactional
    public WorkOrderResponse reassignTechnician(Long id, WorkOrderAssignRequest request) {
        UserRole role = securityUtils.getCurrentUserRole();
        if (role != UserRole.MANAGER && role != UserRole.DISPATCHER) {
            throw new ForbiddenOperationException("Only managers and dispatchers can reassign technicians");
        }

        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", id));

        if (workOrder.getStatus() != WorkOrderStatus.ASSIGNED &&
                workOrder.getStatus() != WorkOrderStatus.IN_PROGRESS) {
            throw new ForbiddenOperationException(
                    "Work order must be in ASSIGNED or IN_PROGRESS status to reassign a technician");
        }

        User newTechnician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", request.getTechnicianId()));

        if (newTechnician.getRole() != UserRole.TECHNICIAN) {
            throw new ForbiddenOperationException("Assigned user must have TECHNICIAN role");
        }

        User oldTechnician = workOrder.getAssignedTechnician();
        User currentUser = securityUtils.getCurrentUser();

        workOrder.setAssignedTechnician(newTechnician);
        workOrder = workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(workOrder)
                .fromStatus(workOrder.getStatus())
                .toStatus(workOrder.getStatus())
                .changedBy(currentUser)
                .changedAt(Instant.now())
                .note("Technician reassigned from " +
                        (oldTechnician != null ? oldTechnician.getName() : "none") +
                        " to " + newTechnician.getName())
                .build();
        statusHistoryRepository.save(history);

        if (oldTechnician != null) {
            notificationService.createNotification(
                    oldTechnician,
                    Notification.Type.WORK_ORDER_REASSIGNED,
                    "Work Order Reassigned: " + workOrder.getWorkOrderCode(),
                    "Work order " + workOrder.getWorkOrderCode() + " has been reassigned to " + newTechnician.getName(),
                    workOrder.getId(),
                    "WORK_ORDER"
            );
        }

        notificationService.createNotification(
                newTechnician,
                Notification.Type.WORK_ORDER_REASSIGNED,
                "Work Order Reassigned: " + workOrder.getWorkOrderCode(),
                "Work order " + workOrder.getWorkOrderCode() + " has been assigned to you",
                workOrder.getId(),
                "WORK_ORDER"
        );

        log.info("Technician reassigned on work order {}: {} -> {}",
                workOrder.getWorkOrderCode(),
                oldTechnician != null ? oldTechnician.getId() : "none",
                newTechnician.getId());
        return mapToResponse(workOrder);
    }

    @Transactional
    public WorkOrderResponse transitionStatus(Long id, WorkOrderStatusRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        UserRole role = currentUser.getRole();

        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", id));

        WorkOrderStatus newStatus = request.getStatus();
        WorkOrderStatus currentStatus = workOrder.getStatus();

        if (role == UserRole.CUSTOMER) {
            throw new ForbiddenOperationException("Customers cannot transition work order status");
        }

        if (!currentStatus.canTransitionTo(newStatus, role)) {
            throw new IllegalWorkOrderTransitionException(currentStatus, newStatus);
        }

        if (role == UserRole.TECHNICIAN) {
            if (workOrder.getAssignedTechnician() == null ||
                    !workOrder.getAssignedTechnician().getId().equals(currentUser.getId())) {
                throw new ForbiddenOperationException("Technician can only transition assigned work orders");
            }

            boolean validTechnicianTransition =
                    (currentStatus == WorkOrderStatus.ASSIGNED && newStatus == WorkOrderStatus.IN_PROGRESS) ||
                    (currentStatus == WorkOrderStatus.IN_PROGRESS && newStatus == WorkOrderStatus.ON_HOLD) ||
                    (currentStatus == WorkOrderStatus.ON_HOLD && newStatus == WorkOrderStatus.IN_PROGRESS) ||
                    (currentStatus == WorkOrderStatus.IN_PROGRESS && newStatus == WorkOrderStatus.COMPLETED);

            if (!validTechnicianTransition) {
                throw new ForbiddenOperationException("Technician cannot perform this status transition");
            }
        }

        workOrder.setStatus(newStatus);

        if (newStatus == WorkOrderStatus.COMPLETED) {
            workOrder.setCompletedAt(Instant.now());
        } else if (newStatus == WorkOrderStatus.CLOSED) {
            workOrder.setClosedAt(Instant.now());
        } else if (newStatus == WorkOrderStatus.ASSIGNED || newStatus == WorkOrderStatus.IN_PROGRESS) {
            if (currentStatus == WorkOrderStatus.CLOSED) {
                workOrder.setClosedAt(null);
            }
        }

        workOrder = workOrderRepository.save(workOrder);

        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(workOrder)
                .fromStatus(currentStatus)
                .toStatus(newStatus)
                .changedBy(currentUser)
                .changedAt(Instant.now())
                .note(request.getNote())
                .build();
        statusHistoryRepository.save(history);

        notifyStatusChange(workOrder, currentStatus, newStatus, currentUser);

        log.info("Work order {} transitioned from {} to {} by user {}",
                workOrder.getWorkOrderCode(), currentStatus, newStatus, currentUser.getId());
        return mapToResponse(workOrder);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderStatusHistory> getWorkOrderHistory(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", "id", id));
        return statusHistoryRepository.findByWorkOrderOrderByChangedAtAsc(workOrder);
    }

    @Transactional(readOnly = true)
    public String getWorkOrderCode() {
        if (woCounter.get() == 0) {
            woCounter.set(workOrderRepository.count());
        }
        String year = String.valueOf(Year.now().getValue());
        String code;
        do {
            code = String.format("WO-%s-%06d", year, woCounter.incrementAndGet());
        } while (workOrderRepository.existsByWorkOrderCode(code));
        return code;
    }

    @Transactional(readOnly = true)
    public Map<String, List<WorkOrderResponse>> getKanbanBoard(Long customerId, Long technicianId,
                                                                Long siteId, Priority priority) {
        User currentUser = securityUtils.getCurrentUser();
        UserRole role = currentUser.getRole();

        Map<String, List<WorkOrderResponse>> board = new LinkedHashMap<>();
        List<WorkOrderStatus> kanbanStatuses = List.of(
                WorkOrderStatus.NEW, WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS,
                WorkOrderStatus.ON_HOLD, WorkOrderStatus.COMPLETED
        );

        for (WorkOrderStatus status : kanbanStatuses) {
            Page<WorkOrder> workOrders;

            if (role == UserRole.CUSTOMER) {
                Long custId = currentUser.getCustomerId();
                if (custId == null) {
                    workOrders = Page.empty();
                } else {
                    workOrders = workOrderRepository.searchWorkOrders(
                            customerRepository.findById(custId).orElse(null),
                            status, priority, null, siteId, null, Pageable.unpaged());
                }
            } else if (role == UserRole.TECHNICIAN) {
                workOrders = workOrderRepository.searchAllWorkOrders(
                        status, priority, currentUser.getId(), null, siteId, null, Pageable.unpaged());
            } else {
                workOrders = workOrderRepository.searchAllWorkOrders(
                        status, priority, technicianId, customerId, siteId, null, Pageable.unpaged());
            }

            board.put(status.name(), workOrders.getContent().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList()));
        }

        return board;
    }

    private WorkOrderResponse mapToResponse(WorkOrder workOrder) {
        WorkOrderResponse response = workOrderMapper.toResponse(workOrder);

        response.setSlaState(slaService.getSlaState(workOrder));

        partUsageRepository.findTotalCostByWorkOrder(workOrder)
                .ifPresent(response::setTotalPartsCost);

        timeLogRepository.findTotalMinutesByWorkOrder(workOrder)
                .ifPresent(minutes -> response.setTotalMinutesLogged(minutes));

        return response;
    }

    private void notifyStatusChange(WorkOrder workOrder, WorkOrderStatus fromStatus,
                                     WorkOrderStatus toStatus, User changedBy) {
        String code = workOrder.getWorkOrderCode();

        switch (toStatus) {
            case IN_PROGRESS -> {
                if (fromStatus == WorkOrderStatus.ASSIGNED) {
                    notifyManagersAndDispatchers(workOrder,
                            Notification.Type.WORK_ORDER_STARTED,
                            "Work Order Started: " + code,
                            "Work order " + code + " has been started by " + changedBy.getName());
                } else if (fromStatus == WorkOrderStatus.ON_HOLD) {
                    notifyManagersAndDispatchers(workOrder,
                            Notification.Type.WORK_ORDER_RESUMED,
                            "Work Order Resumed: " + code,
                            "Work order " + code + " has been resumed by " + changedBy.getName());
                }
            }
            case ON_HOLD -> notifyManagersAndDispatchers(workOrder,
                    Notification.Type.WORK_ORDER_ON_HOLD,
                    "Work Order On Hold: " + code,
                    "Work order " + code + " has been put on hold by " + changedBy.getName());
            case COMPLETED -> notifyManagersAndDispatchers(workOrder,
                    Notification.Type.WORK_ORDER_COMPLETED,
                    "Work Order Completed: " + code,
                    "Work order " + code + " has been completed by " + changedBy.getName());
            case CLOSED -> {
                if (workOrder.getCustomer() != null) {
                    User customerUser = findCustomerUser(workOrder.getCustomer().getId());
                    if (customerUser != null) {
                        notificationService.createNotification(
                                customerUser,
                                Notification.Type.WORK_ORDER_CLOSED,
                                "Work Order Closed: " + code,
                                "Work order " + code + " has been closed",
                                workOrder.getId(),
                                "WORK_ORDER"
                        );
                    }
                }
            }
            case CANCELLED -> {
                if (workOrder.getAssignedTechnician() != null) {
                    notificationService.createNotification(
                            workOrder.getAssignedTechnician(),
                            Notification.Type.WORK_ORDER_CANCELLED,
                            "Work Order Cancelled: " + code,
                            "Work order " + code + " has been cancelled",
                            workOrder.getId(),
                            "WORK_ORDER"
                    );
                }
                if (workOrder.getCustomer() != null) {
                    User customerUser = findCustomerUser(workOrder.getCustomer().getId());
                    if (customerUser != null) {
                        notificationService.createNotification(
                                customerUser,
                                Notification.Type.WORK_ORDER_CANCELLED,
                                "Work Order Cancelled: " + code,
                                "Work order " + code + " has been cancelled",
                                workOrder.getId(),
                                "WORK_ORDER"
                        );
                    }
                }
            }
            default -> {}
        }
    }

    private void notifyManagersAndDispatchers(WorkOrder workOrder, Notification.Type type,
                                               String title, String message) {
        List<User> managers = userRepository.findByRole(UserRole.MANAGER);
        List<User> dispatchers = userRepository.findByRole(UserRole.DISPATCHER);

        List<User> recipients = new ArrayList<>();
        recipients.addAll(managers);
        recipients.addAll(dispatchers);

        for (User recipient : recipients) {
            notificationService.createNotification(
                    recipient, type, title, message, workOrder.getId(), "WORK_ORDER");
        }
    }

    private User findCustomerUser(Long customerId) {
        return userRepository.findByCustomerId(customerId).stream().findFirst().orElse(null);
    }
}

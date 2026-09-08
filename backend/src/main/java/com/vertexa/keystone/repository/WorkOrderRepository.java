package com.vertexa.keystone.repository;

import com.vertexa.keystone.domain.Customer;
import com.vertexa.keystone.domain.Site;
import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.WorkOrder;
import com.vertexa.keystone.domain.enums.Priority;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    Optional<WorkOrder> findByWorkOrderCode(String workOrderCode);

    Page<WorkOrder> findByCustomer(Customer customer, Pageable pageable);

    Page<WorkOrder> findBySite(Site site, Pageable pageable);

    Page<WorkOrder> findByAssignedTechnician(User technician, Pageable pageable);

    Page<WorkOrder> findByCreatedBy(User createdBy, Pageable pageable);

    Page<WorkOrder> findByStatus(WorkOrderStatus status, Pageable pageable);

    Page<WorkOrder> findByStatusIn(List<WorkOrderStatus> statuses, Pageable pageable);

    @Query("SELECT w FROM WorkOrder w WHERE w.deleted = false AND w.customer = :customer AND (:status IS NULL OR w.status = :status) AND (:priority IS NULL OR w.priority = :priority) AND (:technicianId IS NULL OR w.assignedTechnician.id = :technicianId) AND (:siteId IS NULL OR w.site.id = :siteId) AND (:searchPattern IS NULL OR LOWER(w.title) LIKE :searchPattern OR LOWER(w.description) LIKE :searchPattern OR LOWER(w.workOrderCode) LIKE :searchPattern) ORDER BY w.createdAt DESC")
    Page<WorkOrder> searchWorkOrders(
            @Param("customer") Customer customer,
            @Param("status") WorkOrderStatus status,
            @Param("priority") Priority priority,
            @Param("technicianId") Long technicianId,
            @Param("siteId") Long siteId,
            @Param("searchPattern") String searchPattern,
            Pageable pageable
    );

    @Query("SELECT w FROM WorkOrder w WHERE w.deleted = false AND (:status IS NULL OR w.status = :status) AND (:priority IS NULL OR w.priority = :priority) AND (:technicianId IS NULL OR w.assignedTechnician.id = :technicianId) AND (:customerId IS NULL OR w.customer.id = :customerId) AND (:siteId IS NULL OR w.site.id = :siteId) AND (:searchPattern IS NULL OR LOWER(w.title) LIKE :searchPattern OR LOWER(w.description) LIKE :searchPattern OR LOWER(w.workOrderCode) LIKE :searchPattern) ORDER BY w.createdAt DESC")
    Page<WorkOrder> searchAllWorkOrders(
            @Param("status") WorkOrderStatus status,
            @Param("priority") Priority priority,
            @Param("technicianId") Long technicianId,
            @Param("customerId") Long customerId,
            @Param("siteId") Long siteId,
            @Param("searchPattern") String searchPattern,
            Pageable pageable
    );

    @Query("SELECT w FROM WorkOrder w WHERE w.deleted = false AND w.assignedTechnician = :technician AND w.status IN :statuses ORDER BY w.slaDueDate ASC")
    List<WorkOrder> findAssignedWorkOrdersByStatuses(@Param("technician") User technician, @Param("statuses") List<WorkOrderStatus> statuses);

    @Query("SELECT w FROM WorkOrder w WHERE w.deleted = false AND w.status NOT IN :terminalStatuses AND w.slaDueDate < :now")
    List<WorkOrder> findOverdueWorkOrders(@Param("terminalStatuses") List<WorkOrderStatus> terminalStatuses, @Param("now") Instant now);

    @Query("SELECT w FROM WorkOrder w WHERE w.deleted = false AND w.status NOT IN :terminalStatuses AND w.slaDueDate BETWEEN :now AND :threshold")
    List<WorkOrder> findAtRiskWorkOrders(@Param("terminalStatuses") List<WorkOrderStatus> terminalStatuses, @Param("now") Instant now, @Param("threshold") Instant threshold);

    List<WorkOrder> findByCustomerAndDeletedFalse(Customer customer);

    long countByCustomerAndDeletedFalse(Customer customer);

    long countByAssignedTechnicianAndStatus(User technician, WorkOrderStatus status);

    long countByStatus(WorkOrderStatus status);

    long countByStatusIn(List<WorkOrderStatus> statuses);

    boolean existsByWorkOrderCode(String workOrderCode);
}
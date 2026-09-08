package com.vertexa.keystone.repository;

import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.WorkOrder;
import com.vertexa.keystone.domain.WorkOrderStatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderStatusHistoryRepository extends JpaRepository<WorkOrderStatusHistory, Long> {

    @Query("SELECT h FROM WorkOrderStatusHistory h JOIN FETCH h.changedBy WHERE h.workOrder = :workOrder ORDER BY h.changedAt ASC")
    List<WorkOrderStatusHistory> findByWorkOrderOrderByChangedAtAsc(@Param("workOrder") WorkOrder workOrder);

    Page<WorkOrderStatusHistory> findByWorkOrder(WorkOrder workOrder, Pageable pageable);

    List<WorkOrderStatusHistory> findByChangedByOrderByChangedAtDesc(User user);

    @Query("SELECT h FROM WorkOrderStatusHistory h WHERE h.workOrder = :workOrder ORDER BY h.changedAt ASC")
    List<WorkOrderStatusHistory> findHistoryByWorkOrder(@Param("workOrder") WorkOrder workOrder);
}
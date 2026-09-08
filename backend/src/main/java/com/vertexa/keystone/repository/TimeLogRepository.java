package com.vertexa.keystone.repository;

import com.vertexa.keystone.domain.TimeLog;
import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.WorkOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {

    List<TimeLog> findByWorkOrder(WorkOrder workOrder);

    Page<TimeLog> findByWorkOrder(WorkOrder workOrder, Pageable pageable);

    List<TimeLog> findByTechnician(User technician);

    Page<TimeLog> findByTechnician(User technician, Pageable pageable);

    @Query("SELECT SUM(tl.minutes) FROM TimeLog tl WHERE tl.workOrder = :workOrder")
    Optional<Integer> findTotalMinutesByWorkOrder(@Param("workOrder") WorkOrder workOrder);

    @Query("SELECT SUM(tl.minutes) FROM TimeLog tl WHERE tl.technician = :technician")
    Optional<Integer> findTotalMinutesByTechnician(@Param("technician") User technician);
}
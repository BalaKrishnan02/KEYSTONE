package com.vertexa.keystone.repository;

import com.vertexa.keystone.domain.PartUsage;
import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.WorkOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartUsageRepository extends JpaRepository<PartUsage, Long> {

    List<PartUsage> findByWorkOrder(WorkOrder workOrder);

    Page<PartUsage> findByWorkOrder(WorkOrder workOrder, Pageable pageable);

    List<PartUsage> findByLoggedBy(User user);

    @Query("SELECT SUM(pu.totalCost) FROM PartUsage pu WHERE pu.workOrder = :workOrder")
    Optional<BigDecimal> findTotalCostByWorkOrder(@Param("workOrder") WorkOrder workOrder);

    @Query("SELECT COUNT(pu) FROM PartUsage pu WHERE pu.workOrder = :workOrder")
    long countByWorkOrder(@Param("workOrder") WorkOrder workOrder);
}
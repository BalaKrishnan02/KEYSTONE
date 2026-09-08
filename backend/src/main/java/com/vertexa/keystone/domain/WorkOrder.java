package com.vertexa.keystone.domain;

import com.vertexa.keystone.domain.enums.Priority;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "work_orders",
    uniqueConstraints = @UniqueConstraint(name = "uk_work_orders_code", columnNames = "work_order_code"),
    indexes = {
        @Index(name = "idx_work_orders_code", columnList = "work_order_code"),
        @Index(name = "idx_work_orders_customer_id", columnList = "customer_id"),
        @Index(name = "idx_work_orders_site_id", columnList = "site_id"),
        @Index(name = "idx_work_orders_technician_id", columnList = "assigned_technician_id"),
        @Index(name = "idx_work_orders_status", columnList = "status"),
        @Index(name = "idx_work_orders_priority", columnList = "priority"),
        @Index(name = "idx_work_orders_sla_due", columnList = "sla_due_date"),
        @Index(name = "idx_work_orders_created_by", columnList = "created_by_id")
    }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Where(clause = "deleted = false")
@SQLDelete(sql = "UPDATE work_orders SET deleted = true WHERE id = ?")
public class WorkOrder extends BaseEntity {

    @NotBlank
    @Column(name = "work_order_code", nullable = false, unique = true, length = 50)
    private String workOrderCode;

    @NotBlank
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WorkOrderStatus status = WorkOrderStatus.NEW;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private User assignedTechnician;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(name = "sla_due_date")
    private Instant slaDueDate;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @OneToMany(mappedBy = "workOrder", fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkOrderStatusHistory> statusHistory = new ArrayList<>();

    @OneToMany(mappedBy = "workOrder", fetch = FetchType.LAZY)
    @Builder.Default
    private List<PartUsage> partUsages = new ArrayList<>();

    @OneToMany(mappedBy = "workOrder", fetch = FetchType.LAZY)
    @Builder.Default
    private List<TimeLog> timeLogs = new ArrayList<>();

    public void addStatusHistory(WorkOrderStatusHistory history) {
        this.statusHistory.add(history);
        history.setWorkOrder(this);
    }

    public void addPartUsage(PartUsage partUsage) {
        this.partUsages.add(partUsage);
        partUsage.setWorkOrder(this);
    }

    public void addTimeLog(TimeLog timeLog) {
        this.timeLogs.add(timeLog);
        timeLog.setWorkOrder(this);
    }
}
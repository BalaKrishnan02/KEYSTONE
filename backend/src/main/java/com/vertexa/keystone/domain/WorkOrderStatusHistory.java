package com.vertexa.keystone.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
    name = "work_order_status_history",
    indexes = {
        @Index(name = "idx_wo_status_history_wo_id", columnList = "work_order_id"),
        @Index(name = "idx_wo_status_history_changed_by", columnList = "changed_by_id"),
        @Index(name = "idx_wo_status_history_changed_at", columnList = "changed_at")
    }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderStatusHistory extends BaseEntity {

    @NotNull
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private WorkOrderStatus fromStatus;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false)
    private WorkOrderStatus toStatus;

    @NotNull
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_id", nullable = false)
    private User changedBy;

    @Column(name = "changed_at", nullable = false)
    private java.time.Instant changedAt;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
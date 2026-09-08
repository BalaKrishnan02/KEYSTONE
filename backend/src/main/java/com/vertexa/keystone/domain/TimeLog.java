package com.vertexa.keystone.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
    name = "time_logs",
    indexes = {
        @Index(name = "idx_time_logs_wo_id", columnList = "work_order_id"),
        @Index(name = "idx_time_logs_technician_id", columnList = "technician_id"),
        @Index(name = "idx_time_logs_logged_at", columnList = "logged_at")
    }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class TimeLog extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    private User technician;

    @NotNull
    @Min(1)
    @Column(name = "minutes", nullable = false)
    private Integer minutes;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "logged_at", nullable = false)
    private java.time.Instant loggedAt;
}
package com.vertexa.keystone.dto.workorder;

import com.vertexa.keystone.domain.enums.Priority;
import com.vertexa.keystone.domain.enums.SLAState;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderResponse {

    private Long id;
    private String workOrderCode;
    private String title;
    private String description;
    private Priority priority;
    private WorkOrderStatus status;
    private Long customerId;
    private String customerName;
    private Long siteId;
    private String siteName;
    private Long assignedTechnicianId;
    private String assignedTechnicianName;
    private Long createdById;
    private String createdByName;
    private Instant slaDueDate;
    private Instant completedAt;
    private Instant closedAt;
    private Instant createdAt;
    private Instant updatedAt;
    private BigDecimal totalPartsCost;
    private Integer totalMinutesLogged;
    private SLAState slaState;
    private int statusHistoryCount;
}

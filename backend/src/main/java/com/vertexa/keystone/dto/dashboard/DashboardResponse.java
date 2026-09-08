package com.vertexa.keystone.dto.dashboard;

import com.vertexa.keystone.dto.workorder.WorkOrderResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private Long totalWorkOrders;
    private Long openWorkOrders;
    private Long completedWorkOrders;
    private Long closedWorkOrders;
    private Long cancelledWorkOrders;
    private Long overdueWorkOrders;
    private Long atRiskWorkOrders;
    private double slaCompliancePercent;
    private Map<String, Long> workOrdersByStatus;
    private Map<String, Long> workOrdersByPriority;
    private List<TechnicianWorkCount> workOrdersByTechnician;
    private List<WorkOrderResponse> recentWorkOrders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechnicianWorkCount {
        private Long technicianId;
        private String technicianName;
        private Long workOrderCount;
    }
}

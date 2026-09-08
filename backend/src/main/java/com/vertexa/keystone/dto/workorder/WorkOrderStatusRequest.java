package com.vertexa.keystone.dto.workorder;

import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderStatusRequest {

    @NotNull
    private WorkOrderStatus status;

    private String note;
}

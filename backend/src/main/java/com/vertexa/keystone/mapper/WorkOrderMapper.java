package com.vertexa.keystone.mapper;

import com.vertexa.keystone.domain.WorkOrder;
import com.vertexa.keystone.dto.workorder.WorkOrderResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface WorkOrderMapper {

    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer.organizationName", target = "customerName")
    @Mapping(source = "site.id", target = "siteId")
    @Mapping(source = "site.name", target = "siteName")
    @Mapping(source = "assignedTechnician.id", target = "assignedTechnicianId")
    @Mapping(source = "assignedTechnician.name", target = "assignedTechnicianName")
    @Mapping(source = "createdBy.id", target = "createdById")
    @Mapping(source = "createdBy.name", target = "createdByName")
    @Mapping(target = "statusHistoryCount", ignore = true)
    @Mapping(target = "totalPartsCost", ignore = true)
    @Mapping(target = "totalMinutesLogged", ignore = true)
    @Mapping(target = "slaState", ignore = true)
    WorkOrderResponse toResponse(WorkOrder workOrder);
}
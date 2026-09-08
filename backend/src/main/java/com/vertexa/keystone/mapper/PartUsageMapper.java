package com.vertexa.keystone.mapper;

import com.vertexa.keystone.domain.PartUsage;
import com.vertexa.keystone.dto.partusage.PartUsageResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface PartUsageMapper {

    @Mapping(source = "workOrder.id", target = "workOrderId")
    @Mapping(source = "part.id", target = "partId")
    @Mapping(source = "part.partCode", target = "partCode")
    @Mapping(source = "part.name", target = "partName")
    @Mapping(source = "loggedBy.name", target = "loggedByName")
    PartUsageResponse toResponse(PartUsage partUsage);
}
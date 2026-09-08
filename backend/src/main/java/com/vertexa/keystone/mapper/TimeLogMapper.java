package com.vertexa.keystone.mapper;

import com.vertexa.keystone.domain.TimeLog;
import com.vertexa.keystone.dto.timelog.TimeLogResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface TimeLogMapper {

    @Mapping(source = "workOrder.id", target = "workOrderId")
    @Mapping(source = "technician.id", target = "technicianId")
    @Mapping(source = "technician.name", target = "technicianName")
    TimeLogResponse toResponse(TimeLog timeLog);
}
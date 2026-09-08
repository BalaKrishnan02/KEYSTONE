package com.vertexa.keystone.mapper;

import com.vertexa.keystone.domain.Site;
import com.vertexa.keystone.dto.site.SiteResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface SiteMapper {

    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer.organizationName", target = "customerName")
    @Mapping(target = "workOrderCount", ignore = true)
    SiteResponse toResponse(Site site);
}
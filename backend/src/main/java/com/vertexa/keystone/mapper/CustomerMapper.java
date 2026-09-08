package com.vertexa.keystone.mapper;

import com.vertexa.keystone.domain.Customer;
import com.vertexa.keystone.dto.customer.CustomerResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface CustomerMapper {

    @Mapping(target = "siteCount", ignore = true)
    @Mapping(target = "workOrderCount", ignore = true)
    CustomerResponse toResponse(Customer customer);
}
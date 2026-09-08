package com.vertexa.keystone.mapper;

import com.vertexa.keystone.domain.Part;
import com.vertexa.keystone.dto.part.PartResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PartMapper {

    PartResponse toResponse(Part part);
}

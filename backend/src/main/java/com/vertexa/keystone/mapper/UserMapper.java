package com.vertexa.keystone.mapper;

import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.dto.user.UserResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}

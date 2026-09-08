package com.vertexa.keystone.mapper;

import com.vertexa.keystone.domain.Notification;
import com.vertexa.keystone.dto.notification.NotificationResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationResponse toResponse(Notification notification);
}

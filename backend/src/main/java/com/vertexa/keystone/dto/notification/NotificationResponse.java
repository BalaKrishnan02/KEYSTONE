package com.vertexa.keystone.dto.notification;

import com.vertexa.keystone.domain.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private Notification.Type type;
    private String title;
    private String message;
    private Long referenceId;
    private String referenceType;
    private boolean read;
    private Instant createdAt;
}

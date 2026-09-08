package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.Notification;
import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.dto.notification.NotificationResponse;
import com.vertexa.keystone.mapper.NotificationMapper;
import com.vertexa.keystone.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Transactional
    public Notification createNotification(User user, Notification.Type type, String title,
                                           String message, Long referenceId, String referenceType) {
        log.info("Creating notification for user {}: {}", user.getId(), title);

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .read(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotificationsByUser(User user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(notificationMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUser(user);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new com.vertexa.keystone.exception.ResourceNotFoundException(
                        "Notification", "id", notificationId));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);
            log.info("Notification {} marked as read", notificationId);
        }
    }

    @Transactional
    public void markAllAsRead(User user) {
        int updated = notificationRepository.markAllAsRead(user);
        log.info("Marked {} notifications as read for user {}", updated, user.getId());
    }
}

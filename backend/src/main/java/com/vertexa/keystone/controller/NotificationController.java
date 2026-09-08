package com.vertexa.keystone.controller;

import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.dto.common.PageResponse;
import com.vertexa.keystone.dto.notification.NotificationResponse;
import com.vertexa.keystone.service.NotificationService;
import com.vertexa.keystone.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = securityUtils.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notificationPage = notificationService.getNotificationsByUser(currentUser, pageable);
        PageResponse<NotificationResponse> response = PageResponse.<NotificationResponse>builder()
                .content(notificationPage.getContent())
                .page(notificationPage.getNumber())
                .size(notificationPage.getSize())
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .first(notificationPage.isFirst())
                .last(notificationPage.isLast())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {
        User currentUser = securityUtils.getCurrentUser();
        List<NotificationResponse> response = notificationService.getUnreadNotifications(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCount() {
        User currentUser = securityUtils.getCurrentUser();
        long count = notificationService.getUnreadCount(currentUser);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User currentUser = securityUtils.getCurrentUser();
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok().build();
    }
}

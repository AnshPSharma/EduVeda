package com.eduveda.notificationannouncement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eduveda.notificationannouncement.dto.NotificationRequest;
import com.eduveda.notificationannouncement.entity.Notification;
import com.eduveda.notificationannouncement.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(NotificationRequest request) {
        Notification notification = new Notification(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getRelatedEntityType(),
            request.getTitle(),
            request.getMessage(),
            request.getType(),
            request.getCreatedBy()
        );
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId, List<Long> enrolledCourseIds, List<Long> instructorCourseIds) {
        return notificationRepository.findNotificationsForUser(userId, enrolledCourseIds, instructorCourseIds);
    }

    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findUnreadNotificationsByUserId(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}

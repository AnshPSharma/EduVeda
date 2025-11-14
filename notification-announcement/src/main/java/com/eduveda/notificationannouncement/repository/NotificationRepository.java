package com.eduveda.notificationannouncement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eduveda.notificationannouncement.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId OR (n.relatedEntityType = 'course' AND n.relatedEntityId IN :enrolledCourseIds) OR (n.relatedEntityType = 'course' AND n.relatedEntityId IN :instructorCourseIds)")
    List<Notification> findNotificationsForUser(@Param("userId") Long userId,
                                               @Param("enrolledCourseIds") List<Long> enrolledCourseIds,
                                               @Param("instructorCourseIds") List<Long> instructorCourseIds);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.readAt IS NULL")
    List<Notification> findUnreadNotificationsByUserId(@Param("userId") Long userId);
}

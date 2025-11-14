package com.eduveda.notificationannouncement.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eduveda.notificationannouncement.entity.Announcement;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByCourseId(Long courseId);

    @Query("SELECT a FROM Announcement a WHERE a.courseId IN :courseIds AND a.expiresAt > :now ORDER BY a.createdAt DESC")
    List<Announcement> findActiveAnnouncementsForCourses(@Param("courseIds") List<Long> courseIds, @Param("now") LocalDateTime now);
}

package com.eduveda.notificationannouncement.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eduveda.notificationannouncement.dto.AnnouncementRequest;
import com.eduveda.notificationannouncement.entity.Announcement;
import com.eduveda.notificationannouncement.repository.AnnouncementRepository;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    public Announcement createAnnouncement(AnnouncementRequest request) {
        Announcement announcement = new Announcement(
            request.getTitle(),
            request.getMessage(),
            request.getCourseId(),
            request.getExpiresAt(),
            request.getCreatedBy()
        );
        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAnnouncementsForCourses(List<Long> courseIds) {
        return announcementRepository.findActiveAnnouncementsForCourses(courseIds, LocalDateTime.now());
    }

    public List<Announcement> getAnnouncementsByCourseId(Long courseId) {
        return announcementRepository.findByCourseId(courseId);
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public void deleteAnnouncement(Long announcementId) {
        announcementRepository.deleteById(announcementId);
    }
}

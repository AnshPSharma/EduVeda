package com.eduveda.notificationannouncement.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eduveda.notificationannouncement.dto.AnnouncementRequest;
import com.eduveda.notificationannouncement.entity.Announcement;
import com.eduveda.notificationannouncement.service.AnnouncementService;

@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody AnnouncementRequest request) {
        Announcement announcement = announcementService.createAnnouncement(request);
        return ResponseEntity.ok(announcement);
    }

    @GetMapping
    public ResponseEntity<List<Announcement>> getAnnouncements(@RequestParam(required = false) List<Long> courseIds) {
        List<Announcement> announcements;
        if (courseIds != null && !courseIds.isEmpty()) {
            announcements = announcementService.getAnnouncementsForCourses(courseIds);
        } else {
            announcements = announcementService.getAllAnnouncements();
        }
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Announcement>> getAnnouncementsByCourse(@PathVariable Long courseId) {
        List<Announcement> announcements = announcementService.getAnnouncementsByCourseId(courseId);
        return ResponseEntity.ok(announcements);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }
}

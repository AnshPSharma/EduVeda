package com.eduveda.notificationannouncement.dto;

import java.time.LocalDateTime;

public class AnnouncementRequest {

    private String title;
    private String message;
    private Long courseId;
    private LocalDateTime expiresAt;
    private Long createdBy;

    // Constructors
    public AnnouncementRequest() {}

    public AnnouncementRequest(String title, String message, Long courseId, LocalDateTime expiresAt, Long createdBy) {
        this.title = title;
        this.message = message;
        this.courseId = courseId;
        this.expiresAt = expiresAt;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
}

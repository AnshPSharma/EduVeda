package com.eduveda.enrollmentprogress.dto;

import java.time.LocalDateTime;

public class ModuleProgressRequest {
    private Long userId;
    private Long resourceId;
    private Long courseId;
    private Boolean completed;
    private LocalDateTime completedAt;
    private Long createdBy;
    private Long updatedBy;

    // Constructors
    public ModuleProgressRequest() {}

    public ModuleProgressRequest(Long userId, Long resourceId, Long courseId, Boolean completed) {
        this.userId = userId;
        this.resourceId = resourceId;
        this.courseId = courseId;
        this.completed = completed;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }
}

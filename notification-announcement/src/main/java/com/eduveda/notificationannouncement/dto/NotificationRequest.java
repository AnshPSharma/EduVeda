package com.eduveda.notificationannouncement.dto;

public class NotificationRequest {

    private Long userId;
    private Long relatedEntityId;
    private String relatedEntityType;
    private String title;
    private String message;
    private String type;
    private Long createdBy;

    // Constructors
    public NotificationRequest() {}

    public NotificationRequest(Long userId, Long relatedEntityId, String relatedEntityType, String title, String message, String type, Long createdBy) {
        this.userId = userId;
        this.relatedEntityId = relatedEntityId;
        this.relatedEntityType = relatedEntityType;
        this.title = title;
        this.message = message;
        this.type = type;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getRelatedEntityId() {
        return relatedEntityId;
    }

    public void setRelatedEntityId(Long relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }

    public String getRelatedEntityType() {
        return relatedEntityType;
    }

    public void setRelatedEntityType(String relatedEntityType) {
        this.relatedEntityType = relatedEntityType;
    }

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
}

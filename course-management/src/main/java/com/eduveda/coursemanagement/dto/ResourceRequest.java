package com.eduveda.coursemanagement.dto;

public class ResourceRequest {
    private String title;
    private String duration;
    private String youtubeLink;
    private Long createdBy;
    private Long updatedBy;

    // Constructors, getters, setters
    public ResourceRequest() {}

    public ResourceRequest(String title, String duration, String youtubeLink, Long createdBy, Long updatedBy) {
        this.title = title;
        this.duration = duration;
        this.youtubeLink = youtubeLink;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getYoutubeLink() { return youtubeLink; }
    public void setYoutubeLink(String youtubeLink) { this.youtubeLink = youtubeLink; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }
}

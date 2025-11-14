package com.eduveda.assessmentmanagement.dto;

import java.time.LocalDateTime;

public class AssessmentProgressRequest {
    private Long userId;
    private Long assessmentId;
    private Long courseId;
    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private Boolean passed;
    private Integer attemptNumber;
    private LocalDateTime completedAt;
    private Long createdBy;
    private Long updatedBy;

    // Constructors
    public AssessmentProgressRequest() {}

    public AssessmentProgressRequest(Long userId, Long assessmentId, Long courseId, Integer score, Integer maxScore, Double percentage, Boolean passed, Integer attemptNumber, LocalDateTime completedAt, Long createdBy, Long updatedBy) {
        this.userId = userId;
        this.assessmentId = assessmentId;
        this.courseId = courseId;
        this.score = score;
        this.maxScore = maxScore;
        this.percentage = percentage;
        this.passed = passed;
        this.attemptNumber = attemptNumber;
        this.completedAt = completedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
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

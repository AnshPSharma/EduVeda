package com.eduveda.assessmentmanagement.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.eduveda.assessmentmanagement.dto.AssessmentRequest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "assessments")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "module_id")
    private Long moduleId;

    @Column(name = "type", nullable = false)
    private String type = "quiz";

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Lob
    @Column(name = "questions_json", columnDefinition = "TEXT")
    private String questionsJson;

    @Lob
    @Column(name = "correct_answers_json", columnDefinition = "TEXT")
    private String correctAnswersJson;

    @Column(name = "max_score")
    private Integer maxScore;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "version", nullable = false)
    private Integer version = 1;

    // Transient field for deserialized questions
    private transient List<AssessmentRequest.Question> questions;

    // Getters and Setters for questions
    public List<AssessmentRequest.Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<AssessmentRequest.Question> questions) {
        this.questions = questions;
    }

    // Constructors
    public Assessment() {}

    public Assessment(Long courseId, String title, String description, String questionsJson, String correctAnswersJson, Integer maxScore, Long createdBy) {
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.questionsJson = questionsJson;
        this.correctAnswersJson = correctAnswersJson;
        this.maxScore = maxScore;
        this.createdBy = createdBy;
        this.updatedBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getQuestionsJson() {
        return questionsJson;
    }

    public void setQuestionsJson(String questionsJson) {
        this.questionsJson = questionsJson;
    }

    public String getCorrectAnswersJson() {
        return correctAnswersJson;
    }

    public void setCorrectAnswersJson(String correctAnswersJson) {
        this.correctAnswersJson = correctAnswersJson;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = LocalDateTime.now();
        this.updatedAt = updatedAt;
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

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

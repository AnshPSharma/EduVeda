package com.eduveda.assessmentmanagement.dto;

import java.util.List;

public class AssessmentRequest {
    private Long courseId;
    private String title;
    private String description;
    private List<Question> questions;
    private Long createdBy;
    private Long updatedBy;

    // Inner class for Question
    public static class Question {
        private String text;
        private List<String> options;
        private String answer;

        public Question() {}

        public Question(String text, List<String> options, String answer) {
            this.text = text;
            this.options = options;
            this.answer = answer;
        }

        // Getters and Setters
        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public List<String> getOptions() {
            return options;
        }

        public void setOptions(List<String> options) {
            this.options = options;
        }

        public String getAnswer() {
            return answer;
        }

        public void setAnswer(String answer) {
            this.answer = answer;
        }
    }

    // Constructors
    public AssessmentRequest() {}

    public AssessmentRequest(Long courseId, String title, String description, List<Question> questions, Long createdBy, Long updatedBy) {
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.questions = questions;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    // Getters and Setters
    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
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

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
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

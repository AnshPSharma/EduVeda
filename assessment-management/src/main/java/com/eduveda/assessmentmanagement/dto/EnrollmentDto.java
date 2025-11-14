package com.eduveda.assessmentmanagement.dto;

public class EnrollmentDto {
    private Long id;
    private Long studentId;
    private Long courseId;
    private String status;

    // Constructors
    public EnrollmentDto() {}

    public EnrollmentDto(Long id, Long studentId, Long courseId, String status) {
        this.id = id;
        this.studentId = studentId;
        this.courseId = courseId;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

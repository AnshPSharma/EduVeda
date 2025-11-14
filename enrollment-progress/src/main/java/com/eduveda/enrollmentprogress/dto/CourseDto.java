package com.eduveda.enrollmentprogress.dto;

public class CourseDto {
    private Long id;
    private String title;
    private Long instructorId;

    // Constructors
    public CourseDto() {}

    public CourseDto(Long id, String title, Long instructorId) {
        this.id = id;
        this.title = title;
        this.instructorId = instructorId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(Long instructorId) {
        this.instructorId = instructorId;
    }
}

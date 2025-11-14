package com.eduveda.coursemanagement.dto;

public class CourseRequest {
    private String title;
    private String description;
    private Double price;
    private String image;
    private Double rating;
    private String instructor;
    private Long instructorId;
    private Long createdBy;
    private Long updatedBy;

    // Constructors, getters, setters
    public CourseRequest() {}

    public CourseRequest(String title, String description, Double price, String image, Double rating, String instructor, Long instructorId, Long createdBy, Long updatedBy) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.image = image;
        this.rating = rating;
        this.instructor = instructor;
        this.instructorId = instructorId;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }

    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }
}

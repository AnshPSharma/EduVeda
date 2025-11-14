package com.eduveda.coursemanagement.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eduveda.coursemanagement.dto.CourseRequest;
import com.eduveda.coursemanagement.dto.ResourceRequest;
import com.eduveda.coursemanagement.entity.Course;
import com.eduveda.coursemanagement.entity.Resource;
import com.eduveda.coursemanagement.service.CourseService;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        Optional<Course> course = courseService.getCourseById(id);
        return course.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<Course>> getCoursesByInstructorId(@PathVariable Long instructorId) {
        List<Course> courses = courseService.getCoursesByInstructorId(instructorId);
        return ResponseEntity.ok(courses);
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody CourseRequest courseRequest) {
        Course course = new Course(
            courseRequest.getTitle(),
            courseRequest.getDescription(),
            courseRequest.getPrice(),
            courseRequest.getImage(),
            courseRequest.getRating(),
            courseRequest.getInstructor(),
            courseRequest.getInstructorId()
        );
        course.setCreatedBy(courseRequest.getCreatedBy());
        course.setUpdatedBy(courseRequest.getUpdatedBy());
        Course savedCourse = courseService.createCourse(course);
        return ResponseEntity.ok(savedCourse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody CourseRequest courseRequest) {
        Course courseDetails = new Course(
            courseRequest.getTitle(),
            courseRequest.getDescription(),
            courseRequest.getPrice(),
            courseRequest.getImage(),
            courseRequest.getRating(),
            courseRequest.getInstructor(),
            courseRequest.getInstructorId()
        );
        courseDetails.setUpdatedBy(courseRequest.getUpdatedBy());
        Course updatedCourse = courseService.updateCourse(id, courseDetails);
        return updatedCourse != null ? ResponseEntity.ok(updatedCourse) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{courseId}/resources")
    public ResponseEntity<List<Resource>> getResourcesByCourseId(@PathVariable Long courseId) {
        List<Resource> resources = courseService.getResourcesByCourseId(courseId);
        return ResponseEntity.ok(resources);
    }

    @PostMapping("/{courseId}/resources")
    public ResponseEntity<Resource> createResource(@PathVariable Long courseId, @RequestBody ResourceRequest resourceRequest) {
        String youtubeId = courseService.extractYouTubeId(resourceRequest.getYoutubeLink());
        if (youtubeId == null) {
            return ResponseEntity.badRequest().build();
        }
        Resource resource = new Resource(
            courseId,
            resourceRequest.getTitle(),
            resourceRequest.getDuration(),
            youtubeId
        );
        resource.setCreatedBy(resourceRequest.getCreatedBy());
        resource.setUpdatedBy(resourceRequest.getUpdatedBy());
        Resource savedResource = courseService.createResource(resource);
        return ResponseEntity.ok(savedResource);
    }

    @PutMapping("/resources/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody ResourceRequest resourceRequest) {
        String youtubeId = courseService.extractYouTubeId(resourceRequest.getYoutubeLink());
        if (youtubeId == null) {
            return ResponseEntity.badRequest().build();
        }
        Resource resourceDetails = new Resource();
        resourceDetails.setTitle(resourceRequest.getTitle());
        resourceDetails.setDuration(resourceRequest.getDuration());
        resourceDetails.setYoutubeId(youtubeId);
        resourceDetails.setUpdatedBy(resourceRequest.getUpdatedBy());
        Resource updatedResource = courseService.updateResource(id, resourceDetails);
        return updatedResource != null ? ResponseEntity.ok(updatedResource) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        courseService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{courseId}/resources")
    public ResponseEntity<Void> updateResources(@PathVariable Long courseId, @RequestBody List<ResourceRequest> resourceRequests) {
        // Check if the course belongs to the instructor
        Optional<Course> existingCourse = courseService.getCourseById(courseId);
        if (existingCourse.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        // Assuming the instructorId is passed in the request, but since it's a list, we need to check from the first item or add it to the request
        // For now, assuming the frontend sends instructorId in the request body or we can get it from the course
        // To simplify, let's assume the request includes instructorId, but since it's not, we can skip for now or add it.
        // Actually, since updateResources is called with resourceRequests, and each has createdBy, we can use that.
        // But to be consistent, let's add a check if the course's instructorId matches the request's instructorId.
        // Since resourceRequests have createdBy, we can use that as instructorId.
        if (!resourceRequests.isEmpty() && !existingCourse.get().getInstructorId().equals(resourceRequests.get(0).getCreatedBy())) {
            return ResponseEntity.status(403).build(); // Forbidden
        }

        courseService.updateResourcesAndDeleteCourseIfEmpty(courseId, resourceRequests);
        return ResponseEntity.ok().build();
    }
}

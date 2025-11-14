package com.eduveda.enrollmentprogress.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eduveda.enrollmentprogress.dto.EnrollmentRequest;
import com.eduveda.enrollmentprogress.entity.Enrollment;
import com.eduveda.enrollmentprogress.service.EnrollmentService;

@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<List<Enrollment>> getAllEnrollments(@RequestParam(required = false) Long userId) {
        List<Enrollment> enrollments;
        if (userId != null) {
            enrollments = enrollmentService.getEnrollmentsByStudentId(userId);
        } else {
            enrollments = enrollmentService.getAllEnrollments();
        }
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getEnrollmentById(@PathVariable Long id) {
        Optional<Enrollment> enrollment = enrollmentService.getEnrollmentById(id);
        return enrollment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByCourseId(@PathVariable Long courseId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByCourseId(courseId);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByStudentId(@PathVariable Long studentId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudentId(studentId);
        return ResponseEntity.ok(enrollments);
    }

    @PostMapping
    public ResponseEntity<Enrollment> createEnrollment(@RequestBody EnrollmentRequest enrollmentRequest) {
        Enrollment enrollment = new Enrollment(
            enrollmentRequest.getStudentId(),
            enrollmentRequest.getCourseId(),
            enrollmentRequest.getStatus() != null ? enrollmentRequest.getStatus() : "active"
        );
        enrollment.setCreatedBy(enrollmentRequest.getCreatedBy());
        enrollment.setUpdatedBy(enrollmentRequest.getUpdatedBy());
        Enrollment savedEnrollment = enrollmentService.createEnrollment(enrollment);
        return ResponseEntity.ok(savedEnrollment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Enrollment> updateEnrollment(@PathVariable Long id, @RequestBody EnrollmentRequest enrollmentRequest) {
        Enrollment enrollmentDetails = new Enrollment(
            enrollmentRequest.getStudentId(),
            enrollmentRequest.getCourseId(),
            enrollmentRequest.getStatus()
        );
        enrollmentDetails.setUpdatedBy(enrollmentRequest.getUpdatedBy());
        Enrollment updatedEnrollment = enrollmentService.updateEnrollment(id, enrollmentDetails);
        return updatedEnrollment != null ? ResponseEntity.ok(updatedEnrollment) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.noContent().build();
    }
}

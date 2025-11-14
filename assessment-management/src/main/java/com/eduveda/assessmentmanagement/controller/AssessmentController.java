package com.eduveda.assessmentmanagement.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

import com.eduveda.assessmentmanagement.dto.AssessmentRequest;
import com.eduveda.assessmentmanagement.entity.Assessment;
import com.eduveda.assessmentmanagement.service.AssessmentService;
import com.fasterxml.jackson.core.JsonProcessingException;

@RestController
@RequestMapping("/api/v1/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @GetMapping
    public ResponseEntity<List<Assessment>> getAllAssessments() {
        List<Assessment> assessments = assessmentService.getAllAssessments();
        return ResponseEntity.ok(assessments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assessment> getAssessmentById(@PathVariable Long id) {
        Optional<Assessment> assessment = assessmentService.getAssessmentById(id);
        return assessment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assessment>> getAssessmentsByCourseId(@PathVariable Long courseId) {
        List<Assessment> assessments = assessmentService.getAssessmentsByCourseId(courseId);
        return ResponseEntity.ok(assessments);
    }

    @PostMapping
    public ResponseEntity<Assessment> createAssessment(@RequestBody AssessmentRequest request) throws JsonProcessingException {
        Assessment assessment = assessmentService.createAssessment(request);
        return ResponseEntity.ok(assessment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assessment> updateAssessment(@PathVariable Long id, @RequestBody AssessmentRequest request) throws JsonProcessingException {
        Assessment updated = assessmentService.updateAssessment(id, request);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssessment(@PathVariable Long id) {
        assessmentService.deleteAssessment(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/course/{courseId}")
    public ResponseEntity<Void> updateAssessmentsForCourse(@PathVariable Long courseId, @RequestBody List<AssessmentRequest> assessmentRequests) throws JsonProcessingException {
        assessmentService.updateAssessmentsForCourse(courseId, assessmentRequests);
        return ResponseEntity.ok().build();
    }
}

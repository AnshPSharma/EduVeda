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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eduveda.assessmentmanagement.dto.AssessmentProgressRequest;
import com.eduveda.assessmentmanagement.dto.AssessmentProgressResponse;
import com.eduveda.assessmentmanagement.entity.AssessmentProgress;
import com.eduveda.assessmentmanagement.service.AssessmentProgressService;

@RestController
@RequestMapping("/api/v1/assessment-progress")
public class AssessmentProgressController {

    @Autowired
    private AssessmentProgressService assessmentProgressService;

    @GetMapping
    public ResponseEntity<List<AssessmentProgressResponse>> getAssessmentProgress(@RequestParam Long user_id, @RequestParam Long course_id) {
        List<AssessmentProgress> progressList = assessmentProgressService.getAssessmentProgressByUserIdAndCourseId(user_id, course_id);
        List<AssessmentProgressResponse> response = progressList.stream().map(this::convertToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentProgressResponse> getAssessmentProgressById(@PathVariable Long id) {
        Optional<AssessmentProgress> assessmentProgress = assessmentProgressService.getAssessmentProgressById(id);
        return assessmentProgress.map(ap -> ResponseEntity.ok(convertToResponse(ap))).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AssessmentProgressResponse> createAssessmentProgress(@RequestBody AssessmentProgressRequest request) {
        AssessmentProgress assessmentProgress = new AssessmentProgress(
            request.getUserId(),
            request.getAssessmentId(),
            request.getCourseId(),
            request.getScore(),
            request.getMaxScore(),
            request.getPercentage(),
            request.getPassed(),
            request.getAttemptNumber()
        );
        assessmentProgress.setCompletedAt(request.getCompletedAt());
        assessmentProgress.setCreatedBy(request.getCreatedBy());
        assessmentProgress.setUpdatedBy(request.getUpdatedBy());
        AssessmentProgress saved = assessmentProgressService.createAssessmentProgress(assessmentProgress);
        return ResponseEntity.ok(convertToResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentProgressResponse> updateAssessmentProgress(@PathVariable Long id, @RequestBody AssessmentProgressRequest request) {
        AssessmentProgress assessmentProgressDetails = new AssessmentProgress(
            request.getUserId(),
            request.getAssessmentId(),
            request.getCourseId(),
            request.getScore(),
            request.getMaxScore(),
            request.getPercentage(),
            request.getPassed(),
            request.getAttemptNumber()
        );
        assessmentProgressDetails.setCompletedAt(request.getCompletedAt());
        assessmentProgressDetails.setUpdatedBy(request.getUpdatedBy());
        AssessmentProgress updated = assessmentProgressService.updateAssessmentProgress(id, assessmentProgressDetails);
        return updated != null ? ResponseEntity.ok(convertToResponse(updated)) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssessmentProgress(@PathVariable Long id) {
        assessmentProgressService.deleteAssessmentProgress(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAssessmentProgressByUserAndCourse(@RequestParam Long user_id, @RequestParam Long course_id) {
        assessmentProgressService.deleteByUserIdAndCourseId(user_id, course_id);
        return ResponseEntity.noContent().build();
    }

    private AssessmentProgressResponse convertToResponse(AssessmentProgress ap) {
        return new AssessmentProgressResponse(
            ap.getId(),
            ap.getUserId(),
            ap.getAssessmentId(),
            ap.getCourseId(),
            ap.getScore(),
            ap.getMaxScore(),
            ap.getPercentage(),
            ap.getPassed(),
            ap.getAttemptNumber(),
            ap.getCompletedAt(),
            ap.getCreatedAt(),
            ap.getUpdatedAt(),
            ap.getCreatedBy(),
            ap.getUpdatedBy(),
            ap.getVersion()
        );
    }
}

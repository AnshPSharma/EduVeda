package com.eduveda.assessmentmanagement.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.eduveda.assessmentmanagement.entity.AssessmentProgress;
import com.eduveda.assessmentmanagement.repository.AssessmentProgressRepository;

@Service
public class AssessmentProgressService {

    @Autowired
    private AssessmentProgressRepository assessmentProgressRepository;

    @Autowired
    private RestTemplate restTemplate;

    public List<AssessmentProgress> getAllAssessmentProgress() {
        return assessmentProgressRepository.findAll();
    }

    public Optional<AssessmentProgress> getAssessmentProgressById(Long id) {
        return assessmentProgressRepository.findById(id);
    }

    public List<AssessmentProgress> getAssessmentProgressByUserIdAndCourseId(Long userId, Long courseId) {
        // Validate user and course exist via respective services
        try {
            restTemplate.getForObject("http://USER-MANAGEMENT-SERVICE/api/v1/users/" + userId, Object.class);
            restTemplate.getForObject("http://COURSE-MANAGEMENT-SERVICE/api/v1/courses/" + courseId, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("User or Course not found");
        }

        return assessmentProgressRepository.findByUserIdAndCourseId(userId, courseId);
    }

    public AssessmentProgress getLatestAttemptByUserIdAndAssessmentId(Long userId, Long assessmentId) {
        List<AssessmentProgress> attempts = assessmentProgressRepository.findByUserIdAndAssessmentId(userId, assessmentId);
        return attempts.stream().max((a1, a2) -> Integer.compare(a1.getAttemptNumber(), a2.getAttemptNumber())).orElse(null);
    }

    public List<AssessmentProgress> getAssessmentProgressByUserId(Long userId) {
        // Validate user exists
        try {
            restTemplate.getForObject("http://USER-MANAGEMENT-SERVICE/api/v1/users/" + userId, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("User not found");
        }

        return assessmentProgressRepository.findByUserId(userId);
    }

    public List<AssessmentProgress> getAssessmentProgressByCourseId(Long courseId) {
        // Validate course exists
        try {
            restTemplate.getForObject("http://COURSE-MANAGEMENT-SERVICE/api/v1/courses/" + courseId, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("Course not found");
        }

        return assessmentProgressRepository.findByCourseId(courseId);
    }

    @Transactional
    public AssessmentProgress createAssessmentProgress(AssessmentProgress assessmentProgress) {
        // Validate user, assessment, course exist
        try {
            restTemplate.getForObject("http://USER-MANAGEMENT-SERVICE/api/v1/users/" + assessmentProgress.getUserId(), Object.class);
            restTemplate.getForObject("http://COURSE-MANAGEMENT-SERVICE/api/v1/courses/" + assessmentProgress.getCourseId(), Object.class);
            // Assuming assessment exists in this service, but could validate via internal repo
        } catch (Exception e) {
            throw new RuntimeException("User, Course, or Assessment not found");
        }

        return assessmentProgressRepository.save(assessmentProgress);
    }

    @Transactional
    public AssessmentProgress updateAssessmentProgress(Long id, AssessmentProgress assessmentProgressDetails) {
        Optional<AssessmentProgress> optionalAssessmentProgress = assessmentProgressRepository.findById(id);
        if (optionalAssessmentProgress.isPresent()) {
            AssessmentProgress assessmentProgress = optionalAssessmentProgress.get();
            assessmentProgress.setUserId(assessmentProgressDetails.getUserId());
            assessmentProgress.setAssessmentId(assessmentProgressDetails.getAssessmentId());
            assessmentProgress.setCourseId(assessmentProgressDetails.getCourseId());
            assessmentProgress.setScore(assessmentProgressDetails.getScore());
            assessmentProgress.setMaxScore(assessmentProgressDetails.getMaxScore());
            assessmentProgress.setPercentage(assessmentProgressDetails.getPercentage());
            assessmentProgress.setPassed(assessmentProgressDetails.getPassed());
            assessmentProgress.setAttemptNumber(assessmentProgressDetails.getAttemptNumber());
            assessmentProgress.setCompletedAt(assessmentProgressDetails.getCompletedAt());
            assessmentProgress.setUpdatedBy(assessmentProgressDetails.getUpdatedBy());
            return assessmentProgressRepository.save(assessmentProgress);
        }
        return null;
    }

    @Transactional
    public void deleteAssessmentProgress(Long id) {
        assessmentProgressRepository.deleteById(id);
    }

    @Transactional
    public void deleteByUserIdAndCourseId(Long userId, Long courseId) {
        assessmentProgressRepository.deleteByUserIdAndCourseId(userId, courseId);
    }
}

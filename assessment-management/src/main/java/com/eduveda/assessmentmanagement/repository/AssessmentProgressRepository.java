package com.eduveda.assessmentmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eduveda.assessmentmanagement.entity.AssessmentProgress;

@Repository
public interface AssessmentProgressRepository extends JpaRepository<AssessmentProgress, Long> {

    List<AssessmentProgress> findByUserIdAndCourseId(Long userId, Long courseId);

    List<AssessmentProgress> findByUserId(Long userId);

    List<AssessmentProgress> findByCourseId(Long courseId);

    List<AssessmentProgress> findByUserIdAndAssessmentId(Long userId, Long assessmentId);

    void deleteByUserIdAndCourseId(Long userId, Long courseId);
}

package com.eduveda.enrollmentprogress.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eduveda.enrollmentprogress.entity.ModuleProgress;

@Repository
public interface ModuleProgressRepository extends JpaRepository<ModuleProgress, Long> {
    List<ModuleProgress> findByUserIdAndCourseId(Long userId, Long courseId);
    List<ModuleProgress> findByUserId(Long userId);
    List<ModuleProgress> findByCourseId(Long courseId);
    ModuleProgress findByUserIdAndResourceId(Long userId, Long resourceId);
    void deleteByUserIdAndCourseId(Long userId, Long courseId);
}

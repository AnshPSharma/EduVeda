package com.eduveda.enrollmentprogress.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eduveda.enrollmentprogress.entity.ModuleProgress;
import com.eduveda.enrollmentprogress.repository.ModuleProgressRepository;

@Service
public class ModuleProgressService {

    @Autowired
    private ModuleProgressRepository moduleProgressRepository;

    public List<ModuleProgress> getAllModuleProgress() {
        return moduleProgressRepository.findAll();
    }

    public Optional<ModuleProgress> getModuleProgressById(Long id) {
        return moduleProgressRepository.findById(id);
    }

    public List<ModuleProgress> getModuleProgressByUserIdAndCourseId(Long userId, Long courseId) {
        return moduleProgressRepository.findByUserIdAndCourseId(userId, courseId);
    }

    public List<ModuleProgress> getModuleProgressByUserId(Long userId) {
        return moduleProgressRepository.findByUserId(userId);
    }

    public List<ModuleProgress> getModuleProgressByCourseId(Long courseId) {
        return moduleProgressRepository.findByCourseId(courseId);
    }

    public ModuleProgress getModuleProgressByUserIdAndResourceId(Long userId, Long resourceId) {
        return moduleProgressRepository.findByUserIdAndResourceId(userId, resourceId);
    }

    @Transactional
    public ModuleProgress createOrUpdateModuleProgress(ModuleProgress moduleProgress) {
        ModuleProgress existing = moduleProgressRepository.findByUserIdAndResourceId(moduleProgress.getUserId(), moduleProgress.getResourceId());
        if (existing != null) {
            existing.setCompleted(moduleProgress.getCompleted());
            if (moduleProgress.getCompleted()) {
                existing.setCompletedAt(LocalDateTime.now());
            }
            existing.setUpdatedBy(moduleProgress.getUpdatedBy());
            return moduleProgressRepository.save(existing);
        } else {
            if (moduleProgress.getCompleted()) {
                moduleProgress.setCompletedAt(LocalDateTime.now());
            }
            return moduleProgressRepository.save(moduleProgress);
        }
    }

    @Transactional
    public ModuleProgress updateModuleProgress(Long id, ModuleProgress moduleProgressDetails) {
        Optional<ModuleProgress> optionalModuleProgress = moduleProgressRepository.findById(id);
        if (optionalModuleProgress.isPresent()) {
            ModuleProgress moduleProgress = optionalModuleProgress.get();
            moduleProgress.setUserId(moduleProgressDetails.getUserId());
            moduleProgress.setResourceId(moduleProgressDetails.getResourceId());
            moduleProgress.setCourseId(moduleProgressDetails.getCourseId());
            moduleProgress.setCompleted(moduleProgressDetails.getCompleted());
            if (moduleProgressDetails.getCompleted()) {
                moduleProgress.setCompletedAt(LocalDateTime.now());
            }
            moduleProgress.setUpdatedBy(moduleProgressDetails.getUpdatedBy());
            return moduleProgressRepository.save(moduleProgress);
        }
        return null;
    }

    @Transactional
    public void deleteModuleProgress(Long id) {
        moduleProgressRepository.deleteById(id);
    }

    @Transactional
    public void deleteByUserIdAndCourseId(Long userId, Long courseId) {
        moduleProgressRepository.deleteByUserIdAndCourseId(userId, courseId);
    }
}

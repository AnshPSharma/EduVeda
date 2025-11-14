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
import org.springframework.web.bind.annotation.RestController;

import com.eduveda.enrollmentprogress.dto.ModuleProgressRequest;
import com.eduveda.enrollmentprogress.entity.ModuleProgress;
import com.eduveda.enrollmentprogress.service.ModuleProgressService;

@RestController
@RequestMapping("/api/v1/module-progress")
public class ModuleProgressController {

    @Autowired
    private ModuleProgressService moduleProgressService;

    @GetMapping
    public ResponseEntity<List<ModuleProgress>> getAllModuleProgress() {
        List<ModuleProgress> moduleProgressList = moduleProgressService.getAllModuleProgress();
        return ResponseEntity.ok(moduleProgressList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleProgress> getModuleProgressById(@PathVariable Long id) {
        Optional<ModuleProgress> moduleProgress = moduleProgressService.getModuleProgressById(id);
        return moduleProgress.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<List<ModuleProgress>> getModuleProgressByUserIdAndCourseId(@PathVariable Long userId, @PathVariable Long courseId) {
        List<ModuleProgress> moduleProgressList = moduleProgressService.getModuleProgressByUserIdAndCourseId(userId, courseId);
        return ResponseEntity.ok(moduleProgressList);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ModuleProgress>> getModuleProgressByUserId(@PathVariable Long userId) {
        List<ModuleProgress> moduleProgressList = moduleProgressService.getModuleProgressByUserId(userId);
        return ResponseEntity.ok(moduleProgressList);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ModuleProgress>> getModuleProgressByCourseId(@PathVariable Long courseId) {
        List<ModuleProgress> moduleProgressList = moduleProgressService.getModuleProgressByCourseId(courseId);
        return ResponseEntity.ok(moduleProgressList);
    }

    @PostMapping
    public ResponseEntity<ModuleProgress> createOrUpdateModuleProgress(@RequestBody ModuleProgressRequest moduleProgressRequest) {
        ModuleProgress moduleProgress = new ModuleProgress(
            moduleProgressRequest.getUserId(),
            moduleProgressRequest.getResourceId(),
            moduleProgressRequest.getCourseId(),
            moduleProgressRequest.getCompleted()
        );
        moduleProgress.setCreatedBy(moduleProgressRequest.getCreatedBy());
        moduleProgress.setUpdatedBy(moduleProgressRequest.getUpdatedBy());
        ModuleProgress savedModuleProgress = moduleProgressService.createOrUpdateModuleProgress(moduleProgress);
        return ResponseEntity.ok(savedModuleProgress);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuleProgress> updateModuleProgress(@PathVariable Long id, @RequestBody ModuleProgressRequest moduleProgressRequest) {
        ModuleProgress moduleProgressDetails = new ModuleProgress(
            moduleProgressRequest.getUserId(),
            moduleProgressRequest.getResourceId(),
            moduleProgressRequest.getCourseId(),
            moduleProgressRequest.getCompleted()
        );
        moduleProgressDetails.setUpdatedBy(moduleProgressRequest.getUpdatedBy());
        ModuleProgress updatedModuleProgress = moduleProgressService.updateModuleProgress(id, moduleProgressDetails);
        return updatedModuleProgress != null ? ResponseEntity.ok(updatedModuleProgress) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModuleProgress(@PathVariable Long id) {
        moduleProgressService.deleteModuleProgress(id);
        return ResponseEntity.noContent().build();
    }
}

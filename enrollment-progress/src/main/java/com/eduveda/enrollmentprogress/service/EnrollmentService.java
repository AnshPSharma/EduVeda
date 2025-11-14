
package com.eduveda.enrollmentprogress.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.eduveda.enrollmentprogress.entity.Enrollment;
import com.eduveda.enrollmentprogress.repository.EnrollmentRepository;

// Add imports for notification and course DTOs
import com.eduveda.enrollmentprogress.dto.CourseDto;
import com.eduveda.enrollmentprogress.dto.NotificationRequestDto;
import com.eduveda.enrollmentprogress.dto.UserDto;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ModuleProgressService moduleProgressService;

    @Autowired
    private RestTemplate restTemplate;

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    public Optional<Enrollment> getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id);
    }

    public List<Enrollment> getEnrollmentsByStudentId(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getEnrollmentsByCourseId(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    public List<Enrollment> getEnrollmentsByStudentIdAndCourseId(Long studentId, Long courseId) {
        return enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    @Transactional
    public Enrollment createEnrollment(Enrollment enrollment) {
        // Check if enrollment already exists
        List<Enrollment> existingEnrollments = enrollmentRepository.findByStudentIdAndCourseId(enrollment.getStudentId(), enrollment.getCourseId());
        if (!existingEnrollments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Enrollment already exists for this student and course");
        }

        // Validate student exists via user-management service
        String userServiceUrl = "http://USER-MANAGEMENT-SERVICE/api/v1/users/" + enrollment.getStudentId();
        try {
            restTemplate.getForObject(userServiceUrl, Object.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }

        // Validate course exists via course-management service
        String courseServiceUrl = "http://COURSE-MANAGEMENT-SERVICE/api/v1/courses/" + enrollment.getCourseId();
        try {
            restTemplate.getForObject(courseServiceUrl, Object.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Create notification for instructor
        try {
            // Fetch course details to get instructor ID
            String courseDetailsUrl = "http://COURSE-MANAGEMENT-SERVICE/api/v1/courses/" + enrollment.getCourseId();
            CourseDto course = restTemplate.getForObject(courseDetailsUrl, CourseDto.class);

            // Fetch student details to get student name
            String studentDetailsUrl = "http://USER-MANAGEMENT-SERVICE/api/v1/users/" + enrollment.getStudentId();
            UserDto student = restTemplate.getForObject(studentDetailsUrl, UserDto.class);

            if (course != null && course.getInstructorId() != null && student != null) {
                // Create notification request
                NotificationRequestDto notificationRequest = new NotificationRequestDto();
                notificationRequest.setUserId(course.getInstructorId());
                notificationRequest.setRelatedEntityId(enrollment.getCourseId());
                notificationRequest.setRelatedEntityType("course");
                notificationRequest.setTitle("New Student Enrollment");
                notificationRequest.setMessage(student.getName() + " has enrolled in your course \"" + course.getTitle() + "\".");
                notificationRequest.setType("enrollment");
                notificationRequest.setCreatedBy(enrollment.getCreatedBy());

                // Send notification to notification-announcement service
                String notificationUrl = "http://NOTIFICATION-ANNOUNCEMENT-SERVICE/api/v1/notifications";
                restTemplate.postForObject(notificationUrl, notificationRequest, String.class);
            }
        } catch (Exception e) {
            // Log error but don't fail enrollment
            System.err.println("Failed to create enrollment notification: " + e.getMessage());
        }

        return savedEnrollment;
    }

    @Transactional
    public Enrollment updateEnrollment(Long id, Enrollment enrollmentDetails) {
        Optional<Enrollment> optionalEnrollment = enrollmentRepository.findById(id);
        if (optionalEnrollment.isPresent()) {
            Enrollment enrollment = optionalEnrollment.get();
            enrollment.setStudentId(enrollmentDetails.getStudentId());
            enrollment.setCourseId(enrollmentDetails.getCourseId());
            enrollment.setStatus(enrollmentDetails.getStatus());
            enrollment.setUpdatedBy(enrollmentDetails.getUpdatedBy());
            return enrollmentRepository.save(enrollment);
        }
        return null;
    }

    @Transactional
    public void deleteEnrollment(Long id) {
        Optional<Enrollment> enrollment = enrollmentRepository.findById(id);
        if (enrollment.isPresent()) {
            // Delete associated module progress
            moduleProgressService.deleteByUserIdAndCourseId(enrollment.get().getStudentId(), enrollment.get().getCourseId());
            // Delete associated assessment progress via assessment-management service
            try {
                restTemplate.delete("http://ASSESSMENT-MANAGEMENT-SERVICE/api/v1/assessment-progress?user_id=" + enrollment.get().getStudentId() + "&course_id=" + enrollment.get().getCourseId());
            } catch (Exception e) {
                // Log error but don't fail the unenrollment
                System.err.println("Failed to delete assessment progress for user " + enrollment.get().getStudentId() + " and course " + enrollment.get().getCourseId());
            }
            enrollmentRepository.deleteById(id);
        }
    }
}

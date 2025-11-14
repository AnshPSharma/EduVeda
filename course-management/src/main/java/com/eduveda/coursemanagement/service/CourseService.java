package com.eduveda.coursemanagement.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.eduveda.coursemanagement.entity.Course;
import com.eduveda.coursemanagement.entity.Resource;
import com.eduveda.coursemanagement.repository.CourseRepository;
import com.eduveda.coursemanagement.repository.ResourceRepository;
import com.eduveda.coursemanagement.dto.NotificationRequestDto;
import com.eduveda.coursemanagement.dto.EnrollmentDto;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private RestTemplate restTemplate;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public List<Course> getCoursesByInstructorId(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    @Transactional
    public Course createCourse(Course course) {
        // Validate instructor exists via user-management service
        String userServiceUrl = "http://USER-MANAGEMENT-SERVICE/api/v1/users/" + course.getInstructorId();
        try {
            restTemplate.getForObject(userServiceUrl, Object.class);
        } catch (Exception e) {
            // Log the error but allow course creation for now
            System.err.println("Warning: Could not validate instructor: " + e.getMessage());
        }
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long id, Course courseDetails) {
        Optional<Course> optionalCourse = courseRepository.findById(id);
        if (optionalCourse.isPresent()) {
            Course oldCourse = optionalCourse.get();
            Course course = optionalCourse.get();
            course.setTitle(courseDetails.getTitle());
            course.setDescription(courseDetails.getDescription());
            course.setPrice(courseDetails.getPrice());
            course.setImage(courseDetails.getImage());
            course.setRating(courseDetails.getRating());
            course.setInstructor(courseDetails.getInstructor());
            course.setInstructorId(courseDetails.getInstructorId());
            course.setUpdatedBy(courseDetails.getUpdatedBy());
            Course updatedCourse = courseRepository.save(course);

            // Check for general updates and notify enrolled students
            boolean hasGeneralUpdate = !oldCourse.getTitle().equals(updatedCourse.getTitle()) ||
                                       !oldCourse.getDescription().equals(updatedCourse.getDescription()) ||
                                       !oldCourse.getPrice().equals(updatedCourse.getPrice()) ||
                                       !oldCourse.getImage().equals(updatedCourse.getImage());

            if (hasGeneralUpdate) {
                // Fetch enrolled students for the course
                try {
                    String enrollmentUrl = "http://ENROLLMENT-PROGRESS-SERVICE/api/v1/enrollments/course/" + updatedCourse.getId();
                    EnrollmentDto[] enrollments = restTemplate.getForObject(enrollmentUrl, EnrollmentDto[].class);
                    if (enrollments != null) {
                        for (EnrollmentDto enrollment : enrollments) {
                            // Create notification request for each student
                            NotificationRequestDto notificationRequest = new NotificationRequestDto();
                            notificationRequest.setUserId(enrollment.getStudentId());
                            notificationRequest.setRelatedEntityId(updatedCourse.getId());
                            notificationRequest.setRelatedEntityType("course");
                            notificationRequest.setTitle("Course Updated");
                            notificationRequest.setMessage("The course \"" + updatedCourse.getTitle() + "\" has been updated with new information.");
                            notificationRequest.setType("course_update");
                            notificationRequest.setCreatedBy(updatedCourse.getUpdatedBy());

                            // Send notification to notification-announcement service
                            String notificationUrl = "http://NOTIFICATION-ANNOUNCEMENT-SERVICE/api/v1/notifications";
                            restTemplate.postForObject(notificationUrl, notificationRequest, String.class);
                        }
                    }
                } catch (Exception e) {
                    // Log error but don't fail course update
                    System.err.println("Failed to create course update notifications: " + e.getMessage());
                }
            }

            return updatedCourse;
        }
        return null;
    }

    @Transactional
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    // Resource methods
    public List<Resource> getResourcesByCourseId(Long courseId) {
        return resourceRepository.findByCourseId(courseId);
    }

    @Transactional
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource updateResource(Long id, Resource resourceDetails) {
        Optional<Resource> optionalResource = resourceRepository.findById(id);
        if (optionalResource.isPresent()) {
            Resource oldResource = optionalResource.get();
            Resource resource = optionalResource.get();
            resource.setTitle(resourceDetails.getTitle());
            resource.setDuration(resourceDetails.getDuration());
            resource.setYoutubeId(resourceDetails.getYoutubeId());
            resource.setUpdatedBy(resourceDetails.getUpdatedBy());
            Resource updatedResource = resourceRepository.save(resource);

            // Check if resource content changed and notify enrolled students
            boolean hasContentChange = !oldResource.getTitle().equals(updatedResource.getTitle()) ||
                                       !oldResource.getDuration().equals(updatedResource.getDuration()) ||
                                       !oldResource.getYoutubeId().equals(updatedResource.getYoutubeId());

            if (hasContentChange) {
                // Fetch enrolled students for the course
                try {
                    String enrollmentUrl = "http://ENROLLMENT-PROGRESS-SERVICE/api/v1/enrollments/course/" + updatedResource.getCourseId();
                    EnrollmentDto[] enrollments = restTemplate.getForObject(enrollmentUrl, EnrollmentDto[].class);
                    if (enrollments != null) {
                        for (EnrollmentDto enrollment : enrollments) {
                            // Create notification request for each student
                            NotificationRequestDto notificationRequest = new NotificationRequestDto();
                            notificationRequest.setUserId(enrollment.getStudentId());
                            notificationRequest.setRelatedEntityId(updatedResource.getCourseId());
                            notificationRequest.setRelatedEntityType("course");
                            notificationRequest.setTitle("Course Content Updated");
                            notificationRequest.setMessage("The video \"" + updatedResource.getTitle() + "\" in course has been updated.");
                            notificationRequest.setType("course_update");
                            notificationRequest.setCreatedBy(updatedResource.getUpdatedBy());

                            // Send notification to notification-announcement service
                            String notificationUrl = "http://NOTIFICATION-ANNOUNCEMENT-SERVICE/api/v1/notifications";
                            restTemplate.postForObject(notificationUrl, notificationRequest, String.class);
                        }
                    }
                } catch (Exception e) {
                    // Log error but don't fail resource update
                    System.err.println("Failed to create resource update notifications: " + e.getMessage());
                }
            }

            return updatedResource;
        }
        return null;
    }

    @Transactional
    public void deleteResource(Long id) {
        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isPresent()) {
            Resource resource = resourceOpt.get();
            resourceRepository.deleteById(id);

            // Notify enrolled students about the deleted resource
            try {
                String enrollmentUrl = "http://ENROLLMENT-PROGRESS-SERVICE/api/v1/enrollments/course/" + resource.getCourseId();
                EnrollmentDto[] enrollments = restTemplate.getForObject(enrollmentUrl, EnrollmentDto[].class);
                if (enrollments != null) {
                    for (EnrollmentDto enrollment : enrollments) {
                        // Create notification request for each student
                        NotificationRequestDto notificationRequest = new NotificationRequestDto();
                        notificationRequest.setUserId(enrollment.getStudentId());
                        notificationRequest.setRelatedEntityId(resource.getCourseId());
                        notificationRequest.setRelatedEntityType("course");
                        notificationRequest.setTitle("Course Content Updated");
                        notificationRequest.setMessage("The resource \"" + resource.getTitle() + "\" has been removed from the course.");
                        notificationRequest.setType("course_update");
                        notificationRequest.setCreatedBy(resource.getCreatedBy());

                        // Send notification to notification-announcement service
                        String notificationUrl = "http://NOTIFICATION-ANNOUNCEMENT-SERVICE/api/v1/notifications";
                        restTemplate.postForObject(notificationUrl, notificationRequest, String.class);
                    }
                }
            } catch (Exception e) {
                // Log error but don't fail resource deletion
                System.err.println("Failed to create resource deletion notifications: " + e.getMessage());
            }
        }
    }

    public String extractYouTubeId(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                "^.*(youtu\\.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|\\&v=)([^#\\&\\?]*).*"
            );
            java.util.regex.Matcher matcher = pattern.matcher(url);
            if (matcher.matches()) {
                return matcher.group(2);
            }
        } catch (Exception e) {
            // Log or handle exception if needed
        }
        return null;
    }

    @Transactional
    public void updateResourcesAndDeleteCourseIfEmpty(Long courseId, List<com.eduveda.coursemanagement.dto.ResourceRequest> resourceRequests) {
        // Get existing resources before deletion
        List<Resource> existingResources = resourceRepository.findByCourseId(courseId);
        List<String> existingTitles = existingResources.stream().map(Resource::getTitle).toList();

        // Delete existing resources for the course
        resourceRepository.deleteAll(existingResources);

        // Add new resources
        List<String> addedTitles = new java.util.ArrayList<>();
        for (com.eduveda.coursemanagement.dto.ResourceRequest request : resourceRequests) {
            String youtubeId = extractYouTubeId(request.getYoutubeLink());
            if (youtubeId != null) {
                Resource resource = new Resource(
                    courseId,
                    request.getTitle(),
                    request.getDuration(),
                    youtubeId
                );
                resource.setCreatedBy(request.getCreatedBy());
                resource.setUpdatedBy(request.getUpdatedBy());
                resourceRepository.save(resource);
                addedTitles.add(request.getTitle());
            }
        }

        // Determine deleted titles: existing titles not in added titles
        List<String> deletedTitles = existingTitles.stream()
            .filter(title -> !addedTitles.contains(title))
            .toList();

        // Determine added titles: added titles not in existing titles
        List<String> addedTitlesList = addedTitles.stream()
            .filter(title -> !existingTitles.contains(title))
            .toList();

        // If no resources were added, delete the course
        boolean willDeleteCourse = resourceRequests.isEmpty() || resourceRequests.stream().allMatch(req -> extractYouTubeId(req.getYoutubeLink()) == null);
        if (willDeleteCourse) {
            courseRepository.deleteById(courseId);
        } else {
            // Notify enrolled students about resource updates if there are changes and course is not deleted
            try {
                String enrollmentUrl = "http://ENROLLMENT-PROGRESS-SERVICE/api/v1/enrollments/course/" + courseId;
                EnrollmentDto[] enrollments = restTemplate.getForObject(enrollmentUrl, EnrollmentDto[].class);
                if (enrollments != null) {
                    Long updatedBy = resourceRequests.stream().findFirst().map(com.eduveda.coursemanagement.dto.ResourceRequest::getUpdatedBy).orElse(null);

                    if (updatedBy != null) {
                        // Notify for additions
                        if (!addedTitlesList.isEmpty()) {
                            String message = "New resources have been added to the course: " + String.join(", ", addedTitlesList) + ".";

                            NotificationRequestDto notificationRequest = new NotificationRequestDto();
                            notificationRequest.setRelatedEntityId(courseId);
                            notificationRequest.setRelatedEntityType("course");
                            notificationRequest.setTitle("Course Content Updated");
                            notificationRequest.setMessage(message);
                            notificationRequest.setType("course_update");
                            notificationRequest.setCreatedBy(updatedBy);

                            // Notify all enrolled students
                            for (EnrollmentDto enrollment : enrollments) {
                                notificationRequest.setUserId(enrollment.getStudentId());
                                String notificationUrl = "http://NOTIFICATION-ANNOUNCEMENT-SERVICE/api/v1/notifications";
                                restTemplate.postForObject(notificationUrl, notificationRequest, String.class);
                            }
                        }

                        // Notify for deletions
                        if (!deletedTitles.isEmpty()) {
                            String message = "The following resources have been removed from the course: " + String.join(", ", deletedTitles) + ".";

                            NotificationRequestDto notificationRequest = new NotificationRequestDto();
                            notificationRequest.setRelatedEntityId(courseId);
                            notificationRequest.setRelatedEntityType("course");
                            notificationRequest.setTitle("Course Content Updated");
                            notificationRequest.setMessage(message);
                            notificationRequest.setType("course_update");
                            notificationRequest.setCreatedBy(updatedBy);

                            // Notify all enrolled students
                            for (EnrollmentDto enrollment : enrollments) {
                                notificationRequest.setUserId(enrollment.getStudentId());
                                String notificationUrl = "http://NOTIFICATION-ANNOUNCEMENT-SERVICE/api/v1/notifications";
                                restTemplate.postForObject(notificationUrl, notificationRequest, String.class);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Log error but don't fail resource update
                System.err.println("Failed to create resource update notifications: " + e.getMessage());
            }
        }
    }
}

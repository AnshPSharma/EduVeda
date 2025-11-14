package com.eduveda.assessmentmanagement.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.eduveda.assessmentmanagement.dto.AssessmentRequest;
import com.eduveda.assessmentmanagement.entity.Assessment;
import com.eduveda.assessmentmanagement.repository.AssessmentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

// Add imports for notification and enrollment DTOs
import com.eduveda.assessmentmanagement.dto.EnrollmentDto;
import com.eduveda.assessmentmanagement.dto.NotificationRequestDto;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    public Optional<Assessment> getAssessmentById(Long id) {
        return assessmentRepository.findById(id);
    }

    public List<Assessment> getAssessmentsByCourseId(Long courseId) {
        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
        // Deserialize questions for each assessment
        for (Assessment assessment : assessments) {
            try {
                List<AssessmentRequest.Question> questions = objectMapper.readValue(assessment.getQuestionsJson(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, AssessmentRequest.Question.class));
                assessment.setQuestions(questions);
            } catch (JsonProcessingException e) {
                // Handle error
                assessment.setQuestions(List.of());
            }
        }
        return assessments;
    }

    @Transactional
    public Assessment createAssessment(AssessmentRequest assessmentRequest) throws JsonProcessingException {
        String questionsJson = objectMapper.writeValueAsString(assessmentRequest.getQuestions());
        List<String> correctAnswers = assessmentRequest.getQuestions().stream()
            .map(AssessmentRequest.Question::getAnswer)
            .toList();
        String correctAnswersJson = objectMapper.writeValueAsString(correctAnswers);

        Assessment assessment = new Assessment(
            assessmentRequest.getCourseId(),
            assessmentRequest.getTitle(),
            assessmentRequest.getDescription(),
            questionsJson,
            correctAnswersJson,
            correctAnswers.size(),
            assessmentRequest.getCreatedBy()
        );
        assessment.setUpdatedBy(assessmentRequest.getUpdatedBy());
        Assessment savedAssessment = assessmentRepository.save(assessment);

        // Create notifications for all enrolled students
        try {
            // Fetch enrolled students for the course
            String enrollmentUrl = "http://ENROLLMENT-PROGRESS-SERVICE/api/v1/enrollments/course/" + assessmentRequest.getCourseId();
            EnrollmentDto[] enrollments = restTemplate.getForObject(enrollmentUrl, EnrollmentDto[].class);
            if (enrollments != null) {
                for (EnrollmentDto enrollment : enrollments) {
                    // Create notification request for each student
                    NotificationRequestDto notificationRequest = new NotificationRequestDto();
                    notificationRequest.setUserId(enrollment.getStudentId());
                    notificationRequest.setRelatedEntityId(savedAssessment.getId());
                    notificationRequest.setRelatedEntityType("assessment");
                    notificationRequest.setTitle("New Assessment Available");
                    notificationRequest.setMessage("A new assessment has been added to your course: " + assessmentRequest.getTitle());
                    notificationRequest.setType("assessment");
                    notificationRequest.setCreatedBy(assessmentRequest.getCreatedBy());

                    // Send notification to notification-announcement service
                    String notificationUrl = "http://NOTIFICATION-ANNOUNCEMENT-SERVICE/api/v1/notifications";
                    restTemplate.postForObject(notificationUrl, notificationRequest, String.class);
                }
            }
        } catch (Exception e) {
            // Log error but don't fail assessment creation
            System.err.println("Failed to create assessment notifications: " + e.getMessage());
        }

        return savedAssessment;
    }

    @Transactional
    public Assessment updateAssessment(Long id, AssessmentRequest assessmentRequest) throws JsonProcessingException {
        Optional<Assessment> optionalAssessment = assessmentRepository.findById(id);
        if (optionalAssessment.isPresent()) {
            Assessment assessment = optionalAssessment.get();

            assessment.setTitle(assessmentRequest.getTitle());
            assessment.setDescription(assessmentRequest.getDescription());
            String questionsJson = objectMapper.writeValueAsString(assessmentRequest.getQuestions());
            assessment.setQuestionsJson(questionsJson);
            List<String> correctAnswers = assessmentRequest.getQuestions().stream()
                .map(AssessmentRequest.Question::getAnswer)
                .toList();
            String correctAnswersJson = objectMapper.writeValueAsString(correctAnswers);
            assessment.setCorrectAnswersJson(correctAnswersJson);
            assessment.setMaxScore(correctAnswers.size());
            assessment.setUpdatedBy(assessmentRequest.getUpdatedBy());
            Assessment updatedAssessment = assessmentRepository.save(assessment);

            return updatedAssessment;
        }
        return null;
    }

    @Transactional
    public void deleteAssessment(Long id) {
        assessmentRepository.deleteById(id);
    }

    @Transactional
    public void updateAssessmentsForCourse(Long courseId, List<AssessmentRequest> assessmentRequests) throws JsonProcessingException {
        // Validate assessment requests
        for (AssessmentRequest request : assessmentRequests) {
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Assessment title cannot be empty");
            }
            if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
                throw new IllegalArgumentException("Assessment must have at least one question");
            }
            for (AssessmentRequest.Question q : request.getQuestions()) {
                if (q.getText() == null || q.getText().trim().isEmpty()) {
                    throw new IllegalArgumentException("Question text cannot be empty");
                }
                if (q.getOptions() == null || q.getOptions().size() < 2) {
                    throw new IllegalArgumentException("Question must have at least two options");
                }
                if (q.getAnswer() == null || q.getAnswer().trim().isEmpty()) {
                    throw new IllegalArgumentException("Question must have a correct answer");
                }
            }
        }

        // Get existing assessments
        List<Assessment> existingAssessments = assessmentRepository.findByCourseId(courseId);
        List<String> existingTitles = existingAssessments.stream().map(Assessment::getTitle).toList();

        // Prepare lists for notifications
        List<String> addedTitles = new java.util.ArrayList<>();
        List<String> updatedTitles = new java.util.ArrayList<>();
        List<String> deletedTitles = new java.util.ArrayList<>();

        // Process each request
        for (AssessmentRequest request : assessmentRequests) {
            String title = request.getTitle();
            Optional<Assessment> existingOpt = existingAssessments.stream()
                .filter(a -> a.getTitle().equals(title))
                .findFirst();

            if (existingOpt.isPresent()) {
                // Update existing assessment
                Assessment existing = existingOpt.get();
                String oldDescription = existing.getDescription();
                String oldQuestionsJson = existing.getQuestionsJson();

                existing.setDescription(request.getDescription());
                String questionsJson = objectMapper.writeValueAsString(request.getQuestions());
                existing.setQuestionsJson(questionsJson);
                List<String> correctAnswers = request.getQuestions().stream()
                    .map(AssessmentRequest.Question::getAnswer)
                    .toList();
                String correctAnswersJson = objectMapper.writeValueAsString(correctAnswers);
                existing.setCorrectAnswersJson(correctAnswersJson);
                existing.setMaxScore(correctAnswers.size());
                existing.setUpdatedBy(request.getUpdatedBy());
                assessmentRepository.save(existing);

                // Check if updated
                boolean descriptionChanged = !oldDescription.equals(request.getDescription());
                boolean questionsChanged = !oldQuestionsJson.equals(questionsJson);
                if (descriptionChanged || questionsChanged) {
                    updatedTitles.add(title);
                }
            } else {
                // Create new assessment
                Assessment assessment = new Assessment(
                    courseId,
                    request.getTitle(),
                    request.getDescription(),
                    objectMapper.writeValueAsString(request.getQuestions()),
                    objectMapper.writeValueAsString(request.getQuestions().stream().map(AssessmentRequest.Question::getAnswer).toList()),
                    request.getQuestions().size(),
                    request.getCreatedBy()
                );
                assessment.setUpdatedBy(request.getUpdatedBy());
                assessmentRepository.save(assessment);
                addedTitles.add(title);
            }
        }

        // Delete assessments not in requests
        for (Assessment existing : existingAssessments) {
            String title = existing.getTitle();
            boolean stillExists = assessmentRequests.stream().anyMatch(req -> req.getTitle().equals(title));
            if (!stillExists) {
                assessmentRepository.deleteById(existing.getId());
                deletedTitles.add(title);
            }
        }

        // Notify enrolled students about assessment updates
        try {
            // Fetch enrolled students for the course
            String enrollmentUrl = "http://ENROLLMENT-PROGRESS-SERVICE/api/v1/enrollments/course/" + courseId;
            EnrollmentDto[] enrollments = restTemplate.getForObject(enrollmentUrl, EnrollmentDto[].class);
            if (enrollments != null) {
                Long updatedBy = assessmentRequests.stream().findFirst().map(AssessmentRequest::getUpdatedBy).orElse(null);

                if (updatedBy != null) {
                    // Notify for additions
                    if (!addedTitles.isEmpty()) {
                        String addedTitlesStr = String.join(", ", addedTitles);
                        NotificationRequestDto notificationRequest = new NotificationRequestDto();
                        notificationRequest.setRelatedEntityId(courseId);
                        notificationRequest.setRelatedEntityType("course");
                        notificationRequest.setTitle("New Assessments Added");
                        notificationRequest.setMessage("New assessments have been added to the course: " + addedTitlesStr);
                        notificationRequest.setType("course_update");
                        notificationRequest.setCreatedBy(updatedBy);

                        // Notify all enrolled students
                        for (EnrollmentDto enrollment : enrollments) {
                            notificationRequest.setUserId(enrollment.getStudentId());
                            String notificationUrl = "http://NOTIFICATION-ANNOUNCEMENT-SERVICE/api/v1/notifications";
                            restTemplate.postForObject(notificationUrl, notificationRequest, String.class);
                        }
                    }

                    // Notify for updates
                    if (!updatedTitles.isEmpty()) {
                        String updatedTitlesStr = String.join(", ", updatedTitles);
                        NotificationRequestDto notificationRequest = new NotificationRequestDto();
                        notificationRequest.setRelatedEntityId(courseId);
                        notificationRequest.setRelatedEntityType("course");
                        notificationRequest.setTitle("Assessments Updated");
                        notificationRequest.setMessage("The following assessments have been updated: " + updatedTitlesStr);
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
                        String deletedTitlesStr = String.join(", ", deletedTitles);
                        NotificationRequestDto notificationRequest = new NotificationRequestDto();
                        notificationRequest.setRelatedEntityId(courseId);
                        notificationRequest.setRelatedEntityType("course");
                        notificationRequest.setTitle("Assessments Removed");
                        notificationRequest.setMessage("The following assessments have been removed: " + deletedTitlesStr);
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
            // Log error but don't fail the update
            System.err.println("Failed to send notifications for assessment updates: " + e.getMessage());
        }
    }
}

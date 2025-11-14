package com.eduveda.assessmentmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AssessmentManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(AssessmentManagementApplication.class, args);
    }

}

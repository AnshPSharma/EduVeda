package com.eduveda.usermanagement.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eduveda.usermanagement.dto.DeleteUserRequest;
import com.eduveda.usermanagement.dto.SignupRequest;
import com.eduveda.usermanagement.entity.User;
import com.eduveda.usermanagement.entity.UserRole;
import com.eduveda.usermanagement.repository.UserRepository;
import com.eduveda.usermanagement.service.UserRoleService;
import com.eduveda.usermanagement.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRoleService userRoleService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUsers(@RequestParam(required = false) String email) {
        if (email != null) {
            Optional<User> user = userService.findByEmail(email);
            if (user.isPresent()) {
                return ResponseEntity.ok(List.of(user.get()));
            } else {
                return ResponseEntity.ok(List.of());
            }
        }
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody SignupRequest signupRequest) {
        // Validation logic moved from frontend
        String name = signupRequest.getName();
        String email = signupRequest.getEmail();
        String password = signupRequest.getPassword();
        String role = signupRequest.getRole();

        if (name == null || name.trim().isEmpty() ||
            email == null || email.trim().isEmpty() ||
            password == null || password.trim().isEmpty() ||
            role == null || role.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("All fields are required");
        }

        // Email validation: must end with @gmail.com
        if (!email.matches("^[^\s@]+@gmail\\.com$")) {
            return ResponseEntity.badRequest().body("Email must end with @gmail.com");
        }

        if (!password.matches("^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\[\\]{};:\\\\|,.<>/?]).{8,}$")) {
            return ResponseEntity.badRequest().body("Password must be at least 8 characters long, include one uppercase letter, one number, and one special character");
        }

        // Check if user already exists
        if (userService.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists. Please login.");
        }

        // Create user
        User savedUser = userService.createUser(email, password, name, email); // username as email
        // Assign role based on the role field
        String roleName = role.toLowerCase();
        Long roleId = roleName.equals("student") ? 1L : 2L;
        UserRole userRole = new UserRole(savedUser.getId(), roleId, roleName);
        userRoleService.save(userRole);
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updateUser) {
        try {
            Optional<User> existing = userService.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            User user = existing.get();
            user.setName(updateUser.getName());
            user.setEmail(updateUser.getEmail());
            user.setBio(updateUser.getBio());
            if (updateUser.getPasswordHash() != null && !updateUser.getPasswordHash().isEmpty()) {
                // Clear previous password history if needed (assuming no history table, just update)
                user.setPasswordHash(passwordEncoder.encode(updateUser.getPasswordHash()));
            }
            User saved = userRepository.save(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestBody DeleteUserRequest deleteRequest) {
        try {
            Optional<User> userOpt = userService.findById(id);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            User user = userOpt.get();
            if (!userService.checkPassword(user, deleteRequest.getPassword())) {
                return ResponseEntity.status(401).body("Incorrect password");
            }
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }
}

package com.eduveda.usermanagement.controller;

import com.eduveda.usermanagement.dto.LoginRequest;
import com.eduveda.usermanagement.dto.LoginResponse;
import com.eduveda.usermanagement.dto.SignupRequest;
import com.eduveda.usermanagement.entity.User;
import com.eduveda.usermanagement.entity.UserRole;
import com.eduveda.usermanagement.service.UserService;
import com.eduveda.usermanagement.service.UserRoleService;
import com.eduveda.usermanagement.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRoleService userRoleService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        // Validation logic moved from frontend
        if (username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        // Email format validation
        if (!username.matches("^[^\s@]+@gmail\\.com$")) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        if (!password.matches("^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\[\\]{};':\"\\\\|,.<>/?]).{8,}$")) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        Optional<User> userOpt = userService.findByEmail(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (userService.checkPassword(user, password)) {
                List<UserRole> userRoles = userRoleService.findByUserId(user.getId());
                String role = "Student";
                if (!userRoles.isEmpty()) {
                    Long roleId = userRoles.get(0).getRoleId();
                    if (roleId == 1L) {
                        role = "Student";
                    } else if (roleId == 2L) {
                        role = "Instructor";
                    } else if (roleId == 3L) {
                        role = "Admin";
                    }
                }
                String token = jwtUtil.generateToken(user.getEmail(), user.getId(), role);
                LoginResponse response = new LoginResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getName(),
                        user.getUsername(),
                        token,
                        role
                );
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody SignupRequest signupRequest) {
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

    @DeleteMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }
}

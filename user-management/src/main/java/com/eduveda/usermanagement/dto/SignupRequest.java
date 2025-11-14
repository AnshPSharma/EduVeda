package com.eduveda.usermanagement.dto;

public class SignupRequest {
    private String name;
    private String role;
    private String email;
    private String password;
    private String username;

    // Constructors Change
    public SignupRequest() {}

    public SignupRequest(String name, String role, String email, String password, String username) {
        this.name = name;
        this.role = role;
        this.email = email;
        this.password = password;
        this.username = username;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}

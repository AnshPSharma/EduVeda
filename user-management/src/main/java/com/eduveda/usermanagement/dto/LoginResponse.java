package com.eduveda.usermanagement.dto;

public class LoginResponse {
    private Long id;
    private String email;
    private String name;
    private String username;
    private String token;
    private String role;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(Long id, String email, String name, String username, String token, String role) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.username = username;
        this.token = token;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

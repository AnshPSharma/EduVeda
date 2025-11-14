package com.eduveda.usermanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eduveda.usermanagement.entity.UserRole;
import com.eduveda.usermanagement.repository.UserRoleRepository;

@Service
public class UserRoleService {

    @Autowired
    private UserRoleRepository userRoleRepository;

    public List<UserRole> findByUserId(Long userId) {
        return userRoleRepository.findByUserId(userId);
    }

    public List<UserRole> findByUserIdIn(List<Long> userIds) {
        return userRoleRepository.findByUserIdIn(userIds);
    }

    public UserRole save(UserRole userRole) {
        return userRoleRepository.save(userRole);
    }

    public void delete(UserRole userRole) {
        userRoleRepository.delete(userRole);
    }

    public void deleteAll(List<UserRole> userRoles) {
        userRoleRepository.deleteAll(userRoles);
    }
}

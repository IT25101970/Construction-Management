package com.example.Construction_Managemnet.user.service;

import com.example.Construction_Managemnet.user.model.UserAccount;
import com.example.Construction_Managemnet.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final UserAccountRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public List<UserAccount> getAllUsers() {
        return userRepository.findByIsDeletedFalseOrderByIdAsc();
    }

    public UserAccount getUserById(Long id) {
        return userRepository.findById(id).filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
                .orElseThrow(() -> new com.example.Construction_Managemnet.common.exception.ResourceNotFoundException("User not found with ID: " + id));
    }

    @Transactional
    public UserAccount createUser(UserAccount user) {
        user.setId(null);
        user.setIsDeleted(false);
        if (user.getStatus() == null || user.getStatus().isBlank()) {
            user.setStatus("ACTIVE");
        }
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("PM");
        }
        validate(user);
        user.setPassword(hashPassword(user.getPassword()));
        return userRepository.save(user);
    }

    @Transactional
    public UserAccount updateUser(Long id, UserAccount updated) {
        validate(updated);
        UserAccount existing = getUserById(id);
        protectLastAdmin(existing, updated.getRole(), updated.getStatus());
        existing.setUsername(updated.getUsername());
        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setRole(updated.getRole());
        existing.setStatus(updated.getStatus());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(hashPassword(updated.getPassword()));
        }
        return userRepository.save(existing);
    }

    @Transactional
    public UserAccount toggleStatus(Long id) {
        UserAccount existing = getUserById(id);
        protectLastAdmin(existing, existing.getRole(), "ACTIVE".equals(existing.getStatus()) ? "INACTIVE" : "ACTIVE");
        existing.setStatus("ACTIVE".equalsIgnoreCase(existing.getStatus()) ? "INACTIVE" : "ACTIVE");
        return userRepository.save(existing);
    }

    @Transactional
    public void deleteUser(Long id) {
        UserAccount existing = getUserById(id);
        protectLastAdmin(existing, existing.getRole(), "INACTIVE");
        existing.setIsDeleted(true);
        existing.setStatus("INACTIVE");
        userRepository.save(existing);
    }

    private void protectLastAdmin(UserAccount user, String nextRole, String nextStatus) {
        if ("ADMIN".equals(user.getRole()) && "ACTIVE".equals(user.getStatus())
                && (!"ADMIN".equals(nextRole) || !"ACTIVE".equals(nextStatus))
                && userRepository.countByRoleAndStatusAndIsDeletedFalse("ADMIN", "ACTIVE") <= 1) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "Keep at least one active administrator");
        }
    }

    private String hashPassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 72) {
            throw new IllegalArgumentException("Password must contain 8 to 72 characters");
        }
        return passwordEncoder.encode(password);
    }

    private void validate(UserAccount user) {
        if (user.getRole() == null || !java.util.Set.of("ADMIN", "PM", "SUPERVISOR", "CLIENT").contains(user.getRole())) {
            throw new IllegalArgumentException("Invalid user role");
        }
        if (user.getStatus() == null || !java.util.Set.of("ACTIVE", "INACTIVE").contains(user.getStatus())) {
            throw new IllegalArgumentException("Invalid account status");
        }
    }
}

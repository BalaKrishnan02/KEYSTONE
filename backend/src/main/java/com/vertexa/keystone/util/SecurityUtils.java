package com.vertexa.keystone.util;

import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.domain.enums.UserRole;
import com.vertexa.keystone.repository.UserRepository;
import com.vertexa.keystone.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public UserRole getCurrentUserRole() {
        return getCurrentUser().getRole();
    }

    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("No authenticated user found");
    }
}

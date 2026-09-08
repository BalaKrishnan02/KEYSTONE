package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.User;
import com.vertexa.keystone.dto.auth.LoginRequest;
import com.vertexa.keystone.dto.auth.LoginResponse;
import com.vertexa.keystone.repository.UserRepository;
import com.vertexa.keystone.security.JwtTokenProvider;
import com.vertexa.keystone.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import com.vertexa.keystone.repository.CustomerRepository;
import com.vertexa.keystone.dto.auth.RegisterRequest;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SecurityUtils securityUtils;

    @Value("${keystone.jwt.expiration}")
    private long jwtExpiration;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Registering new user: {} with role: {}", email, request.getRole());

        if (userRepository.findByEmail(email).isPresent()) {
            throw new com.vertexa.keystone.exception.DuplicateResourceException("Email is already registered");
        }

        Long customerId = null;

        if (request.getRole() == com.vertexa.keystone.domain.enums.UserRole.CUSTOMER) {
            String orgName = request.getOrganizationName();
            if (orgName == null || orgName.trim().isEmpty()) {
                orgName = request.getName();
                if (customerRepository.existsByOrganizationName(orgName)) {
                    orgName = request.getName() + " (" + email + ")";
                }
            } else if (customerRepository.existsByOrganizationName(orgName.trim())) {
                throw new com.vertexa.keystone.exception.DuplicateResourceException("Organization name is already registered");
            }

            String phone = (request.getPhone() != null && !request.getPhone().trim().isEmpty())
                    ? request.getPhone().trim() : "N/A";
            String address = (request.getAddress() != null && !request.getAddress().trim().isEmpty())
                    ? request.getAddress().trim() : "N/A";

            // Create and save Customer
            com.vertexa.keystone.domain.Customer customer = com.vertexa.keystone.domain.Customer.builder()
                    .organizationName(orgName.trim())
                    .contactName(request.getName().trim())
                    .email(email)
                    .phone(phone)
                    .address(address)
                    .active(true)
                    .build();
            customer = customerRepository.save(customer);
            customerId = customer.getId();
        }

        // Create and save User
        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .customerId(customerId)
                .build();
        userRepository.save(user);

        log.info("User created successfully. Autologinning: {}", email);

        // Log the user in
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(request.getPassword());
        return login(loginRequest);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Authenticating user: {}", email);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(userDetails);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .customerId(user.getCustomerId())
                .build();

        LoginResponse response = LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .user(userInfo)
                .build();

        log.info("User authenticated successfully: {}", request.getEmail());
        return response;
    }

    @Transactional(readOnly = true)
    public LoginResponse.UserInfo getCurrentUser() {
        User user = securityUtils.getCurrentUser();
        return LoginResponse.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .customerId(user.getCustomerId())
                .build();
    }
}

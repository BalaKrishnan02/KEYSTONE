package com.vertexa.keystone.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    private UserDetails userDetails;
    private static final String TEST_EMAIL = "technician@keystone.com";
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION_MS = 86400000L;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", SECRET_KEY);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", EXPIRATION_MS);

        userDetails = User.builder()
                .username(TEST_EMAIL)
                .password("password123")
                .authorities(Collections.emptyList())
                .build();
    }

    @Test
    @DisplayName("Generate token from UserDetails produces non-null token")
    void generateTokenFromUserDetails() {
        String token = jwtTokenProvider.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    @DisplayName("Generate token contains correct email claim")
    void generateTokenContainsEmail() {
        String token = jwtTokenProvider.generateToken(userDetails);

        String extractedEmail = jwtTokenProvider.getEmailFromToken(token);

        assertEquals(TEST_EMAIL, extractedEmail);
    }

    @Test
    @DisplayName("Extract email from token returns correct value")
    void extractEmailFromToken() {
        String token = jwtTokenProvider.generateToken(userDetails);

        String email = jwtTokenProvider.getEmailFromToken(token);

        assertEquals(TEST_EMAIL, email);
    }

    @Test
    @DisplayName("Validate valid token returns true")
    void validateValidToken() {
        String token = jwtTokenProvider.generateToken(userDetails);

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    @DisplayName("Validate expired token returns false")
    void validateExpiredToken() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", -1L);

        String token = jwtTokenProvider.generateToken(userDetails);

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Validate tampered token returns false")
    void validateTamperedToken() {
        String token = jwtTokenProvider.generateToken(userDetails);

        String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";

        boolean isValid = jwtTokenProvider.validateToken(tamperedToken);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Validate completely invalid token returns false")
    void validateCompletelyInvalidToken() {
        boolean isValid = jwtTokenProvider.validateToken("not.a.valid.jwt.token");

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Validate empty token returns false")
    void validateEmptyToken() {
        boolean isValid = jwtTokenProvider.validateToken("");

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Validate null token throws exception or returns false")
    void validateNullToken() {
        boolean isValid = jwtTokenProvider.validateToken(null);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Token expiration date is in the future")
    void tokenExpirationIsInFuture() {
        String token = jwtTokenProvider.generateToken(userDetails);

        assertFalse(jwtTokenProvider.isTokenExpired(token));
    }

    @Test
    @DisplayName("Token is marked expired when expiration is in the past")
    void expiredTokenIsExpired() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", -1L);

        String token = jwtTokenProvider.generateToken(userDetails);

        assertTrue(jwtTokenProvider.isTokenExpired(token));
    }

    @Test
    @DisplayName("Get expiration date from token returns a date")
    void getExpirationDateFromToken() {
        String token = jwtTokenProvider.generateToken(userDetails);

        var expirationDate = jwtTokenProvider.getExpirationDateFromToken(token);

        assertNotNull(expirationDate);
        assertTrue(expirationDate.after(new java.util.Date()));
    }

    @Test
    @DisplayName("Generate different tokens for different users")
    void differentUsersGetDifferentTokens() {
        UserDetails anotherUser = User.builder()
                .username("manager@keystone.com")
                .password("password123")
                .authorities(Collections.emptyList())
                .build();

        String token1 = jwtTokenProvider.generateToken(userDetails);
        String token2 = jwtTokenProvider.generateToken(anotherUser);

        assertFalse(token1.equals(token2));
    }

    @Test
    @DisplayName("Same user generates consistent email extraction")
    void consistentEmailExtraction() {
        String token = jwtTokenProvider.generateToken(userDetails);

        String email1 = jwtTokenProvider.getEmailFromToken(token);
        String email2 = jwtTokenProvider.getEmailFromToken(token);

        assertEquals(email1, email2);
    }
}

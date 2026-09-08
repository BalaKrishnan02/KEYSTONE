package com.vertexa.keystone.dto.user;

import com.vertexa.keystone.domain.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private boolean active;
    private Long customerId;
    private Instant createdAt;
    private Instant updatedAt;
}

package com.vertexa.keystone.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
    name = "customers",
    uniqueConstraints = @UniqueConstraint(name = "uk_customers_org_name", columnNames = "organization_name"),
    indexes = {
        @Index(name = "idx_customers_org_name", columnList = "organization_name"),
        @Index(name = "idx_customers_email", columnList = "email")
    }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends BaseEntity {

    @NotBlank
    @Column(name = "organization_name", nullable = false, unique = true)
    private String organizationName;

    @NotBlank
    @Column(name = "contact_name", nullable = false)
    private String contactName;

    @NotBlank
    @Email
    @Column(name = "email", nullable = false)
    private String email;

    @NotBlank
    @Column(name = "phone", nullable = false)
    private String phone;

    @NotBlank
    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
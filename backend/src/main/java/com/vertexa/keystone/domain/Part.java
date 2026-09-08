package com.vertexa.keystone.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(
    name = "parts",
    uniqueConstraints = @UniqueConstraint(name = "uk_parts_code", columnNames = "part_code"),
    indexes = {
        @Index(name = "idx_parts_code", columnList = "part_code"),
        @Index(name = "idx_parts_name", columnList = "name")
    }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Part extends BaseEntity {

    @NotBlank
    @Column(name = "part_code", nullable = false, unique = true, length = 50)
    private String partCode;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "unit_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCost;

    @NotNull
    @Min(0)
    @Column(name = "available_stock", nullable = false)
    private Integer availableStock = 0;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
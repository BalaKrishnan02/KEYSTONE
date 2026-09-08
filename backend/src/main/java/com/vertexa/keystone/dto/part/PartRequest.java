package com.vertexa.keystone.dto.part;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartRequest {

    @NotBlank
    private String partCode;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @DecimalMin("0")
    private BigDecimal unitCost;

    @NotNull
    @Min(0)
    private Integer availableStock;
}

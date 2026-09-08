package com.vertexa.keystone.dto.partusage;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartUsageRequest {

    @NotNull
    private Long partId;

    @NotNull
    @Min(1)
    private Integer quantity;
}

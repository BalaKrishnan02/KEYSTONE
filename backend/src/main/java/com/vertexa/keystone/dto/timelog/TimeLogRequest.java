package com.vertexa.keystone.dto.timelog;

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
public class TimeLogRequest {

    @NotNull
    @Min(1)
    private Integer minutes;

    private String note;
}

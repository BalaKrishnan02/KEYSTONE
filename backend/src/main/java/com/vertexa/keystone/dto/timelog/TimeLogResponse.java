package com.vertexa.keystone.dto.timelog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeLogResponse {

    private Long id;
    private Long workOrderId;
    private Long technicianId;
    private String technicianName;
    private Integer minutes;
    private String note;
    private Instant loggedAt;
}

package com.vertexa.keystone.service;

import com.vertexa.keystone.domain.WorkOrder;
import com.vertexa.keystone.domain.enums.Priority;
import com.vertexa.keystone.domain.enums.SLAState;
import com.vertexa.keystone.domain.enums.WorkOrderStatus;
import com.vertexa.keystone.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class SlaServiceTest {

    @Mock
    private WorkOrderRepository workOrderRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private SlaService slaService;

    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(slaService, "lowHours", 72L);
        ReflectionTestUtils.setField(slaService, "mediumHours", 24L);
        ReflectionTestUtils.setField(slaService, "highHours", 8L);
        ReflectionTestUtils.setField(slaService, "criticalHours", 2L);

        workOrder = WorkOrder.builder()
                .id(500L)
                .workOrderCode("WO-2026-000001")
                .title("HVAC Repair")
                .priority(Priority.HIGH)
                .status(WorkOrderStatus.IN_PROGRESS)
                .build();
    }

    @Nested
    @DisplayName("calculateSlaDueDate")
    class CalculateSlaDueDate {

        @Test
        @DisplayName("LOW priority: 72 hours due date")
        void lowPriorityDueDate() {
            Instant before = Instant.now().plus(Duration.ofHours(72)).minusSeconds(5);
            Instant result = slaService.calculateSlaDueDate(Priority.LOW);
            Instant after = Instant.now().plus(Duration.ofHours(72)).plusSeconds(5);

            assertTrue(result.isAfter(before) && result.isBefore(after));
        }

        @Test
        @DisplayName("MEDIUM priority: 24 hours due date")
        void mediumPriorityDueDate() {
            Instant before = Instant.now().plus(Duration.ofHours(24)).minusSeconds(5);
            Instant result = slaService.calculateSlaDueDate(Priority.MEDIUM);
            Instant after = Instant.now().plus(Duration.ofHours(24)).plusSeconds(5);

            assertTrue(result.isAfter(before) && result.isBefore(after));
        }

        @Test
        @DisplayName("HIGH priority: 8 hours due date")
        void highPriorityDueDate() {
            Instant before = Instant.now().plus(Duration.ofHours(8)).minusSeconds(5);
            Instant result = slaService.calculateSlaDueDate(Priority.HIGH);
            Instant after = Instant.now().plus(Duration.ofHours(8)).plusSeconds(5);

            assertTrue(result.isAfter(before) && result.isBefore(after));
        }

        @Test
        @DisplayName("CRITICAL priority: 2 hours due date")
        void criticalPriorityDueDate() {
            Instant before = Instant.now().plus(Duration.ofHours(2)).minusSeconds(5);
            Instant result = slaService.calculateSlaDueDate(Priority.CRITICAL);
            Instant after = Instant.now().plus(Duration.ofHours(2)).plusSeconds(5);

            assertTrue(result.isAfter(before) && result.isBefore(after));
        }
    }

    @Nested
    @DisplayName("getSlaState")
    class GetSlaState {

        @Test
        @DisplayName("Returns ON_TRACK when far from due date")
        void onTrackWhenFarFromDue() {
            workOrder.setSlaDueDate(Instant.now().plus(Duration.ofHours(10)));

            SLAState state = slaService.getSlaState(workOrder);

            assertEquals(SLAState.ON_TRACK, state);
        }

        @Test
        @DisplayName("Returns ON_TRACK when null due date")
        void onTrackWhenNullDueDate() {
            workOrder.setSlaDueDate(null);

            SLAState state = slaService.getSlaState(workOrder);

            assertEquals(SLAState.ON_TRACK, state);
        }

        @Test
        @DisplayName("Returns AT_RISK when within 2 hours of due")
        void atRiskWhenWithin2Hours() {
            workOrder.setSlaDueDate(Instant.now().plus(Duration.ofMinutes(90)));

            SLAState state = slaService.getSlaState(workOrder);

            assertEquals(SLAState.AT_RISK, state);
        }

        @Test
        @DisplayName("Returns AT_RISK when exactly 2 hours remaining")
        void atRiskWhenExactly2Hours() {
            workOrder.setSlaDueDate(Instant.now().plus(Duration.ofHours(2)));

            SLAState state = slaService.getSlaState(workOrder);

            assertEquals(SLAState.AT_RISK, state);
        }

        @Test
        @DisplayName("Returns BREACHED when past due date")
        void breachedWhenPastDue() {
            workOrder.setSlaDueDate(Instant.now().minus(Duration.ofHours(1)));

            SLAState state = slaService.getSlaState(workOrder);

            assertEquals(SLAState.BREACHED, state);
        }

        @Test
        @DisplayName("Returns BREACHED when significantly past due")
        void breachedWhenSignificantlyPastDue() {
            workOrder.setSlaDueDate(Instant.now().minus(Duration.ofDays(5)));

            SLAState state = slaService.getSlaState(workOrder);

            assertEquals(SLAState.BREACHED, state);
        }

        @Test
        @DisplayName("ON_TRACK boundary: 3 hours remaining")
        void onTrackAtBoundary() {
            workOrder.setSlaDueDate(Instant.now().plus(Duration.ofHours(3)));

            SLAState state = slaService.getSlaState(workOrder);

            assertEquals(SLAState.ON_TRACK, state);
        }

        @Test
        @DisplayName("AT_RISK boundary: just under 2 hours remaining")
        void atRiskAtBoundary() {
            workOrder.setSlaDueDate(Instant.now().plus(Duration.ofHours(2)).minusSeconds(10));

            SLAState state = slaService.getSlaState(workOrder);

            assertEquals(SLAState.AT_RISK, state);
        }

        @Test
        @DisplayName("BREACHED boundary: just past due")
        void breachedAtBoundary() {
            workOrder.setSlaDueDate(Instant.now().minusSeconds(10));

            SLAState state = slaService.getSlaState(workOrder);

            assertEquals(SLAState.BREACHED, state);
        }
    }
}
